const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

const ResponseError = require('../errors/responseError');
const { DEFAULT_ERROR_MESSAGE, HTTP_STATUS_CODES, RELATION_STATUSES, COLLECTIONS } = require('../global');
const { authenticate } = require('../middlewares/authenticate');
const LogbookService = require('../services/cards/logbook.service');
const WeightTrackerService = require('../services/cards/weightTracker.service');
const DbService = require('../services/db.service');

router.get("/page", authenticate, async (req, res, next) => {
    try {
        let message = false;
        
        const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { clientId: mongoose.Types.ObjectId(req.user._id) });
        if (relation && relation.status == RELATION_STATUSES.ACTIVE) message = true;

        const date = new Date();
        const weightTrackerProgress = await WeightTrackerService.getProgressNotation(date.getDate(), date.getMonth() + 1, date.getFullYear(), req.user._id);
        const logbookProgress = await LogbookService.getExercisesProgress(req.user._id);
        return res.status(HTTP_STATUS_CODES.OK).send({
            weightTrackerProgress,
            logbookProgress,
            message: message
        })
    } catch (err) {
        console.log(err)
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;
