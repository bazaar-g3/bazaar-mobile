import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
)

const BUCKET = process.env.EXPO_PUBLIC_SUPABASE_AVATARS_BUCKET || 'avatars'

/**
 * Sube una imagen al bucket de avatares en Supabase Storage.
 * @param {string} localUri  URI local del archivo (resultado de expo-image-picker)
 * @param {number} userId    ID del usuario — se usa como nombre de archivo para evitar duplicados
 * @returns {Promise<string>} URL pública del avatar subido
 */
export async function uploadAvatar(localUri, userId) {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg'
  const mimeTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  const contentType = mimeTypes[ext] ?? 'image/jpeg'

  // Nombre fijo por usuario: si sube una nueva imagen, sobreescribe la anterior
  const filePath = `user-${userId}.${ext}`

  // Convertir la URI local a ArrayBuffer para el upload
  const response = await fetch(localUri)
  const arrayBuffer = await response.arrayBuffer()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: true, // sobreescribe si ya existe
    })

  if (error) {
    // Mensajes comunes de Supabase traducidos
    if (error.message?.includes('Bucket not found')) {
      throw new Error('El bucket de imágenes no existe en Supabase. Crealo desde el panel.')
    }
    if (error.statusCode === '403' || error.message?.includes('not allowed') || error.message?.includes('policy')) {
      throw new Error('Sin permisos para subir imágenes. Revisá las políticas del bucket en Supabase.')
    }
    throw new Error(error.message ?? 'Error desconocido en Supabase Storage')
  }

  // Obtener la URL pública
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}
