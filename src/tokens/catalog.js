// Shared design tokens for the catalog screen.
// Extend (don't replace) COLORS / SPACING / FONT from src/constants/.
// Import these wherever catalog-related components need consistent values.

export const RADIUS = {
  chip: 999,
  card: 12,
  input: 8,
  button: 8,
  sheet: 20,
}

export const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 6,
  elevation: 2,
}

export const SHEET_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 6,
}

export const TYPE = {
  caption:  12,
  body:     14,
  callout:  15,
  subhead:  16,
  title:    18,
  display:  22,
}
