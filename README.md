# Bazaar — Mobile App

Aplicación móvil para compradores y vendedores. Corre en Android e iOS con React Native + Expo.

## Stack
- React Native 0.74 + Expo 51
- expo-router para navegación
- expo-notifications para push notifications (FCM)
- axios para llamadas al API Gateway
- AsyncStorage para persistir el JWT

## Pantallas

| Pantalla | Descripción |
|----------|-------------|
| `LoginScreen` | Login con JWT |
| `HomeScreen` | Catálogo de productos |
| `ProductDetailScreen` | Detalle y agregar al carrito |
| `CartScreen` | Ver y editar carrito |
| `CheckoutScreen` | Confirmar compra (genera Idempotency-Key) |
| `OrdersScreen` | Historial de mis órdenes |
| `ProfileScreen` | Perfil y logout |

## Variables de entorno
Ver `.env.example`.

Se deben adjuntar las urls correspondientes para acceder a las APIs que componen el sistema. Para levantar el proyecto el producción, debe ser la URL del API Gateway.

## Setup local
```bash
cp .env.example .env
npm install
npx expo start
```

## Compilar para producción

### Deploy en plataforma web
```bash

```

### Deploy para APK
```bash
npx eas build --platform android
npx eas build --platform ios
```