const ADMIN_TOKEN = 'sistemas2024'

export function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token']
  if (token === ADMIN_TOKEN) return next()
  res.status(401).json({ error: 'No autorizado' })
}
