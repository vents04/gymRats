const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authenticate } = require('../middlewares/authenticate');
const DbService = require('../services/db.service');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, CARD_COLLECTIONS, COLLECTIONS } = require('../global');
const WeightTrackerService = require('../services/cards/weightTracker.service');

router.get('/:date/:timezoneOffset', authenticate, async (req, res, next) => {
    const date = new Date(new Date(req.params.date).setMinutes(new Date(req.params.date).getMinutes() - req.params.timezoneOffset));
    try {
        let cards = [];
        let doNotShow = [];
        for (let card of CARD_COLLECTIONS) {
            const currentUserRecord = await DbService.getOne(card, {
                userId: mongoose.Types.ObjectId(req.user._id),
                date: +date.getDate(),
                month: +date.getMonth() + 1,
                year: +date.getFullYear(),
            });

            if (currentUserRecord) {
                doNotShow.push(card);
                switch (card) {
                    case COLLECTIONS.DAILY_WEIGHTS:
                        const trend = await WeightTrackerService.getDailyTrend(currentUserRecord._id);
                        currentUserRecord.trend = trend;
                        currentUserRecord.weight = parseFloat(currentUserRecord.weight).toFixed(2);
                        break;
                    case COLLECTIONS.WORKOUT_SESSIONS:
                        let exercises = [];
                        for (let exercise of currentUserRecord.exercises) {
                            exercises.push({ exerciseId: exercise.exerciseId });
                            const exerciseInstance = await DbService.getById(COLLECTIONS.EXERCISES, exercise.exerciseId);
                            exercise.exerciseName = exerciseInstance.title;
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
                }
                cards.push({ card: card, data: currentUserRecord });
            }
        }
        res.status(HTTP_STATUS_CODES.OK).send({
            cards: cards,
            doNotShow: doNotShow
        });
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;