const express = require('express');
const { adminAuthenticate } = require('../middlewares/authenticate');
const router = express.Router();

router.post("/login", async (req, res, next) => {
    const { error } = adminAuthenticate(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {

    } catch (error) {
        return next(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;