const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');
const WeightTrackerService = require('../services/cards/weightTracker.service');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, CARD_COLLECTIONS, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');

router.get('/', authenticate, async (req, res, next) => {
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try {
        let cards = [];
        let doNotShow = [];
        for (let card of CARD_COLLECTIONS) {
            const currentUserRecord = await DbService.getOne(card, {
                userId: mongoose.Types.ObjectId(req.user._id),
                date: +req.query.date,
                month: +req.query.month,
                year: +req.query.year,
            });

            if (!currentUserRecord && card == COLLECTIONS.CALORIES_COUNTER_DAYS) {
                console.log("asdaskdpokasl;dkasl;dkasl;dkasl;kd", card);
                const unknownSourceCaloriesDay = await DbService.getMany(COLLECTIONS.UNKNOWN_SOURCE_CALORIES, {
                    userId: mongoose.Types.ObjectId(req.user._id),
                    date: +req.query.date,
                    month: +req.query.month,
                    year: +req.query.year,
                })
                console.log("asdjasjdlkasd", unknownSourceCaloriesDay);
                if (unknownSourceCaloriesDay.length > 0) {
                    cards.push({
                        card: card, data: {
                            userId: req.user._id,
                            date: +req.query.date,
                            month: +req.query.month,
                            year: +req.query.year,
                            items: [],
                            unknownSourceCaloriesDay
                        }
                    });
                    doNotShow.push(card);
                }
            }

            if (currentUserRecord) {
                doNotShow.push(card);
                if (card == COLLECTIONS.CALORIES_COUNTER_DAYS) {
                    const unknownSourceCaloriesDay = await DbService.getMany(COLLECTIONS.UNKNOWN_SOURCE_CALORIES, {
                        userId: mongoose.Types.ObjectId(req.user._id),
                        date: +req.query.date,
                        month: +req.query.month,
                        year: +req.query.year,
                    })
                    currentUserRecord.unknownSourceCaloriesDay = unknownSourceCaloriesDay;
                }
                switch (card) {
                    case COLLECTIONS.DAILY_WEIGHTS:
                        const trend = await WeightTrackerService.getDailyTrend(currentUserRecord._id);
                        currentUserRecord.trend = trend ? trend : 0;
                        currentUserRecord.weight = parseFloat(currentUserRecord.weight).toFixed(2);
                        break;
                    case COLLECTIONS.WORKOUT_SESSIONS:
                        let exercises = [];
                        for (let exercise of currentUserRecord.exercises) {
                            exercises.push({ exerciseId: exercise.exerciseId });
                            const exerciseInstance = await DbService.getById(COLLECTIONS.EXERCISES, exercise.exerciseId);
                            exercise.exerciseName = exerciseInstance.title;
                            exercise.translations = exerciseInstance.translations;
                        }
                        const userTemplates = await DbService.getMany(COLLECTIONS.WORKOUTS, { userId: mongoose.Types.ObjectId(req.user._id) });
                        let hasWorkoutTemplateName = false;
                        for (let userTemplate of userTemplates) {
                            let match = true;
                            for (let exercise of userTemplate.exercises) {
                                let innerMatch = false;
                                for (let bodyExercise of exercises) {
                                    if (bodyExercise.exerciseId.toString() == exercise.toString()) {
                                        innerMatch = true;
                                        break;
                                    }
                                }
                                if (!innerMatch) {
                                    match = false;
                                    break;
                                }
                            }
                            if (match && exercises.length == userTemplate.exercises.length) {
                                hasWorkoutTemplateName = true;
                                currentUserRecord.hasWorkoutTemplateName = true;
                                currentUserRecord.workoutTemplateName = userTemplate.name;
                                break;
                            }
                        }
                        if (!hasWorkoutTemplateName) {
                            currentUserRecord.hasWorkoutTemplateName = false;
                        }
                        break;
                    case COLLECTIONS.CALORIES_COUNTER_DAYS:
                        for (let item of currentUserRecord.items) {
                            const itemInstance = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_ITEMS, item.itemId);
                            item.itemInstance = itemInstance;
                        }
                        break;
                }
                cards.push({ card: card, data: currentUserRecord });
            }
        }
        return res.status(HTTP_STATUS_CODES.OK).send({
            cards,
            doNotShow
        });
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;