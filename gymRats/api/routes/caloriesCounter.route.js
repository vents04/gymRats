const express = require('express');
const mongoose = require('mongoose');
const CaloriesCounterItem = require('../db/models/caloriesCounter/caloriesCounterItem.model');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, COLLECTIONS } = require('../global');
const DbService = require('../services/db.service');
const { itemPostValidation, dailyItemPostValidation, dailyGoalPostValidation } = require('../validation/hapi');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');
const CaloriesCounterDailyGoal = require('../db/models/caloriesCounter/caloriesCounterDailyGoal.model');
const checkCaloriesAndMacros = require('../helperFunctions/checkCaloriesAndMacros');

router.post('/item', authenticate, async (req, res, next) => {
    const { error } = itemPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        if (req.body.barcode && req.body.barcode.length > 0) {
            const existingItem = await DbService.getOne(COLLECTIONS.CALORIES_COUNTER_ITEMS, { barcode: req.body.barcode });
            if (existingItem) return next(new ResponseError("An item with that barcode already exists", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const existingItem = await DbService.getOne(COLLECTIONS.CALORIES_COUNTER_ITEMS, {
            title: req.body.title,
            calories: req.body.calories,
            protein: req.body.protein,
            carbs: req.body.carbs,
            fats: req.body.fats,
        })
        if (existingItem) return next(new ResponseError("An item with that title, calories and macros already exists", HTTP_STATUS_CODES.CONFLICT));

        const validCaloriesAndMacros = checkCaloriesAndMacros(req.body.calories, req.body.protein, req.body.carbs, req.body.fats);
        if (!validCaloriesAndMacros) return next(new ResponseError("Please double check the calories and the macros because there was a mismatch found", HTTP_STATUS_CODES.BAD_REQUEST));

        const item = new CaloriesCounterItem(req.body);
        item.userId = req.user._id;
        await DbService.create(COLLECTIONS.CALORIES_COUNTER_ITEMS, item);
        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/daily-item", authenticate, async (req, res, next) => {
    const { error } = dailyItemPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingDay = await DbService.getOne(COLLECTIONS.CALORIES_COUNTER_DAYS, { userId: mongoose.Types.ObjectId(req.user._id), date: parseInt(req.body.date), month: parseInt(req.body.month), year: parseInt(req.body.year) });
        if (!existingDay) {
            const date = new Date(req.body.year, req.body.month, req.body.date);
            if (date.getTime() !== date.getTime()) {
                return next(new ResponseError("Invalid date", HTTP_STATUS_CODES.BAD_REQUEST));
            }
            let latestDailyGoal = null;
            const dailyGoals = await DbService.getMany(COLLECTIONS.CALORIES_COUNTER_DAILY_GOALS, { userId: mongoose.Types.ObjectId(req.user._id) });
            if (dailyGoals.length > 0) {
                latestDailyGoal = dailyGoals[0];
                for (let dailyGoal of dailyGoals) {
                    if (dailyGoal.dt > latestDailyGoal.dt) latestDailyGoal = dailyGoal;
                }
            } else {
                const dailyGoal = new CaloriesCounterDailyGoal({
                    userId: mongoose.Types.ObjectId(req.user._id),
                    calories: 2000,
                    protein: 150,
                    carbs: 250,
                    fats: 45
                });
                await DbService.create(COLLECTIONS.CALORIES_COUNTER_DAILY_GOALS, dailyGoal);
                latestDailyGoal = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_DAILY_GOALS, dailyGoal._id);
            }
            await DbService.create(COLLECTIONS.CALORIES_COUNTER_DAYS, {
                userId: mongoose.Types.ObjectId(req.user._id),
                date: parseInt(req.body.date),
                month: parseInt(req.body.month),
                year: parseInt(req.body.year),
                items: [],
                caloriesCounterDailyGoalId: latestDailyGoal._id
            });
        }

        await DbService.pushUpdate(COLLECTIONS.CALORIES_COUNTER_DAYS, {
            userId: mongoose.Types.ObjectId(req.user._id),
            date: parseInt(req.body.date),
            month: parseInt(req.body.month),
            year: parseInt(req.body.year)
        }, {
            "items": {
                _id: new mongoose.Types.ObjectId(),
                itemId: mongoose.Types.ObjectId(req.body.itemId),
                amount: req.body.amount,
                dt: new Date(req.body.dt),
                meal: req.body.meal
            }
        });

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/daily-goal", authenticate, async (req, res, next) => {
    const { error } = dailyGoalPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const validCaloriesAndMacros = checkCaloriesAndMacros(req.body.calories, req.body.protein, req.body.carbs, req.body.fats);
        if (!validCaloriesAndMacros) return next(new ResponseError("Please double check the calories and the macros because there was a mismatch found", HTTP_STATUS_CODES.BAD_REQUEST));

        const dailyGoal = new CaloriesCounterDailyGoal(req.body);
        dailyGoal.userId = mongoose.Types.ObjectId(req.user._id);
        await DbService.create(COLLECTIONS.CALORIES_COUNTER_DAILY_GOALS, dailyGoal);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete("/:dayId/:itemId", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.dayId) || !mongoose.Types.ObjectId.isValid(req.params.itemId)) {
        return next(new ResponseError("Invalid day id and/or item id", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    const day = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_DAYS, req.params.dayId);
    if (!day) return next(new ResponseError("Day not found", HTTP_STATUS_CODES.NOT_FOUND));

    if (day.userId.toString() != req.user._id.toString()) return next(new ResponseError("User id mismatch", HTTP_STATUS_CODES.CONFLICT));

    await DbService.pullUpdate(COLLECTIONS.CALORIES_COUNTER_DAYS, { _id: mongoose.Types.ObjectId(req.params.dayId) }, { "items": { _id: mongoose.Types.ObjectId(req.params.itemId) } })

    res.sendStatus(HTTP_STATUS_CODES.OK);
});

module.exports = router;