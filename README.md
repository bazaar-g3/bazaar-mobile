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

## Setup local
```bash
cp .env.example .env
npm install
npx expo start
```

Escaneá el QR con la app **Expo Go** en tu celular.

## Notificaciones Push

Al hacer login se registra el FCM token del dispositivo en `notifications-api`.
Ver `src/services/notifications.js`.

Al hacer logout se desregistra el token (DELETE /notifications/unregister-device).

## Compilar para producción
```bash
npx eas build --platform android
npx eas build --platform ios
```

## Variables de entorno

Ver `.env.example`.
