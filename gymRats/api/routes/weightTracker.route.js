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
    const { error } = dailyWeightPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    const date = new Date(new Date(req.body.date).setMinutes(new Date(req.body.date).getMinutes() - req.body.timezoneOffset));

    try {
        if (date.getTime() !== date.getTime()) {
            return next(new ResponseError("Invalid date", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const existingDailyWeight = await DbService.getOne(COLLECTIONS.DAILY_WEIGHTS, {
            userId: mongoose.Types.ObjectId(req.user._id),
            date: +date.getDate(),
            month: +date.getMonth() + 1,
            year: +date.getFullYear()
        })

        if (existingDailyWeight) {
            await DbService.delete(COLLECTIONS.DAILY_WEIGHTS, { _id: mongoose.Types.ObjectId(existingDailyWeight._id) });
        }

        const dailyWeight = new DailyWeight({
            date: +date.getDate(),
            month: +date.getMonth() + 1,
            year: +date.getFullYear(),
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

router.delete("/daily-weight/:id", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId(req.params.id)) {
        return next(new ResponseError("Invalid id", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try {
        const dailyWeight = await DbService.getById(COLLECTIONS.DAILY_WEIGHTS, req.params.id);
        if (!dailyWeight) return next(new ResponseError("Daily weight not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (dailyWeight.userId.toString() != req.user._id.toString()) return next(new ResponseError("Forbidden", HTTP_STATUS_CODES.FORBIDDEN));
        await DbService.delete(COLLECTIONS.DAILY_WEIGHTS, { _id: mongoose.Types.ObjectId(req.params.id) });
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