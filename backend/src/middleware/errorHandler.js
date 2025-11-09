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