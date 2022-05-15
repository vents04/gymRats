const mongoose = require('mongoose');
const ResponseError = require('../../errors/responseError');
const { COLLECTIONS, WEIGHT_UNITS, WEIGHT_UNIT_RELATIONS, HTTP_STATUS_CODES, LOGBOOK_PROGRESS_NOTATIONS } = require("../../global");
const oneRepMax = require('../../helperFunctions/oneRepMax');
const DbService = require("../db.service");

const LogbookService = {
    getExercisesProgress: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let exercises = [];
                const workouts = await DbService.getMany(COLLECTIONS.WORKOUT_SESSIONS, { userId: mongoose.Types.ObjectId(userId) });
                for (let workout of workouts) {
                    for (let exercise of workout.exercises) {
                        if (!exercises.some(e => e._id.toString() === exercise.exerciseId.toString())) {
                            const exerciseInstance = await DbService.getById(COLLECTIONS.EXERCISES, exercise.exerciseId);
                            exercises.push({
                                _id: exercise.exerciseId,
                                exerciseInstance,
                                sessions: []
                            })
                        }
                        let sessionOneRepMax = null;
                        for (let set of exercise.sets) {
                            if (set.weight?.amount && set.reps) {
                                const currentOneRepMax = oneRepMax(set.weight.amount, set.reps);
                                if (set.weight.unit == WEIGHT_UNITS.POUNDS) currentOneRepMax = currentOneRepMax * WEIGHT_UNIT_RELATIONS.POUNDS.KILOGRAMS;
                                if (sessionOneRepMax == null || currentOneRepMax > sessionOneRepMax) sessionOneRepMax = currentOneRepMax;
                            }
                        }
                        for (let _exercise of exercises) {
                            if (_exercise._id.toString() == exercise.exerciseId.toString()) {
                                _exercise.sessions.push({
                                    _id: workout._id,
                                    date: workout.date,
                                    month: workout.month,
                                    year: workout.year,
                                    oneRepMax: parseFloat(parseFloat(sessionOneRepMax).toFixed(1)),
                                })
                            }
                        }
                    }
                }
                resolve(exercises);
            } catch (err) {
                console.log(err)
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        });
    },

    getExerciseProgressNotation: (oneRepMaxes) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (oneRepMaxes.length < 2) resolve(null);

                let notation = null;

                let greatestOrm = 0;
                for (let orm of oneRepMaxes) {
                    if (orm > greatestOrm) greatestOrm = orm;
                }

                let average = 0;
                let delta = 0;
                for (let index = 0; index < oneRepMaxes.length; index++) {
                    average += ((oneRepMaxes[index] + greatestOrm) / 2);
                    if (index <= oneRepMaxes.length - 2) delta += parseFloat(parseFloat((oneRepMaxes[index + 1] - oneRepMaxes[index]) / oneRepMaxes[index] * 100).toFixed(2));
                }
                average /= oneRepMaxes.length;
                const difference = Math.abs(average - greatestOrm);
                const percentageDifference = parseFloat(parseFloat(difference / greatestOrm * 100).toFixed(2));
                if (delta < 0) {
                    if (percentageDifference > 2) notation = LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_LOSS;
                    else if (percentageDifference > 1) notation = LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_LOSS;
                    else if (percentageDifference > 0.5) notation = LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_LOSS;
                    else notation = LOGBOOK_PROGRESS_NOTATIONS.NO_LOSS;
                } else {
                    if (percentageDifference > 2) notation = LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_GAIN;
                    else if (percentageDifference > 1) notation = LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_GAIN;
                    else if (percentageDifference > 0.5) notation = LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_GAIN;
                    else notation = LOGBOOK_PROGRESS_NOTATIONS.NO_LOSS;
                }
                resolve(notation);
            } catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    }
}

module.exports = LogbookService;