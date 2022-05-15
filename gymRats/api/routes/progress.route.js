const express = require('express');
const router = express.Router();

const ResponseError = require('../errors/responseError');
const { DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES } = require('../global');
const { authenticate } = require('../middlewares/authenticate');
const LogbookService = require('../services/cards/logbook.service');
const WeightTrackerService = require('../services/cards/weightTracker.service');

router.get("/page", authenticate, async (req, res, next) => {
    console.log("tuakaka")
    try {
        const date = new Date();
        const weightTrackerProgress = await WeightTrackerService.getProgressNotation(date.getDate(), date.getMonth() + 1, date.getFullYear(), req.user._id);
        const logbookProgress = await LogbookService.getExercisesProgress(req.user._id);
        return res.status(HTTP_STATUS_CODES.OK).send({
            weightTrackerProgress,
            logbookProgress
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;
