const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const validbarcode = require("barcode-validator");

const DbService = require('../services/db.service');

const CaloriesCounterItem = require('../db/models/caloriesCounter/caloriesCounterItem.model');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE, RELATION_STATUSES } = require('../global');
const { itemPostValidation, dailyItemPostValidation, dailyItemUpdateValidation } = require('../validation/hapi');
const checkCaloriesAndMacros = require('../helperFunctions/checkCaloriesAndMacros');
const NutritionixService = require('../services/nutritionix.service');
const { quicksort } = require('../helperFunctions/quickSortForFoods');

router.get("/recent", authenticate, async (req, res, next) => {
    try {
        let items = [];
        let days = await DbService.getManyWithSort(COLLECTIONS.CALORIES_COUNTER_DAYS, { userId: mongoose.Types.ObjectId(req.user._id) }, { createdDt: -1 });
        for (let day of days) {
            for (let item of day.items) {
                let existingItem = items.find(el => {
                    return el.itemId.toString() === item.itemId.toString()
                })
                if (!existingItem) {
                    const itemInstance = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_ITEMS, item.itemId);
                    item.itemInstance = itemInstance;
                    if (itemInstance.userId) {
                        const userInstance = await DbService.getById(COLLECTIONS.USERS, itemInstance.userId);
                        item.userInstance = userInstance;
                    }
                    items.push(item);
                    if (items.length == 25) break;
                    continue;
                }
                existingItem.amount = item.amount;
                existingItem.dt = item.dt;
                existingItem.meal = item.meal
            }
        }
        return res.status(HTTP_STATUS_CODES.OK).send({ items });
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
    }
});

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
        item.userId = req.user._id;
        item.calories = parseFloat(item.calories / 100).toFixed(2);
        item.protein = parseFloat(item.protein / 100).toFixed(2);
        item.carbs = parseFloat(item.carbs / 100).toFixed(2);
        item.fats = parseFloat(item.fats / 100).toFixed(2);
        item.keywords = item.title.split(" ");
        if (req.body.brand) item.keywords.push(...req.body.brand.split(" "));
        for(let i = 0; i < item.keywords.length; i++) {
            item.keywords[i] = item.keywords[i].toLowerCase();
        }

        item.keywords.map(element => element.toLowerCase());
        await DbService.create(COLLECTIONS.CALORIES_COUNTER_ITEMS, item);

        const newItem = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_ITEMS, item._id);

        return res.status(HTTP_STATUS_CODES.CREATED).send({
            item: newItem
        });
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/item/:id", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid item id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const item = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_ITEMS, req.params.id);
        if (!item) return next(new ResponseError("Item not found", HTTP_STATUS_CODES.NOT_FOUND));

        return res.status(HTTP_STATUS_CODES.OK).send({
            item
        })
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
            await DbService.create(COLLECTIONS.CALORIES_COUNTER_DAYS, {
                userId: mongoose.Types.ObjectId(req.user._id),
                date: parseInt(req.body.date),
                month: parseInt(req.body.month),
                year: parseInt(req.body.year),
                items: [],
                calories: 0,
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

        await DbService.updateWithInc(COLLECTIONS.CALORIES_COUNTER_ITEMS, { _id: mongoose.Types.ObjectId(req.body.itemId) }, { usedTimes: 1 })

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
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

router.put("/:dayId/:itemId", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.dayId) || !mongoose.Types.ObjectId.isValid(req.params.itemId))
        return next(new ResponseError("Invalid day id and/or item id", HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = dailyItemUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const day = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_DAYS, req.params.dayId);
        if (!day) return next(new ResponseError("Day not found", HTTP_STATUS_CODES.NOT_FOUND));

        if (day.userId.toString() != req.user._id.toString()) return next(new ResponseError("You cannot delete this item", HTTP_STATUS_CODES.FORBIDDEN));

        let item = null;
        for (let currentItem of day.items) {
            if (currentItem._id.toString() == req.params.itemId) {
                item = currentItem;
                break;
            }
        }
        if (!item) return next(new ResponseError("Item could not be found", HTTP_STATUS_CODES.BAD_REQUEST));

        const newItem = {
            _id: mongoose.Types.ObjectId(item._id),
            itemId: item.itemId,
            amount: req.body.amount ? req.body.amount : item.amount,
            meal: req.body.meal ? req.body.meal : item.meal,
            dt: new Date().getTime()
        }

        await DbService.pullUpdate(COLLECTIONS.CALORIES_COUNTER_DAYS, { _id: mongoose.Types.ObjectId(req.params.dayId) }, { "items": { _id: mongoose.Types.ObjectId(req.params.itemId) } })

        await DbService.pushUpdate(COLLECTIONS.CALORIES_COUNTER_DAYS, { _id: mongoose.Types.ObjectId(req.params.dayId) }, { "items": newItem });

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

    if (req.query.clientId && !mongoose.Types.ObjectId.isValid(req.query.clientId))
        return next(new ResponseError("Invalid client id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        if (req.query.clientId) {
            const client = await DbService.getById(COLLECTIONS.USERS, req.query.clientId);
            if (!client) return next(new ResponseError("Client not found", HTTP_STATUS_CODES.NOT_FOUND));

            const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
            if (!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND));

            const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id), clientId: mongoose.Types.ObjectId(client._id), status: RELATION_STATUSES.ACTIVE });
            if (!relation) return next(new ResponseError("Cannot get clients' data if you do not have an active relation with them", HTTP_STATUS_CODES.CONFLICT));
        }

        const calorieCounterDay = await DbService.getOne(COLLECTIONS.CALORIES_COUNTER_DAYS, {
            userId: req.query.clientId ? mongoose.Types.ObjectId(req.query.clientId) : mongoose.Types.ObjectId(req.user._id),
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
    let results = [];

    if (!req.query.words || req.query.words == "") {
        results = await DbService.getManyWithSortAndLimit(COLLECTIONS.CALORIES_COUNTER_ITEMS, {}, { usedTimes: -1, searchedTimes: -1 }, 50)
        return res.status(HTTP_STATUS_CODES.OK).send({
            results
        })
    }

    try {
        let words = req.query.words;
        let foods;

        if (words && words != "") {
            words = words.split(" ");
            var regex = [];
            for (let i = 0; i < words.length; i++) {
                regex[i] = new RegExp(words[i].toLowerCase());
            }

            foods = await DbService.getMany(COLLECTIONS.CALORIES_COUNTER_ITEMS, { keywords: { "$in": regex } });

            if (words.length > 1) {
                for (let food of foods) {
                    newWords = req.query.words.split(" ");

                    Object.assign(food, { timesFound: 0 });

                    for (let keyword of food.keywords) {
                        for (let i = 0; i < newWords.length; i++) {
                            if (keyword.toLowerCase().includes(newWords[i].toLowerCase())) {
                                food.timesFound++;
                                newWords[i] = "can't use again!";
                            }
                        }
                    }

                    if (food.userId) {
                        const user = await DbService.getById(COLLECTIONS.USERS, food.userId);
                        food.userInstance = user;
                    }
                }
                quicksort(foods, 0, foods.length - 1, false);
            } else {
                quicksort(foods, 0, foods.length - 1, true);
            }

        }

        results = foods.splice(0, 50);

        for (let result of results) {
            await DbService.updateWithIncrement(COLLECTIONS.CALORIES_COUNTER_ITEMS, { _id: mongoose.Types.ObjectId(result._id) }, { searchedTimes: 1 })
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
        const result = await DbService.getOne(COLLECTIONS.CALORIES_COUNTER_ITEMS, { barcode: req.query.barcode });
        return res.status(HTTP_STATUS_CODES.OK).send({
            result
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;