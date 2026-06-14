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

## Probar la app en tu celular (Expo Go)

### 1. Instalá Expo Go

- **iPhone**: [Expo Go en App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Expo Go en Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2. Crear una cuenta en Expo

Entrá a [expo.dev](https://expo.dev) y registrate con tu email (es gratis). La vas a necesitar para autenticarte al levantar el servidor.

### 3. Configurá el proyecto

```bash
cp .env.example .env
```

Abrí el `.env` y completá las URLs con el backend de producción (las que apuntan a AWS Console):

```
EXPO_PUBLIC_API_GATEWAY_URL=https://<url-del-api-gateway>
EXPO_PUBLIC_CATALOG_API_URL=https://<url-del-api-gateway>
EXPO_PUBLIC_ORDERS_API_URL=https://<url-del-api-gateway>
```

instalar las dependencias:

```bash
npm install
```

### 4. Instalar el paquete de túnel

El modo túnel permite que el celular se conecte al servidor de desarrollo aunque no estén en la misma red WiFi.

```bash
npm install -g @expo/ngrok
```

### 5. Autenticate en Expo

```bash
npx expo login
```

Te va a pedir el email y contraseña de la cuenta que creaste en el paso 2.

### 6. Levantar la app con túnel

```bash
npx expo start --tunnel
```

Esperá a que aparezca el QR en la terminal (puede tardar unos segundos la primera vez).

### 7. Escaneá el QR

- **iPhone**: abrí la app de Cámara, apuntá al QR y tocá la notificación que aparece. En el navegador, seleccionar abrir con `Expo Go`
- **Android**: abrí Expo Go, tocá "Scan QR code" y escaneá.

---

> **Nota**: si al escanear el QR la camara del celular no lo reconoce, en la terminar donde esta corriendo el mobile escribir `s` para asegurar que se este levantando como un `development build`.

## Setup local

## Compilar para producción

### Deploy en plataforma web
```bash
npx expo export --platform web
vercel --prod
```

### Deploy para APK
```bash
npx eas build --platform android
npx eas build --platform ios
```
