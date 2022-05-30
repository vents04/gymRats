const { HTTP_STATUS_CODES } = require('../global');
const { errorCodes } = require('./errorCodes');

const Logger = require('./logger');
const logger = new Logger();

const errorHandler = (error, req, res, next) => {
    if (error.code) {
        error.message = errorCodes[error.code][req.header('lng') ? req.header('lng') : 'bg'][0] || error.message;
    }
    logger.error(error.message, error.status);
    res.status(error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(error.message);
    next();
}

module.exports = errorHandler;