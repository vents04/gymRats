const express = require('express');
const ResponseError = require('../errors/responseError');
const { DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES } = require('../global');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

route.get("/page", authenticate, async (req, res, next) => {
    try {

    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;
