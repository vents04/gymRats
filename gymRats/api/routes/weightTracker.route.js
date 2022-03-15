const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate } = require('../middlewares/authenticate');
const { dailyWeightPostValidation } = require('../validation/hapi');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, COLLECTIONS, WEIGHT_UNITS } = require('../global');
const DailyWeight = require('../db/models/weightTracker/dailyWeight.model');
const DbService = require('../services/db.service');
const WeightTrackerService = require('../services/cards/weightTracker.service');

router.post("/daily-weight", authenticate, async (req, res, next) => {
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    const { error } = dailyWeightPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingDailyWeight = await DbService.getOne(COLLECTIONS.DAILY_WEIGHTS, {
            userId: mongoose.Types.ObjectId(req.user._id),
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year
        })

        if (existingDailyWeight) {
            await DbService.delete(COLLECTIONS.DAILY_WEIGHTS, { _id: mongoose.Types.ObjectId(existingDailyWeight._id) });
        }

        const dailyWeight = new DailyWeight({
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year,
            weight: +req.body.weight,
            unit: req.body.unit
        });
        dailyWeight.userId = mongoose.Types.ObjectId(req.user._id);
        await DbService.create(COLLECTIONS.DAILY_WEIGHTS, dailyWeight);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete("/daily-weight", authenticate, async (req, res, next) => {
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try {
        const date = new Date(new Date(req.params.date).setMinutes(new Date(req.params.date).getMinutes() - req.params.timezoneOffset));
        await DbService.delete(COLLECTIONS.DAILY_WEIGHTS, {
            userId: mongoose.Types.ObjectId(req.user._id),
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year,
        });
        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.get("/weight-graph/:unit", authenticate, async (req, res, next) => {
    if (!Object.values(WEIGHT_UNITS).includes(req.params.unit)) {
        return next(new ResponseError("Invalid weight unit", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try {
        const graphData = await WeightTrackerService.getWeightGraph(req.user._id, req.params.unit);
        res.status(HTTP_STATUS_CODES.OK).send({ graphData: graphData });
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;