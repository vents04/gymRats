const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const validbarcode = require("barcode-validator");

const DbService = require('../services/db.service');

const CaloriesCounterItem = require('../db/models/caloriesCounter/caloriesCounterItem.model');
const CaloriesCounterDailyGoal = require('../db/models/caloriesCounter/caloriesCounterDailyGoal.model');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');
const { itemPostValidation, dailyItemPostValidation, dailyGoalPostValidation } = require('../validation/hapi');
const checkCaloriesAndMacros = require('../helperFunctions/checkCaloriesAndMacros');
const NutritionixService = require('../services/nutritionix.service');

router.post('/item', authenticate, async (req, res, next) => {
    const { error } = itemPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
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
        // add userId before production
        await DbService.create(COLLECTIONS.CALORIES_COUNTER_ITEMS, item);

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/daily-item", authenticate, async (req, res, next) => {
    const { error } = dailyItemPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const date = new Date(req.body.year, req.body.month, req.body.date);
        if (date.getTime() !== date.getTime()) return next(new ResponseError("Invalid date", HTTP_STATUS_CODES.BAD_REQUEST));

        const existingDay = await DbService.getOne(COLLECTIONS.CALORIES_COUNTER_DAYS, {
            userId: mongoose.Types.ObjectId(req.user._id),
            date: parseInt(req.body.date),
            month: parseInt(req.body.month),
            year: parseInt(req.body.year)
        });
        if (!existingDay) {
            const dailyGoals = await DbService.getMany(COLLECTIONS.CALORIES_COUNTER_DAILY_GOALS, { userId: mongoose.Types.ObjectId(req.user._id) });
            if (dailyGoals.length == 0) return next(new ResponseError("You should add a daily calories goal", HTTP_STATUS_CODES.BAD_REQUEST));

            let latestDailyGoal = dailyGoals[0];
            for (let dailyGoal of dailyGoals) {
                if (dailyGoal.createdDt > latestDailyGoal.createdDt) latestDailyGoal = dailyGoal;
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

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/daily-goal", authenticate, async (req, res, next) => {
    const { error } = dailyGoalPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const validCaloriesAndMacros = checkCaloriesAndMacros(req.body.calories, req.body.protein, req.body.carbs, req.body.fats);
        if (!validCaloriesAndMacros) return next(new ResponseError("Please, double check the calories and the macros because there is a mismatch found", HTTP_STATUS_CODES.BAD_REQUEST));

        const dailyGoal = new CaloriesCounterDailyGoal(req.body);
        dailyGoal.userId = mongoose.Types.ObjectId(req.user._id);
        await DbService.create(COLLECTIONS.CALORIES_COUNTER_DAILY_GOALS, dailyGoal);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete('/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid calorie counter day id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const calorieCounterDay = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_DAYS, req.params.id);
        if (!calorieCounterDay) return next(new ResponseError("Calorie counter day not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (calorieCounterDay.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot delete calorie counter day", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.delete(COLLECTIONS.CALORIES_COUNTER_DAYS, { _id: mongoose.Types.ObjectId(req.params.id) });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete("/:dayId/:itemId", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.dayId) || !mongoose.Types.ObjectId.isValid(req.params.itemId))
        return next(new ResponseError("Invalid day id and/or item id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const day = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_DAYS, req.params.dayId);
        if (!day) return next(new ResponseError("Day not found", HTTP_STATUS_CODES.NOT_FOUND));

        if (day.userId.toString() != req.user._id.toString()) return next(new ResponseError("You cannot delete this item", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.pullUpdate(COLLECTIONS.CALORIES_COUNTER_DAYS, { _id: mongoose.Types.ObjectId(req.params.dayId) }, { "items": { _id: mongoose.Types.ObjectId(req.params.itemId) } })

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/day', authenticate, async (req, res, next) => {
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try {
        const calorieCounterDay = await DbService.getOne(COLLECTIONS.CALORIES_COUNTER_DAYS, {
            userId: mongoose.Types.ObjectId(req.user._id),
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year,
        });
        if (calorieCounterDay) {
            for (let item of calorieCounterDay.items) {
                const itemInstance = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_ITEMS, item.itemId);
                item.itemInstance = itemInstance;
            }
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            calorieCounterDay
        })
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/search/food", async (req, res, next) => {

    // IMPORTANT: DO NOT USE KEYWORDS FOR MATCHING WITH THE USER QUERY. USE ONLY ITEMS' titles //

    if (!req.query.query) {
        /* 
        return user's most used items (max 20 items in results) 
        otherwise if they do not have enough data add the most used and most searched items in the platform
        */
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: await DbService.getManyWithSortAndLimit(COLLECTIONS.CALORIES_COUNTER_ITEMS, {}, { usedTimes: -1, searchedTimes: -1 }, 20)
        })
    }

    try {
        /*
        first of all loop through the user's most used and add all
        items matching with their search. Then loop through the most used and most searched items
        and add such to the results until you fill the max size of 20 results
        */

        const results = await DbService.getManyWithSortAndLimit(COLLECTIONS.CALORIES_COUNTER_ITEMS, { keywords: { $all: Object.values(req.query) } }, { usedTimes: -1, searchedTimes: -1 }, 20);
        for (let result of results) {
            if (result.userId) {
                const user = await DbService.getById(COLLECTIONS.USERS, result.userId);
                result.userInstance = user;
            }
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            results
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/search/barcode", async (req, res, next) => {
    if (!req.query.barcode) return next(new ResponseError("Provide a barcode to search for", HTTP_STATUS_CODES.BAD_REQUEST));
    if (!validbarcode(req.query.barcode)) return next(new ResponseError("Invalid barcode", HTTP_STATUS_CODES.BAD_REQUEST));
    try {
        const results = await NutritionixService.searchBarcode(req.query.barcode);
        return res.status(HTTP_STATUS_CODES.OK).send({
            results
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;