export function normalizeRouteParam(value) {
  return Array.isArray(value) ? value[0] : value
}

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
