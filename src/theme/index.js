// ─────────────────────────────────────────────────────────────────────────────
// Paleta clara (light mode)
// ─────────────────────────────────────────────────────────────────────────────
export const lightColors = {
  // Superficies
  surface:        '#FFFFFF',
  surfaceSubtle:  '#F1F5F9',
  surfaceInverse: '#0F172A',

  // Bordes
  border:         '#E2E8F0',

  // Texto
  textPrimary:    '#0F172A',
  textSecondary:  '#64748B',
  textMuted:      '#94A3B8',
  sectionTitle:   '#444444',

  // Accent (teal principal)
  accent:         '#2E9E95',
  accentTint:     '#E6F7F6',
  accentInk:      '#1F6E67',
  accentBorder:   '#B9D8D4',
  accentSubtle:   '#F2FBFA',

  // Acción social
  like:           '#FF6B3D',
  rating:         '#f59e0b',
  onAccent:       '#FFFFFF',

  // Alerta/badge
  notification:   '#EF4444',

  // Semánticos
  error:          '#C62828',
  errorLight:     '#FEE2E2',
  errorBorder:    '#fca5a5',
  success:        '#117a37',
  successLight:   '#DCFCE7',
  successBorder:  '#86EFAC',
  warning:        '#D97706',
  warningLight:   '#FEF3C7',
  info:           '#2563EB',
  infoLight:      '#DBEAFE',

  // Tag badges (light)
  tagPopularBg:   '#FFF3E0',
  tagPopularText: '#E65100',
  tagNuevoBg:     '#DCFCE7',
  tagNuevoText:   '#117a37',
  tagParaVosBg:   '#E6F7F6',
  tagParaVosText: '#2E9E95',
  tagDefaultBg:   '#F1F5F9',
  tagDefaultText: '#64748B',
}

// ─────────────────────────────────────────────────────────────────────────────
// Paleta oscura (dark mode)
// ─────────────────────────────────────────────────────────────────────────────
export const darkColors = {
  // Superficies
  surface:        '#0F172A',
  surfaceSubtle:  '#1E293B',
  surfaceInverse: '#F1F5F9',

  // Bordes
  border:         '#243049',

  // Texto
  textPrimary:    '#F1F5F9',
  textSecondary:  '#94A3B8',
  textMuted:      '#64748B',
  sectionTitle:   '#CBD5E1',

  // Accent (teal — igual en ambos modos)
  accent:         '#2E9E95',
  accentTint:     'rgba(46,158,149,0.16)',
  accentInk:      '#5FD0C6',
  accentBorder:   'rgba(46,158,149,0.35)',
  accentSubtle:   'rgba(46,158,149,0.08)',

  // Acción social
  like:           '#FF6B3D',
  rating:         '#f59e0b',
  onAccent:       '#FFFFFF',

  // Alerta/badge
  notification:   '#F87171',

  // Semánticos (versiones oscuras — hue preservado, fondos translúcidos)
  error:          '#F87171',
  errorLight:     'rgba(248,113,113,0.16)',
  errorBorder:    'rgba(248,113,113,0.35)',
  success:        '#34D399',
  successLight:   'rgba(52,211,153,0.16)',
  successBorder:  'rgba(52,211,153,0.35)',
  warning:        '#FBBF24',
  warningLight:   'rgba(251,191,36,0.16)',
  info:           '#60A5FA',
  infoLight:      'rgba(96,165,250,0.16)',

  // Tag badges (dark — translúcidos para no quemar sobre surface oscura)
  tagPopularBg:   'rgba(255,107,61,0.18)',
  tagPopularText: '#FF6B3D',
  tagNuevoBg:     'rgba(52,211,153,0.16)',
  tagNuevoText:   '#34D399',
  tagParaVosBg:   'rgba(46,158,149,0.16)',
  tagParaVosText: '#5FD0C6',
  tagDefaultBg:   '#1E293B',
  tagDefaultText: '#94A3B8',
}

// ─────────────────────────────────────────────────────────────────────────────
// Tokens independientes del modo
// ─────────────────────────────────────────────────────────────────────────────
export const shared = {
  radius: { sm: 12, md: 16, lg: 18, image: 16, pill: 999 },
  space:  { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },

  type: {
    title:    { weight: '700', size: 20, letterSpacing: -0.3 },
    subtitle: { weight: '800', size: 18 },
    body:     { weight: '400', size: 15 },
    label:    { weight: '600', size: 13 },
    name:     { weight: '500', size: 14, lineHeight: 19 },
    price:    { weight: '700', size: 15 },
    seller:   { weight: '400', size: 12 },
    meta:     { weight: '500', size: 11 },
    chip:     { weight: '600', size: 12 },
  },

  shadow: { card: {} }, // Social/P2P: sin sombra; la imagen porta la jerarquía

  button: { minHeight: 44 },
}

