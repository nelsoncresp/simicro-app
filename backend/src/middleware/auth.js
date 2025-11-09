import jwt from 'jsonwebtoken';

// Middleware de autenticación
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar estructura básica del token
    if (!decoded.id_usuario || !decoded.rol) {
      return res.status(401).json({
        success: false,
        message: 'Token con estructura inválida'
      });
    }

    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('Error en autenticación:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error en autenticación'
    });
  }
};

// Middleware de roles
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes'
      });
    }

    next();
  };
};

// Middlewares específicos
export const requireAdmin = requireRole(['admin']);
export const requireAnalyst = requireRole(['admin', 'analista']);
export const requireAdminOrAnalyst = requireRole(['admin', 'analista']);
export const requireEntrepreneur = requireRole(['emprendedor']);

// Manejo de errores
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe'
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  // Error general
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
};