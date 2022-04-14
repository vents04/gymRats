const express = require('express');
const router = express.Router();
const axios = require('axios');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { GOOGLE_API_KEY, HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE } = require('../global');

router.get('/search-places', authenticate, async (req, res, next) => {
    try {
        let response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${req.query.query}&key=${GOOGLE_API_KEY}&language=en&types=(cities)`);
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: response.data.predictions
        })
    } catch (e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.get('/place/:id', authenticate, async (req, res, next) => {
    try {
        let response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${req.params.id}&key=${GOOGLE_API_KEY}`);
        return res.status(HTTP_STATUS_CODES.OK).send({
            result: response.data.result
        })
    } catch (e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;