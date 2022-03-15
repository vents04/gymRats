const express = require('express');
const mongoose = require('mongoose');
const Exercise = require('../db/models/logbook/exercise.model');
const Workout = require('../db/models/logbook/workout.model');
const Session = require('../db/models/logbook/session.model');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, COLLECTIONS, APP_EMAIL } = require('../global');
const router = express.Router();

const { authenticate } = require('../middlewares/authenticate');
const DbService = require('../services/db.service');
const { workoutPostValidation, workoutSessionValidation, exercisePostValidation, workoutTemplateCheckValidation } = require('../validation/hapi');

router.post("/exercise", authenticate, async (req, res, next) => {
    const { error } = exercisePostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        if (req.body.keywords && req.body.keywords.length > 0 && req.user.email != APP_EMAIL) {
            return next(new ResponseError("Keywords is a forbidden field for your user rights", HTTP_STATUS_CODES.FORBIDDEN));
        }
        if (req.body.targetMuscles) {
            for (let targetMuscle of req.body.targetMuscles) {
                const muscle = await DbService.getById(COLLECTIONS.MUSCLES, targetMuscle);
                if (!muscle) return next(new ResponseError("Muscle not found", HTTP_STATUS_CODES.BAD_REQUEST));
            }
        }

        const exercise = new Exercise(req.body);
        exercise.userId = mongoose.Types.ObjectId(req.user._id);
        await DbService.create(COLLECTIONS.EXERCISES, exercise);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/workout", authenticate, async (req, res, next) => {
    const { error } = workoutPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        for (let exerciseId of req.body.exercises) {
            const exercise = await DbService.getById(COLLECTIONS.EXERCISES, exerciseId);
            if (!exercise) return next(new ResponseError("Exercise not found", HTTP_STATUS_CODES.NOT_FOUND));
        }

        const workout = new Workout(req.body);
        workout.userId = mongoose.Types.ObjectId(req.user._id);
        await DbService.create(COLLECTIONS.WORKOUTS, workout);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/workout", authenticate, async (req, res, next) => {
    try {
        const templates = await DbService.getMany(COLLECTIONS.WORKOUTS, { userId: mongoose.Types.ObjectId(req.user._id) });
        let finalTemplates = [];
        for (let template of templates) {
            const sessions = await DbService.getMany(COLLECTIONS.WORKOUT_SESSIONS, { userId: mongoose.Types.ObjectId(req.user._id) });
            const nearestSession = {
                dt: new Date(null).getTime(),
                session: null
            }
            for (let session of sessions) {
                let match = true;
                for (let templateExercise of template.exercises) {
                    let innerMatch = false;
                    for (let exercise of session.exercises) {
                        if (exercise.exerciseId.toString() == templateExercise.toString()) {
                            innerMatch = true;
                            break;
                        }
                    }
                    if (!innerMatch) {
                        match = false;
                        break;
                    }
                }
                if (match && session.exercises.length == template.exercises.length) {
                    if (new Date().getTime() - new Date(nearestSession.dt).getTime()
                        > new Date().getTime() - new Date(session.year, session.month - 1, session.date).getTime()) {
                        nearestSession.dt = new Date(session.year, session.month - 1, session.date).getTime()
                        for (let exercise of session.exercises) {
                            const exerciseInstance = await DbService.getById(COLLECTIONS.EXERCISES, exercise.exerciseId);
                            exercise.exerciseName = exerciseInstance.title;
                        }
                        nearestSession.session = session;
                    }
                }
            }
            if (nearestSession.session) {
                template.nearestSession = nearestSession;
                finalTemplates.push(template);
            }
        }
        res.status(HTTP_STATUS_CODES.OK).send({
            templates: finalTemplates,
        })
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/workout/:id/last-session", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId(req.params.id)) return next(new ResponseError("Invalid workout id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const template = await DbService.getById(COLLECTIONS.WORKOUTS, req.params.id);
        if (!template) return next(new ResponseError("Template not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (template.userId.toString() != req.user._id.toString()) return next(new ResponseError("Forbidden", HTTP_STATUS_CODES.FORBIDDEN));

        const sessions = await DbService.getMany(COLLECTIONS.WORKOUT_SESSIONS, { userId: mongoose.Types.ObjectId(req.user._id) });
        const nearestSession = {
            dt: new Date(null),
            session: null
        }
        for (let session of sessions) {
            for (let exercise of session.exercises) {

            }
        }
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/workout-session", authenticate, async (req, res, next) => {
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    const { error } = workoutSessionValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingSession = await DbService.getOne(COLLECTIONS.WORKOUT_SESSIONS, {
            userId: mongoose.Types.ObjectId(req.user._id),
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year
        });

        if (existingSession) await DbService.delete(COLLECTIONS.WORKOUT_SESSIONS, { _id: mongoose.Types.ObjectId(existingSession._id) })

        for (let exercise of req.body.exercises) {
            const foundExercise = await DbService.getById(COLLECTIONS.EXERCISES, exercise.exerciseId);
            if (!foundExercise) return next(new ResponseError("Exercise not found", HTTP_STATUS_CODES.NOT_FOUND));
        }

        const workoutSession = new Session({
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year,
            userId: mongoose.Types.ObjectId(req.user._id),
            exercises: req.body.exercises
        });
        await DbService.create(COLLECTIONS.WORKOUT_SESSIONS, workoutSession);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/workout-session", authenticate, async (req, res, next) => {
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try {
        const workoutSession = await DbService.getOne(COLLECTIONS.WORKOUT_SESSIONS, {
            userId: mongoose.Types.ObjectId(req.user._id),
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year,
        });
        if (workoutSession) {
            for (let exercise of workoutSession.exercises) {
                const exerciseInstance = await DbService.getOne(COLLECTIONS.EXERCISES, { _id: mongoose.Types.ObjectId(exercise.exerciseId) });
                exercise.exerciseName = exerciseInstance.title;
            }
        }
        res.status(HTTP_STATUS_CODES.OK).send({
            session: workoutSession
        })
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete("/workout-session", authenticate, async (req, res, next) => {
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try {
        await DbService.delete(COLLECTIONS.WORKOUT_SESSIONS, {
            userId: mongoose.Types.ObjectId(req.user._id),
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year,
        });
        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post('/check-template', authenticate, async (req, res, next) => {
    const { error } = workoutTemplateCheckValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const userTemplates = await DbService.getMany(COLLECTIONS.WORKOUTS, { userId: mongoose.Types.ObjectId(req.user._id) });
        for (let userTemplate of userTemplates) {
            let matching = true;
            for (let exercise of userTemplate.exercises) {
                let innerMatch = false;
                for (let bodyExercise of req.body.exercises) {
                    if (bodyExercise.exerciseId.toString() == exercise.toString()) {
                        innerMatch = true;
                        break;
                    }
                }
                if (!innerMatch) {
                    matching = false;
                    break;
                }
            }
            if (req.body.exercises.length != userTemplate.exercises.length) {
                matching = false;
            }
            if (matching) {
                res.status(HTTP_STATUS_CODES.OK).send({
                    hasMatchingTemplate: true
                })
                return;
            }
        }
        res.status(HTTP_STATUS_CODES.OK).send({
            hasMatchingTemplate: false
        })
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/search", authenticate, async (req, res, next) => {
    let words = req.query.words;
    if (!words) {
        const exercises = await DbService.getMany(COLLECTIONS.EXERCISES, {});
        for (let exercise of exercises) {
            const workoutSessions = await DbService.getMany(COLLECTIONS.WORKOUT_SESSIONS, { exercises: { $elemMatch: { exerciseId: mongoose.Types.ObjectId(exercise._id) } } });
            exercise.sessionsCount = workoutSessions.length;
        }
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: exercises
        })
    }
    try {
        words = words.split(" ");
        let sorted = [];
        if (words) {
            for (let word of words) {
                const exercises = await DbService.getMany(COLLECTIONS.EXERCISES, { keywords: { "$regex": word } });

                for (let i = 0; i < exercises.length; i++) {
                    let shouldContinue = false;

                    for (let j = 0; j < sorted.length; j++) {
                        if (sorted[j].title == exercises[i].title) {
                            sorted[j].timesFound++;
                            shouldContinue = true;
                        }
                    }
                    if (shouldContinue) continue;

                    const finalResult = Object.assign(exercises[i], { timesFound: 1 });
                    sorted.push(finalResult);
                }
            }
        }
        for (let i = 0; i < sorted.length; i++) {
            for (let j = 0; j < (sorted.length - i - 1); j++) {
                var temp = sorted[j]
                if (sorted[j].timesFound < sorted[j + 1].timesFound) {
                    sorted[j] = sorted[j + 1]
                    sorted[j + 1] = temp
                }
                if (sorted[j].timesFound == sorted[j + 1].timesFound) {
                    if (sorted[j].keywords.length > sorted[j + 1].keywords.length) {
                        sorted[j] = sorted[j + 1];
                        sorted[j + 1] = temp;
                    }
                }
            }
        }

        const allExercises = await DbService.getMany(COLLECTIONS.EXERCISES, {});
        for (let i = 0; i < allExercises.length; i++) {
            let alreadyAdded = false;
            for (let j = 0; j < sorted.length; j++) {
                if (allExercises[i].title == sorted[j].title) {
                    alreadyAdded = true;
                }
            }
            if (!alreadyAdded) sorted.push(allExercises[i]);
        }

        for (let exercise of sorted) {
            const workoutSessions = await DbService.getMany(COLLECTIONS.WORKOUT_SESSIONS, { exercises: { $elemMatch: { exerciseId: mongoose.Types.ObjectId(exercise._id) } } });
            exercise.sessionsCount = workoutSessions.length;
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            results: sorted
        })
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;