const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');

const Exercise = require('../db/models/logbook/exercise.model');
const Workout = require('../db/models/logbook/workout.model');
const Session = require('../db/models/logbook/session.model');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, RELATION_STATUSES, DEFAULT_ERROR_MESSAGE } = require('../global');
const { workoutPostValidation, workoutSessionValidation, workoutTemplateCheckValidation, workoutUpdateValidation } = require('../validation/hapi');
const { quicksort } = require('../helperFunctions/quickSortForExercises');

router.post("/workout", authenticate, async (req, res, next) => {
    const { error } = workoutPostValidation(req.body, req.headers.lng);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        for (let exerciseId of req.body.exercises) {
            const exercise = await DbService.getById(COLLECTIONS.EXERCISES, exerciseId);
            if (!exercise) return next(new ResponseError("Exercise not found", HTTP_STATUS_CODES.NOT_FOUND, 40));
        }

        const workout = new Workout(req.body);
        workout.userId = mongoose.Types.ObjectId(req.user._id);
        await DbService.create(COLLECTIONS.WORKOUTS, workout);

        const workoutSessions = await DbService.getMany(COLLECTIONS.WORKOUT_SESSIONS, {
            userId: mongoose.Types.ObjectId(req.user._id)
        });

        for (let workoutSession of workoutSessions) {
            if (workoutSession.exercises.length != workout.exercises.length) continue;
            let isValid = true;
            for (let exercise of workoutSession.exercises) {
                if (!req.body.exercises.includes(exercise.exerciseId.toString())) isValid = false;
            }
            if (isValid) {
                await DbService.update(COLLECTIONS.WORKOUT_SESSIONS, { _id: mongoose.Types.ObjectId(workoutSession._id) }, {
                    workoutId: workout._id
                })
            }
        }

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
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
                            exercise.exerciseInstance = exerciseInstance;
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
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete("/workout/:id", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid workout id", HTTP_STATUS_CODES.BAD_REQUEST, 41))

    try {
        const workout = await DbService.getById(COLLECTIONS.WORKOUTS, req.params.id);
        if (!workout) return next(new ResponseError("Workout not found", HTTP_STATUS_CODES.NOT_FOUND, 42));

        if (workout.userId.toString() != req.user._id.toString()) return next(new ResponseError("You are not allowed to delete this workout", HTTP_STATUS_CODES.FORBIDDEN, 43));

        await DbService.delete(COLLECTIONS.WORKOUTS, { _id: mongoose.Types.ObjectId(req.params.id) });

        await DbService.updateMany(COLLECTIONS.WORKOUT_SESSIONS, { workoutId: mongoose.Types.ObjectId(req.params.id) }, { workoutId: null })

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/workout/:id", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid workout id", HTTP_STATUS_CODES.BAD_REQUEST, 41))

    const { error } = workoutUpdateValidation(req.body, req.headers.lng);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const workout = await DbService.getById(COLLECTIONS.WORKOUTS, req.params.id);
        if (!workout) return next(new ResponseError("Workout not found", HTTP_STATUS_CODES.NOT_FOUND, 42));

        if (workout.userId.toString() != req.user._id.toString()) return next(new ResponseError("You are not allowed to update this workout", HTTP_STATUS_CODES.FORBIDDEN, 44));

        let exercises = [];
        for (let exercise of req.body.exercises) {
            exercises.push(mongoose.Types.ObjectId(exercise));
        }
        req.body.exercises = exercises;

        await DbService.update(COLLECTIONS.WORKOUTS, { _id: mongoose.Types.ObjectId(req.params.id) }, req.body);

        await DbService.updateMany(COLLECTIONS.WORKOUT_SESSIONS, { workoutId: mongoose.Types.ObjectId(req.params.id) }, { workoutId: null })

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/has-workout-templates", authenticate, async (req, res, next) => {
    try {
        const templates = await DbService.getMany(COLLECTIONS.WORKOUTS, { userId: mongoose.Types.ObjectId(req.user._id) });
        return res.status(HTTP_STATUS_CODES.OK).send({
            hasWorkoutTemplates: templates.length > 0
        })
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.get("/workout-templates", authenticate, async (req, res, next) => {
    try {
        let finalTemplates = [];
        const templates = await DbService.getMany(COLLECTIONS.WORKOUTS, { userId: mongoose.Types.ObjectId(req.user._id) });
        let index = 0;
        for (let template of templates) {
            finalTemplates.push({
                _id: template._id,
                name: template.name,
                isPublic: template.isPublic,
                createdDt: template.createdDt,
                userId: template.userId,
                exercises: []
            })
            for (let exercise of template.exercises) {
                const exerciseInstance = await DbService.getById(COLLECTIONS.EXERCISES, exercise);
                finalTemplates[index].exercises.push({ exerciseId: exercise, exerciseInstance: exerciseInstance });
            }
            index++;
        }
        return res.status(HTTP_STATUS_CODES.OK).send({
            templates: finalTemplates
        })
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.post("/workout-session", authenticate, async (req, res, next) => {
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST, 4));
    }

    const { error } = workoutSessionValidation(req.body, req.headers.lng);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingSession = await DbService.getOne(COLLECTIONS.WORKOUT_SESSIONS, {
            userId: mongoose.Types.ObjectId(req.user._id),
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year
        });

        if (existingSession) await DbService.delete(COLLECTIONS.WORKOUT_SESSIONS, { _id: mongoose.Types.ObjectId(existingSession._id) })

        let exerciseIds = [];
        for (let exercise of req.body.exercises) {
            exerciseIds.push(exercise.exerciseId);
            const foundExercise = await DbService.getById(COLLECTIONS.EXERCISES, exercise.exerciseId);
            if (!foundExercise) return next(new ResponseError("Exercise not found", HTTP_STATUS_CODES.NOT_FOUND, 40));
        }

        const workouts = await DbService.getMany(COLLECTIONS.WORKOUTS, {
            userId: mongoose.Types.ObjectId(req.user._id),
        })

        const workoutSession = new Session({
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year,
            userId: mongoose.Types.ObjectId(req.user._id),
            exercises: req.body.exercises
        });

        for (let workout of workouts) {
            if (workout.exercises.length != exerciseIds.length) continue;
            let isValid = true;
            for (let exercise of workout.exercises) {
                if (!exerciseIds.includes(exercise.toString())) isValid = false;
            }
            if (isValid) {
                workoutSession.workoutId = workout._id;
                break;
            }
        }

        await DbService.create(COLLECTIONS.WORKOUT_SESSIONS, workoutSession);

        for (let exercise of workoutSession.exercises) {
            await DbService.updateWithInc(COLLECTIONS.EXERCISES, { _id: mongoose.Types.ObjectId(exercise.exerciseId) }, { timesUsed: +1 });
        }

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/workout-session", authenticate, async (req, res, next) => {
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST, 4));
    }

    if (req.query.clientId && !mongoose.Types.ObjectId.isValid(req.query.clientId))
        return next(new ResponseError("Invalid client id", HTTP_STATUS_CODES.BAD_REQUEST, 15));

    try {
        if (req.query.clientId) {
            const client = await DbService.getById(COLLECTIONS.USERS, req.query.clientId);
            if (!client) return next(new ResponseError("Client not found", HTTP_STATUS_CODES.NOT_FOUND, 16));

            const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
            if (!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND, 17));

            const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id), clientId: mongoose.Types.ObjectId(client._id), status: RELATION_STATUSES.ACTIVE });
            if (!relation) return next(new ResponseError("Cannot get clients' data if you do not have an active relation with them", HTTP_STATUS_CODES.CONFLICT, 18));
        }

        const workoutSession = await DbService.getOne(COLLECTIONS.WORKOUT_SESSIONS, {
            userId: req.query.clientId ? mongoose.Types.ObjectId(req.query.clientId) : mongoose.Types.ObjectId(req.user._id),
            date: +req.query.date,
            month: +req.query.month,
            year: +req.query.year,
        });

        if (workoutSession) {
            for (let exercise of workoutSession.exercises) {
                const exerciseInstance = await DbService.getOne(COLLECTIONS.EXERCISES, { _id: mongoose.Types.ObjectId(exercise.exerciseId) });
                exercise.exerciseName = exerciseInstance.title;
                exercise.exerciseInstance = exerciseInstance;
            }
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            session: workoutSession
        })
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete("/workout-session", authenticate, async (req, res, next) => {
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST, 4));
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
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post('/check-template', authenticate, async (req, res, next) => {
    const { error } = workoutTemplateCheckValidation(req.body, req.headers.lng);
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
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/search", authenticate, async (req, res, next) => {
    let words = req.query.words;
    if (!words) {
        const exercises = await DbService.getManyWithSortAndLimit(COLLECTIONS.EXERCISES, {}, { timesUsed: -1 }, 50);
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: exercises
        })
    }
    try {
        words = words.split(" ");
        let sorted = [];
        if (words && words != "") {
            for (let word of words) {
                const exercises = await DbService.getMany(COLLECTIONS.EXERCISES, { keywords: { "$regex": word, "$options": "i" } });

                for (let i = 0; i < exercises.length; i++) {
                    let shouldContinue = false;

                    for (let j = 0; j < sorted.length; j++) {
                        if (sorted[j].title == exercises[i].title) {
                            sorted[j].timesFound++;
                            shouldContinue = true;
                        }
                    }
                    if (shouldContinue) continue;

                    Object.assign(exercises[i], { timesFound: 1 });
                    sorted.push(exercises[i]);
                }
            }
        }

        quicksort(sorted, 0, sorted.length - 1)

        return res.status(HTTP_STATUS_CODES.OK).send({
            results: sorted.splice(0, 50)
        })
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;