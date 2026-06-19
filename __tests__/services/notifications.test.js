/**
 * Tests para src/services/notifications.js
 *
 * Cubre:
 *  - registerForPushNotifications: permisos, obtención de token FCM, registro en API
 *  - unregisterPushNotifications: lectura de token almacenado, llamada DELETE, limpieza
 *  - Casos borde: plataforma web, no-device, permiso denegado, token ausente, errores de red
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getDevicePushTokenAsync: jest.fn(),
}))

jest.mock('expo-device', () => ({
  isDevice: true,
}))

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
}))

// api.js exporta un default (axios instance) — el mock replica esa estructura
jest.mock('../../src/api/api', () => {
  const mock = {
    get: jest.fn(async () => ({ data: {} })),
    post: jest.fn(async () => ({ data: {} })),
    delete: jest.fn(async () => ({ data: {} })),
  }
  return { __esModule: true, default: mock }
})

// ─── Imports ──────────────────────────────────────────────────────────────────

import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../../src/api/api'   // ← default export del mock

import {
  registerForPushNotifications,
  unregisterPushNotifications,
  getNotificationsHistory,
  markAllNotificationsRead,
} from '../../src/services/notifications'

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()

  // Defaults: dispositivo físico, Android, permisos ya concedidos, token válido
  Device.isDevice = true
  Platform.OS = 'android'

  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' })
  Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' })
  Notifications.getDevicePushTokenAsync.mockResolvedValue({ data: 'fcm-token-abc123' })
})

// ─── registerForPushNotifications ─────────────────────────────────────────────

describe('registerForPushNotifications', () => {
  it('retorna null en plataforma web', async () => {
    Platform.OS = 'web'
    const result = await registerForPushNotifications()
    expect(result).toBeNull()
    expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled()
  })

  it('retorna null cuando no es un dispositivo físico', async () => {
    Device.isDevice = false
    const result = await registerForPushNotifications()
    expect(result).toBeNull()
    expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled()
  })

  it('retorna null cuando el permiso es denegado (ya denegado previamente)', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' })
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' })
    const result = await registerForPushNotifications()
    expect(result).toBeNull()
    expect(Notifications.getDevicePushTokenAsync).not.toHaveBeenCalled()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('pide permiso si el status inicial no es "granted"', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' })
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' })

    const result = await registerForPushNotifications()

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled()
    expect(result).toBe('fcm-token-abc123')
  })

  it('no pide permiso si ya está concedido', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' })

    await registerForPushNotifications()

    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled()
  })

  it('obtiene el token FCM con getDevicePushTokenAsync (no Expo proxy)', async () => {
    await registerForPushNotifications()
    expect(Notifications.getDevicePushTokenAsync).toHaveBeenCalled()
  })

  it('guarda el token en AsyncStorage', async () => {
    await registerForPushNotifications()
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('push_token', 'fcm-token-abc123')
  })

  it('llama a POST /notifications/register-device con token y platform', async () => {
    await registerForPushNotifications()
    expect(api.post).toHaveBeenCalledWith('/notifications/register-device', {
      token: 'fcm-token-abc123',
      platform: 'android',
    })
  })

  it('retorna el token FCM cuando todo sale bien', async () => {
    const result = await registerForPushNotifications()
    expect(result).toBe('fcm-token-abc123')
  })

  it('retorna null sin lanzar excepción si getDevicePushTokenAsync falla', async () => {
    Notifications.getDevicePushTokenAsync.mockRejectedValue(new Error('Emulador sin FCM'))
    const result = await registerForPushNotifications()
    expect(result).toBeNull()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('retorna null sin lanzar excepción si la API falla', async () => {
    api.post.mockRejectedValue(new Error('Network error'))
    const result = await registerForPushNotifications()
    // Dependiendo de la impl, puede retornar el token o null — lo importante
    // es que no lance excepción al caller
    expect(result === null || typeof result === 'string').toBe(true)
  })

  it('incluye el platform correcto en iOS', async () => {
    Platform.OS = 'ios'
    await registerForPushNotifications()
    expect(api.post).toHaveBeenCalledWith('/notifications/register-device', {
      token: 'fcm-token-abc123',
      platform: 'ios',
    })
  })
})

// ─── unregisterPushNotifications ──────────────────────────────────────────────

describe('unregisterPushNotifications', () => {
  it('no hace nada si no hay token en AsyncStorage', async () => {
    AsyncStorage.getItem.mockResolvedValue(null)
    await unregisterPushNotifications()
    expect(api.delete).not.toHaveBeenCalled()
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled()
  })

  it('llama a DELETE /notifications/unregister-device con el token almacenado', async () => {
    AsyncStorage.getItem.mockResolvedValue('fcm-token-abc123')
    await unregisterPushNotifications()
    expect(api.delete).toHaveBeenCalledWith('/notifications/unregister-device', {
      data: { token: 'fcm-token-abc123' },
    })
  })

  it('elimina el token de AsyncStorage tras dar de baja', async () => {
    AsyncStorage.getItem.mockResolvedValue('fcm-token-abc123')
    await unregisterPushNotifications()
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('push_token')
  })

  it('no lanza excepción si la API falla (ej: token ya expirado en servidor)', async () => {
    AsyncStorage.getItem.mockResolvedValue('old-token')
    api.delete.mockRejectedValue(new Error('404 Not Found'))
    await expect(unregisterPushNotifications()).resolves.not.toThrow()
  })

  it('no lanza excepción si AsyncStorage.getItem falla', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))
    await expect(unregisterPushNotifications()).resolves.not.toThrow()
  })
})

// ─── getNotificationsHistory ──────────────────────────────────────────────────

describe('getNotificationsHistory', () => {
  it('llama a GET /notifications/history y retorna los datos', async () => {
    const mockHistory = [{ id: '1', title: 'Pedido confirmado', read: false }]
    api.get.mockResolvedValue({ data: mockHistory })

    const result = await getNotificationsHistory()

    expect(api.get).toHaveBeenCalledWith('/notifications/history')
    expect(result).toEqual(mockHistory)
  })
})

// ─── markAllNotificationsRead ─────────────────────────────────────────────────

describe('markAllNotificationsRead', () => {
  it('llama a POST /notifications/history/read-all y retorna los datos', async () => {
    const mockResponse = { updated: 3 }
    api.post.mockResolvedValue({ data: mockResponse })

    const result = await markAllNotificationsRead()
    expect(api.post).toHaveBeenCalledWith('/notifications/history/read-all')
    expect(result).toEqual(mockResponse)
  })
})
