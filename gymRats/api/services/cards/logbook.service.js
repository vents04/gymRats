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
                const workouts = await DbService.getManyWithSort(COLLECTIONS.WORKOUT_SESSIONS, { userId: mongoose.Types.ObjectId(userId) }, {year:-1,month:-1,date:1});
                for (let workout of workouts) {
                    for (let exercise of workout.exercises) {
                        if (!exercises.some(e => e._id.toString() === exercise.exerciseId.toString())) {
                            const exerciseInstance = await DbService.getById(COLLECTIONS.EXERCISES, exercise.exerciseId);
                            exercises.push({
                                _id: exercise.exerciseId,
                                exerciseInstance,
                                sessions: [],
                            })
                        }
                        let sessionOneRepMax = null;
                        for (let set of exercise.sets) {
                            if (set.weight && set.weight.amount && set.reps) {
                                const currentOneRepMax = oneRepMax(set.weight.amount, set.reps) || 0;
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
                for (let exercise of exercises) {
                    let lastSessionProgressNotation = null;
                    let lastFiveSessionsProgressNotation = null;
                    let orms = [];
                    for (let session of exercise.sessions) {
                        if (session.oneRepMax) orms.push(session.oneRepMax);
                    }
                    if (orms.length >= 2)
                        lastSessionProgressNotation = await LogbookService.getProgressNotationForOneSession([orms[orms.length - 2], orms[orms.length - 1]]);
                    if (orms.length >= 5)
                        lastFiveSessionsProgressNotation = await LogbookService.getProgressNotationForFiveSessions(orms);
                    exercise.lastSessionProgressNotation = lastSessionProgressNotation;
                    exercise.lastFiveSessionsProgressNotation = lastFiveSessionsProgressNotation;
                }
                resolve(exercises);
            } catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        });
    },

    getPercentageDifferenceBetweenAverageOrmComparedToGreatestOrm: (orms, greatestOrm) => {
        let average = 0;
        for (let index = 0; index < orms.length; index++) {
            average += ((orms[index] + greatestOrm) / 2);
        }
        average /= orms.length;
        const difference = Math.abs(average - greatestOrm);
        return parseFloat(parseFloat(difference / greatestOrm * 100).toFixed(2));
    },

    getNotationEnum: (delta, percentageDifference) => {
        let notation = null;
        if (delta < 0) {
            if (percentageDifference > 1) notation = LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_LOSS;
            else if (percentageDifference > 0.5) notation = LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_LOSS;
            else if (percentageDifference > 0.25) notation = LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_LOSS;
            else notation = LOGBOOK_PROGRESS_NOTATIONS.NO_CHANGE;
        } else {
            if (percentageDifference > 1) notation = LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_GAIN;
            else if (percentageDifference > 0.5) notation = LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_GAIN;
            else if (percentageDifference > 0.25) notation = LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_GAIN;
            else notation = LOGBOOK_PROGRESS_NOTATIONS.NO_CHANGE;
        }
        return notation
    },

    getGreatestOrm: (orms) => {
        let greatestOrm = 0;
        for (let orm of orms) {
            if (orm > greatestOrm) greatestOrm = orm;
        }
        return greatestOrm;
    },

    getProgressNotationForOneSession: (orms) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (orms.length < 2) resolve(null);

                const greatestOrm = LogbookService.getGreatestOrm(orms);

                const percentageDifference = LogbookService.getPercentageDifferenceBetweenAverageOrmComparedToGreatestOrm(orms, greatestOrm);

                const delta = (orms[orms.length - 1] - orms[0]) / orms[0] * 100;

                const notation = LogbookService.getNotationEnum(delta, percentageDifference);

                resolve(notation);
            } catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    getProgressNotationForFiveSessions: (orms) => {
        return new Promise(async (resolve, reject) => {
            if (orms.length < 5) resolve(null);
            orms = orms.slice(-5);

            const lastProgressGraphRange = (await LogbookService.getProgressGraphRanges(orms[0], orms.length))[orms.length - 1];
            let notation = null;
            const lastOrm = orms[orms.length - 1];
            if (lastOrm > lastProgressGraphRange.strengthGainRanges[0]) {
                notation = LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_GAIN;
            } else if (lastOrm < lastProgressGraphRange.strengthLossRanges[1]) {
                notation = LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_LOSS;
            } else {
                if (lastOrm <= lastProgressGraphRange.strengthGainRanges[0]
                    && lastOrm >= lastProgressGraphRange.strengthGainRanges[1])
                    notation = LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_GAIN;
                else if (lastOrm <= lastProgressGraphRange.slightStrengthGainRanges[0]
                    && lastOrm >= lastProgressGraphRange.slightStrengthGainRanges[1])
                    notation = LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_GAIN;
                else if (lastOrm <= lastProgressGraphRange.noChangeRanges[0]
                    && lastOrm >= lastProgressGraphRange.noChangeRanges[1])
                    notation = LOGBOOK_PROGRESS_NOTATIONS.NO_CHANGE;
                else if (lastOrm <= lastProgressGraphRange.slightStrengthLossRanges[0]
                    && lastOrm >= lastProgressGraphRange.slightStrengthLossRanges[1])
                    notation = LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_LOSS;
                else notation = LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_LOSS;
            }
            resolve(notation);
        })
    },

    getProgressGraphRanges: (orm, sessions) => {
        return new Promise(async (resolve, reject) => {
            try {
                orm = parseFloat(parseFloat(orm).toFixed(2))
                let ranges = {};
                for (let index = 0; index < sessions; index++) {
                    let strengthGainRanges = [];
                    let slightStrengthGainRanges = [];
                    let noChangeRanges = [];
                    let slightStrengthLossRanges = [];
                    let strengthLossRanges = [];
                    if (index == 0) {
                        strengthGainRanges.push(
                            parseFloat(parseFloat(orm + (0.01 * orm)).toFixed(2)),
                            parseFloat(parseFloat(orm + (0.005 * orm)).toFixed(2)),
                        )
                        slightStrengthGainRanges.push(
                            parseFloat(parseFloat(strengthGainRanges[1] - 0.01).toFixed(2)),
                            parseFloat(parseFloat(orm + (0.0025 * orm)).toFixed(2)),
                        )
                        noChangeRanges.push(
                            parseFloat(parseFloat(slightStrengthGainRanges[1] - 0.01).toFixed(2)),
                            parseFloat(parseFloat(orm - (0.0025 * orm)).toFixed(2)),
                        )
                        slightStrengthLossRanges.push(
                            parseFloat(parseFloat(noChangeRanges[1] - 0.01).toFixed(2)),
                            parseFloat(parseFloat(orm - (0.005 * orm)).toFixed(2)),
                        )
                        strengthLossRanges.push(
                            parseFloat(parseFloat(slightStrengthLossRanges[1] - 0.01).toFixed(2)),
                            parseFloat(parseFloat(orm - (0.01 * orm)).toFixed(2)),
                        )
                    } else {
                        strengthGainRanges.push(
                            parseFloat(parseFloat(ranges[index - 1].strengthGainRanges[0] + (0.01 * ranges[index - 1].strengthGainRanges[0])).toFixed(2)),
                            parseFloat(parseFloat(ranges[index - 1].strengthGainRanges[1] + (0.005 * ranges[index - 1].strengthGainRanges[1])).toFixed(2)),
                        )
                        slightStrengthGainRanges.push(
                            parseFloat(parseFloat(strengthGainRanges[1] - 0.01).toFixed(2)),
                            parseFloat(parseFloat(ranges[index - 1].slightStrengthGainRanges[1] + (0.0025 * ranges[index - 1].slightStrengthGainRanges[1])).toFixed(2)),
                        )
                        noChangeRanges.push(
                            parseFloat(parseFloat(slightStrengthGainRanges[1] - 0.01).toFixed(2)),
                            parseFloat(parseFloat(ranges[index - 1].noChangeRanges[1] - (0.0025 * ranges[index - 1].noChangeRanges[1])).toFixed(2)),
                        )
                        slightStrengthLossRanges.push(
                            parseFloat(parseFloat(noChangeRanges[1] - 0.01).toFixed(2)),
                            parseFloat(parseFloat(ranges[index - 1].slightStrengthLossRanges[1] - (0.005 * ranges[index - 1].slightStrengthLossRanges[1])).toFixed(2)),
                        )
                        strengthLossRanges.push(
                            parseFloat(parseFloat(slightStrengthLossRanges[1] - 0.01).toFixed(2)),
                            parseFloat(parseFloat(ranges[index - 1].strengthLossRanges[1] - (0.01 * ranges[index - 1].strengthLossRanges[1])).toFixed(2)),
                        )
                    }
                    ranges[index] = {
                        strengthGainRanges,
                        slightStrengthGainRanges,
                        noChangeRanges,
                        slightStrengthLossRanges,
                        strengthLossRanges
                    }
                }
                resolve(ranges);
            } catch (err) {
                reject(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
            }
        })
    },
}

module.exports = LogbookService;