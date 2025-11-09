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