// ─────────────────────────────────────────────────────────────────────────────
// Construye un objeto theme completo a partir de una paleta de colores.
// Usado por ThemeContext — no importar directo en componentes.
// ─────────────────────────────────────────────────────────────────────────────
export function buildTheme(color) {
  return {
    color,
    ...shared,
    tag: {
      popular: { bg: color.tagPopularBg, text: color.tagPopularText },
      nuevo:   { bg: color.tagNuevoBg,   text: color.tagNuevoText },
      paraVos: { bg: color.tagParaVosBg, text: color.tagParaVosText },
      default: { bg: color.tagDefaultBg, text: color.tagDefaultText },
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Paleta decorativa de categorías (estática — no depende del modo)
// ─────────────────────────────────────────────────────────────────────────────
export const categoryPalette = {
  tecnologia:     { circle: '#E0E7FF', icon: '#4338CA' },
  hogar:          { circle: '#FEF3C7', icon: '#D97706' },
  moda:           { circle: '#FCE7F3', icon: '#BE185D' },
  deportes:       { circle: '#D1FAE5', icon: '#065F46' },
  libros:         { circle: '#FEF9C3', icon: '#A16207' },
  juguetes:       { circle: '#EDE9FE', icon: '#5B21B6' },
  coleccionables: { circle: '#FEE2E2', icon: '#991B1B' },
  herramientas:   { circle: '#F1F5F9', icon: '#334155' },
  _default:       { circle: '#F3F4F6', icon: '#374151' },
}

// ─────────────────────────────────────────────────────────────────────────────
// orderStatusColor por modo
// bg translúcido en oscuro para no quemar; dot mantiene hue saturado;
// texto siempre en theme.color.textPrimary (WCAG garantizado en ambos modos).
// ─────────────────────────────────────────────────────────────────────────────
export const lightOrderStatusColor = {
  pending_payment:    { bg: '#DBEAFE', dot: '#2563EB' },
  confirmed:          { bg: '#E6F7F6', dot: '#2E9E95' },
  in_preparation:     { bg: '#FEF3C7', dot: '#D97706' },
  shipped:            { bg: '#DBEAFE', dot: '#2563EB' },
  delivered:          { bg: '#DCFCE7', dot: '#117a37' },
  payment_rejected:   { bg: '#FEE2E2', dot: '#C62828' },
  cancelled:          { bg: '#F1F5F9', dot: '#94A3B8' },
  refund_in_progress: { bg: '#FEF3C7', dot: '#D97706' },
  refund_processed:   { bg: '#DCFCE7', dot: '#117a37' },
}

export const darkOrderStatusColor = {
  pending_payment:    { bg: 'rgba(96,165,250,0.18)',  dot: '#60A5FA' },
  confirmed:          { bg: 'rgba(46,158,149,0.18)',  dot: '#2E9E95' },
  in_preparation:     { bg: 'rgba(251,191,36,0.18)',  dot: '#FBBF24' },
  shipped:            { bg: 'rgba(96,165,250,0.18)',  dot: '#60A5FA' },
  delivered:          { bg: 'rgba(52,211,153,0.18)',  dot: '#34D399' },
  payment_rejected:   { bg: 'rgba(248,113,113,0.18)', dot: '#F87171' },
  cancelled:          { bg: '#1E293B',                dot: '#64748B' },
  refund_in_progress: { bg: 'rgba(251,191,36,0.18)',  dot: '#FBBF24' },
  refund_processed:   { bg: 'rgba(52,211,153,0.18)',  dot: '#34D399' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Tema estático claro — fallback para contextos sin hook (navigación, constantes).
// Los componentes deben usar useTheme() en lugar de esto.
// ─────────────────────────────────────────────────────────────────────────────
export const lightTheme = {
  ...buildTheme(lightColors),
  orderStatusColor: lightOrderStatusColor,
}

// Alias de compatibilidad — durante el sweep los archivos migran a useTheme().
export const theme = lightTheme
export const orderStatusColor = lightOrderStatusColor
