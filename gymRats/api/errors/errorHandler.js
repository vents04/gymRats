const { HTTP_STATUS_CODES } = require('../global');

const Logger = require('./logger');
const logger = new Logger();

const errorHandler = (error, req, res, next) => {
    logger.error(error.message, error.status);
    res.status(error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(error.message);
    next();
}

module.exports = errorHandler;