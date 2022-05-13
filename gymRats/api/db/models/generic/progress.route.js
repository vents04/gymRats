const express = require('express');
const { DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES } = require('../../../global');
const router = express.Router();

const { authenticate } = require('../../../middlewares/authenticate');

router.get("/page", authenticate, async (req, res, next) => {
    try {
        const dailyWeightsGraph = 
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;