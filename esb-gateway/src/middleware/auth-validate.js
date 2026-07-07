import jwt from 'jsonwebtoken';

export function authValidate(req, res, next) {
  // Allow passthrough for auth login route
  if (req.originalUrl.startsWith('/api/v1/auth/login')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      data: null,
      meta: { timestamp: new Date().toISOString() },
      errors: [{ code: 'UNAUTHORIZED', detail: 'Missing or invalid authorization header' }]
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nexus_super_secret_key_change_in_prod');
    // Forward decoded user info as header to internal services
    req.user = decoded;
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-role'] = decoded.role;
    if (decoded.nim) {
      req.headers['x-user-nim'] = decoded.nim;
    }
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      data: null,
      meta: { timestamp: new Date().toISOString() },
      errors: [{ code: 'UNAUTHORIZED', detail: 'Token invalid or expired' }]
    });
  }
}
