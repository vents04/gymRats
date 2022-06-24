const { HTTP_STATUS_CODES, SUPPORTED_LANGUAGES } = require('../global');
const { errorCodes } = require('./errorCodes');

const Logger = require('./logger');
const logger = new Logger();

const errorHandler = (error, req, res, next) => {
    logger.error({ message: error.message, status: error.status, dt: new Date().getTime(), userId: req.user ? req.user._id : null, language: req.lng || SUPPORTED_LANGUAGES.ENGLISH });
    if (error.code) {
        error.message = errorCodes[error.code][req.header('lng') ? req.header('lng') : 'bg'][0] || error.message;
    }
    res.status(error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(error.message);
    next();
}

module.exports = errorHandler;