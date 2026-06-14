import { Platform } from 'react-native'
import * as ExpoSecureStore from 'expo-secure-store'

// expo-secure-store has no web implementation; fall back to localStorage on web.
const webStore = {
  getItemAsync: (key) => Promise.resolve(localStorage.getItem(key)),
  setItemAsync: (key, value) => { localStorage.setItem(key, value); return Promise.resolve() },
  deleteItemAsync: (key) => { localStorage.removeItem(key); return Promise.resolve() },
}

export default Platform.OS === 'web' ? webStore : ExpoSecureStore
