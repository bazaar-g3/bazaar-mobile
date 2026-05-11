/**
 * Normaliza un parámetro de ruta.
 * @param {string|string[]} value - El valor a normalizar.
 * @returns {string} - El valor normalizado.
 */
export function normalizeRouteParam(value) {
  return Array.isArray(value) ? value[0] : value
}

/**
 * Construye la redirección para el inicio de sesión.
 * @param {Object} params - Parámetros para la redirección.
 * @returns {Object|string} - La ruta de redirección.
 */
export function buildLoginRedirect({
  redirectPath,
  redirectFrom,
  pendingAction,
  quantity,
  activeTab,
} = {}) {
  const params = {}

  if (redirectPath) params.redirectPath = redirectPath
  if (redirectFrom) params.redirectFrom = redirectFrom
  if (pendingAction) params.pendingAction = pendingAction
  if (activeTab) params.activeTab = activeTab
  if (quantity !== undefined && quantity !== null && quantity !== '') {
    params.quantity = String(quantity)
  }

  return Object.keys(params).length > 0
    ? { pathname: '/login', params }
    : '/login'
}

/**
 * Construye la navegación para la pantalla de autenticación.
 * @param {string} pathname - La ruta actual.
 * @param {Object} currentParams - Parámetros actuales.
 * @returns {Object|string} - La ruta de navegación.
 */
export function buildAuthScreenNavigation(pathname, currentParams = {}) {
  const redirectPath = normalizeRouteParam(currentParams.redirectPath)
  const redirectFrom = normalizeRouteParam(currentParams.redirectFrom)
  const pendingAction = normalizeRouteParam(currentParams.pendingAction)
  const quantity = normalizeRouteParam(currentParams.quantity)
  const activeTab = normalizeRouteParam(currentParams.activeTab)
  const loginRedirect = buildLoginRedirect({
    redirectPath,
    redirectFrom,
    pendingAction,
    quantity,
    activeTab,
  })

  return loginRedirect.pathname
    ? {
        pathname,
        params: loginRedirect.params,
      }
    : pathname
}

/**
 * Construye la ruta de destino después de la autenticación.
 * @param {Object} currentParams - Parámetros actuales.
 * @param {string} [fallback='/home'] - Ruta de fallback.
 * @returns {Object|string} - La ruta de destino.
 */
export function buildPostAuthDestination(currentParams = {}, fallback = '/home') {
  const redirectPath = normalizeRouteParam(currentParams.redirectPath)
  if (!redirectPath) return fallback

  const params = {}
  const redirectFrom = normalizeRouteParam(currentParams.redirectFrom)
  const pendingAction = normalizeRouteParam(currentParams.pendingAction)
  const quantity = normalizeRouteParam(currentParams.quantity)
  const activeTab = normalizeRouteParam(currentParams.activeTab)

  if (redirectFrom) params.from = redirectFrom
  if (pendingAction) params.pendingAction = pendingAction
  if (quantity) params.quantity = quantity
  if (activeTab) params.activeTab = activeTab

  return Object.keys(params).length > 0
    ? { pathname: redirectPath, params }
    : redirectPath
}
