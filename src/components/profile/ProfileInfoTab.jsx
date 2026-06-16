import React, { useMemo } from 'react'
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { useTheme } from '../../theme/ThemeContext'
import { makeStyles } from '../../styles/profile/profileStyles'
import ActiveProductsSummary from './ActiveProductsSummary'

const PLACEHOLDER_AVATAR =
  'https://ui-avatars.com/api/?background=69BDB6&color=fff&size=128&name='

export default function ProfileInfoTab({
  profile,
  editing,
  setEditing,
  fullName,
  setFullName,
  description,
  setDescription,
  avatarUri,
  saveSuccess,
  saveError,
  fieldErrors,
  setFieldErrors,
  saving,
  onPickImage,
  onSave,
  onCancel,
  activeProductsSummary,
  loadingActiveProductsSummary,
  activeProductsSummaryError,
  onReloadActiveProductsSummary,
  onOpenPublish,
  onGoToSalesTab,
}) {
  const { theme, mode, toggle } = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Información del perfil</Text>

        {!editing ? (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      {saveSuccess ? <Text style={styles.successText}>{saveSuccess}</Text> : null}
      {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                avatarUri ||
                `${PLACEHOLDER_AVATAR}${encodeURIComponent(fullName || 'U')}`,
            }}
            style={styles.avatarLarge}
          />

          {editing && (
            <TouchableOpacity
              style={styles.changePhotoOverlay}
              onPress={onPickImage}
            >
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileInfoText}>
          <Text style={styles.userName}>{profile?.fullName || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{profile?.email}</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre y Apellido</Text>

        {editing ? (
          <>
            <TextInput
              style={[styles.input, fieldErrors.fullName && styles.inputError]}
              value={fullName}
              onChangeText={(value) => {
                setFullName(value)
                setFieldErrors((errors) => ({
                  ...errors,
                  fullName: undefined,
                }))
              }}
              maxLength={50}
              placeholder="Ingresá tu nombre"
              placeholderTextColor={theme.color.textMuted}
            />

            {fieldErrors.fullName ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
            ) : null}
          </>
        ) : (
          <View style={styles.readonlyField}>
            <Text style={styles.valueText}>{fullName || 'No definido'}</Text>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descripción</Text>

        {editing ? (
          <>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                fieldErrors.description && styles.inputError,
              ]}
              value={description}
              onChangeText={(value) => {
                setDescription(value)
                setFieldErrors((errors) => ({
                  ...errors,
                  description: undefined,
                }))
              }}
              multiline
              maxLength={500}
              placeholder="Contanos algo sobre vos"
              placeholderTextColor={theme.color.textMuted}
            />

            <Text style={styles.charCount}>{description.length}/500</Text>

            {fieldErrors.description ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.description}</Text>
            ) : null}
          </>
        ) : (
          <View style={styles.readonlyField}>
            <Text style={styles.valueText}>
              {description || 'Sin descripción'}
            </Text>
          </View>
        )}
      </View>

      {editing && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btnSave, saving && styles.btnDisabled]}
            onPress={onSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.color.onAccent} size="small" />
            ) : (
              <Text style={styles.btnTextWhite}>Guardar cambios</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnCancel}
            onPress={onCancel}
            disabled={saving}
          >
            <Text style={styles.btnTextCancel}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.separator} />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tema</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => mode !== 'light' && toggle()}
            style={{
              flex: 1,
              minHeight: theme.button?.minHeight ?? 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              backgroundColor:
                mode === 'light'
                  ? theme.color.accent
                  : theme.color.surfaceSubtle,
            }}
          >
            <Text
              style={{
                color:
                  mode === 'light'
                    ? theme.color.onAccent
                    : theme.color.textSecondary,
                fontWeight: mode === 'light' ? '600' : '400',
              }}
            >
              Claro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => mode !== 'dark' && toggle()}
            style={{
              flex: 1,
              minHeight: theme.button?.minHeight ?? 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              backgroundColor:
                mode === 'dark'
                  ? theme.color.accent
                  : theme.color.surfaceSubtle,
            }}
          >
            <Text
              style={{
                color:
                  mode === 'dark'
                    ? theme.color.onAccent
                    : theme.color.textSecondary,
                fontWeight: mode === 'dark' ? '600' : '400',
              }}
            >
              Oscuro
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summarySeparator} />

      <ActiveProductsSummary
        products={activeProductsSummary}
        loading={loadingActiveProductsSummary}
        error={activeProductsSummaryError}
        onRetry={onReloadActiveProductsSummary}
        onOpenPublish={onOpenPublish}
        onGoToSalesTab={onGoToSalesTab}
      />
    </View>
  )
}