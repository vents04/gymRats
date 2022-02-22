const express = require('express');
const router = express.Router();

const axios = require('axios');
const { googlePlacesSearchValidation } = require('../validation/hapi');
const { GOOGLE_API_KEY, HTTP_STATUS_CODES } = require('../global');
const { authenticate } = require('../middlewares/authenticate');
const ResponseError = require('../errors/responseError');

router.get('/search-places', authenticate, async (req, res, next) => {
    try {
        axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${req.query.query}&key=${GOOGLE_API_KEY}&language=en&types=(cities)`)
            .then((response) => {
                res.status(HTTP_STATUS_CODES.OK).send({
                    results: response.data.predictions
                })
            })
            .catch((error) => {
                throw new Error(error);
            })
    } catch (e) {
        return next(new ResponseError(e.message || "Internal server error", e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.get('/place/:id', authenticate, async (req, res, next) => {
    try {
        axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${req.params.id}&key=${GOOGLE_API_KEY}`)
            .then((response) => {
                res.status(HTTP_STATUS_CODES.OK).send({
                    result: response.data.result
                })
            })
            .catch((error) => {
                throw new Error(error);
            })
    } catch (e) {
        return next(new ResponseError(e.message || "Internal server error", e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;