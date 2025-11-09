export const success = (res, data, message = 'Éxito', status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data
  });
};

export const error = (res, message = 'Error', status = 400) => {
  res.status(status).json({
    success: false,
    message
  });
};

export const serverError = (res, error, message = 'Error del servidor') => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message
  });
};