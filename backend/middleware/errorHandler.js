// middlewares/errorHandler.js
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error(`[${req.method}] ${req.originalUrl} → ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
  });
};

export default errorHandler;
