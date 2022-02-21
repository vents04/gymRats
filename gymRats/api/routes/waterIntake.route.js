const express = require('express');
const mongoose = require('mongoose');
const DailyWaterIntakeGoal = require('../db/models/waterIntakeTracker/dailyWaterIntakeGoal.model');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, COLLECTIONS, WATER_INTAKE_UNITS } = require('../global');
const router = express.Router();

const { authenticate } = require('../middlewares/authenticate');
const DbService = require('../services/db.service');
const { dailyWaterIntakeGoalPostValidation, dailyWaterIntakePutValidation } = require('../validation/hapi');

router.post("/daily-goal", authenticate, async (req, res, next) => {
    const { error } = dailyWaterIntakeGoalPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const dailyWaterIntakeGoal = new DailyWaterIntakeGoal(req.body);
        dailyWaterIntakeGoal.userId = mongoose.Types.ObjectId(req.user._id);
        await DbService.create(COLLECTIONS.DAILY_WATER_INTAKE_GOALS, dailyWaterIntakeGoal);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/daily-intake", authenticate, async (req, res, next) => {
    const { error } = dailyWaterIntakePutValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingDay = await DbService.getOne(COLLECTIONS.DAILY_WATER_INTAKES, { userId: mongoose.Types.ObjectId(req.user._id), date: parseInt(req.body.date), month: parseInt(req.body.month), year: parseInt(req.body.year) });
        if (!existingDay) {
            const date = new Date(req.body.year, req.body.month, req.body.date);
            if (date.getTime() !== date.getTime()) {
                return next(new ResponseError("Invalid date", HTTP_STATUS_CODES.BAD_REQUEST));
            }
            let latestDailyGoal = null;
            const dailyGoals = await DbService.getMany(COLLECTIONS.DAILY_WATER_INTAKE_GOALS, { userId: mongoose.Types.ObjectId(req.user._id) });
            if (dailyGoals.length > 0) {
                latestDailyGoal = dailyGoals[0];
                for (let dailyGoal of dailyGoals) {
                    if (dailyGoal.dt > latestDailyGoal.dt) latestDailyGoal = dailyGoal;
                }
            } else {
                const dailyGoal = new DailyWaterIntakeGoal({
                    userId: mongoose.Types.ObjectId(req.user._id),
                    amount: 10,
                    unit: WATER_INTAKE_UNITS.GLASSES
                });
                await DbService.create(COLLECTIONS.DAILY_WATER_INTAKE_GOALS, dailyGoal);
                latestDailyGoal = await DbService.getById(COLLECTIONS.DAILY_WATER_INTAKE_GOALS, dailyGoal._id);
            }
            await DbService.create(COLLECTIONS.DAILY_WATER_INTAKES, {
                userId: mongoose.Types.ObjectId(req.user._id),
                amount: req.body.amount,
                date: parseInt(req.body.date),
                month: parseInt(req.body.month),
                year: parseInt(req.body.year)
            });
        }

        await DbService.update(COLLECTIONS.DAILY_WATER_INTAKES, { _id: mongoose.Types.ObjectId(existingDay._id) }, {
            amount: (existingDay.amount + req.body.amount)
        })

        res.sendStatus(HTTP_STATUS_CODES.OK)
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;