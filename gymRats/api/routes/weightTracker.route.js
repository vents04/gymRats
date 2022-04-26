const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');
const WeightTrackerService = require('../services/cards/weightTracker.service');

const DailyWeight = require('../db/models/weightTracker/dailyWeight.model');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, WEIGHT_UNITS, DEFAULT_ERROR_MESSAGE } = require('../global');
const { dailyWeightPostValidation } = require('../validation/hapi');

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
            await DbService.update(COLLECTIONS.DAILY_WEIGHTS, { _id: mongoose.Types.ObjectId(existingDailyWeight._id) }, {
                weight: +req.body.weight,
                unit: req.body.unit
            });
            return res.sendStatus(HTTP_STATUS_CODES.OK);
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

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete("/daily-weight/:id", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid daily weight id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const dailyWeight = await DbService.getOne(COLLECTIONS.DAILY_WEIGHTS, { _id: mongoose.Types.ObjectId(req.params.id) });
        if (!dailyWeight) return next(new ResponseError("Daily weight not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (dailyWeight.userId.toString() != req.user._id.toString()) return next(new ResponseError("You cannot delete this daily weight", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.delete(COLLECTIONS.DAILY_WEIGHTS, { _id: mongoose.Types.ObjectId(req.params.id) });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/weight-graph", authenticate, async (req, res, next) => {
    try {
        const graphData = await WeightTrackerService.getWeightGraph(req.user._id, req.user.weightUnit);
        return res.status(HTTP_STATUS_CODES.OK).send({
            graphData
        });
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;