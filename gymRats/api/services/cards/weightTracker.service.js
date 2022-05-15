const { HTTP_STATUS_CODES, COLLECTIONS, WEIGHT_UNITS, WEIGHT_UNIT_RELATIONS } = require("../../global");
const DbService = require("../db.service");
const mongoose = require("mongoose");
const ResponseError = require("../../errors/responseError");
const { PROGRESS_NOTATION, WEEK_TO_MILLISECONDS } = require("../../../react-native/global");

const WeightTrackerService = {
    getDailyTrend: (_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let trend = null;
                const dailyWeight = await DbService.getById(COLLECTIONS.DAILY_WEIGHTS, _id);
                if (dailyWeight) {
                    const previousDailyWeight = await WeightTrackerService.getPreviousDailyWeight(_id);
                    if (previousDailyWeight) {
                        if (previousDailyWeight.unit != dailyWeight.unit) {
                            switch (previousDailyWeight.unit) {
                                case WEIGHT_UNITS.KILOGRAMS:
                                    previousDailyWeight.weight = previousDailyWeight.weight * WEIGHT_UNIT_RELATIONS.KILOGRAMS.POUNDS;
                                    previousDailyWeight.unit = WEIGHT_UNITS.POUNDS;
                                    break;
                                case WEIGHT_UNITS.POUNDS:
                                    previousDailyWeight.weight = previousDailyWeight.weight * WEIGHT_UNIT_RELATIONS.POUNDS.KILOGRAMS;
                                    previousDailyWeight.unit = WEIGHT_UNITS.KILOGRAMS;
                            }
                        }
                        trend = parseFloat(parseFloat(dailyWeight.weight - previousDailyWeight.weight).toFixed(2));
                    }
                }
                resolve(trend);
            } catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    getPreviousDailyWeight: (_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const dailyWeight = await DbService.getById(COLLECTIONS.DAILY_WEIGHTS, _id);
                const currentDailyWeightTime = new Date(dailyWeight.year, dailyWeight.month - 1, dailyWeight.date).getTime();
                const userId = dailyWeight.userId;

                const times = [];
                const dailyWeights = await DbService.getMany(COLLECTIONS.DAILY_WEIGHTS, { userId: mongoose.Types.ObjectId(userId) });
                for (let currentDailyWeight of dailyWeights) {
                    times.push({ _id: currentDailyWeight._id, time: new Date(currentDailyWeight.year, currentDailyWeight.month - 1, currentDailyWeight.date).getTime() });
                }

                let currentMin = {
                    _id: null,
                    time: null
                };

                for (let time of times) {
                    if ((currentMin.time == null || (Math.abs(currentDailyWeightTime - time.time) < currentMin.time && time.time < currentDailyWeightTime))
                        && time._id.toString() != dailyWeight._id.toString()
                        && time.time < currentDailyWeightTime) {
                        currentMin.time = Math.abs(currentDailyWeightTime - time.time);
                        currentMin._id = time._id;
                    }
                }

                if (currentMin._id == null) {
                    resolve(null);
                }

                for (let dailyWeight of dailyWeights) {
                    if (dailyWeight._id.toString() == currentMin._id.toString()) {
                        resolve(dailyWeight);
                    }
                }

            } catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    getWeightGraph: (userId, currentUnit) => {
        return new Promise(async (resolve, reject) => {
            try {
                const dailyWeights = await DbService.getMany(COLLECTIONS.DAILY_WEIGHTS, { userId: mongoose.Types.ObjectId(userId) });
                const graphData = [["Date", "Weight"]];
                for (let dailyWeight of dailyWeights) {
                    if (dailyWeight.unit != currentUnit) {
                        switch (dailyWeight.unit) {
                            case WEIGHT_UNITS.KILOGRAMS:
                                dailyWeight.weight = dailyWeight.weight * WEIGHT_UNIT_RELATIONS.KILOGRAMS.POUNDS;
                                dailyWeight.unit = WEIGHT_UNITS.POUNDS;
                                break;
                            case WEIGHT_UNITS.POUNDS:
                                dailyWeight.weight = dailyWeight.weight * WEIGHT_UNIT_RELATIONS.POUNDS.KILOGRAMS;
                                dailyWeight.unit = WEIGHT_UNITS.KILOGRAMS;
                        }
                    }
                    graphData.push([new Date(dailyWeight.year, dailyWeight.month - 1, dailyWeight.date), dailyWeight.weight]);
                }

                resolve(graphData);
            } catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    getWeeklyAverage: (_id) => {
        return new Promise(async (resolve, reject) => {

        })
    },

    updateAllWeightUnits: (userId, currentWeightUnit) => {
        return new Promise(async (resolve, reject) => {
            try {
                const dailyWeights = await DbService.getMany(COLLECTIONS.DAILY_WEIGHTS, { userId: mongoose.Types.ObjectId(userId) });
                for (let dailyWeight of dailyWeights) {
                    if (dailyWeight.unit != currentWeightUnit) {
                        switch (dailyWeight.unit) {
                            case WEIGHT_UNITS.KILOGRAMS:
                                await DbService.update(COLLECTIONS.DAILY_WEIGHTS, { _id: mongoose.Types.ObjectId(dailyWeight._id) }, { weight: dailyWeight.weight * WEIGHT_UNIT_RELATIONS.KILOGRAMS.POUNDS, unit: WEIGHT_UNITS.POUNDS })
                                break;
                            case WEIGHT_UNITS.POUNDS:
                                await DbService.update(COLLECTIONS.DAILY_WEIGHTS, { _id: mongoose.Types.ObjectId(dailyWeight._id) }, { weight: dailyWeight.weight * WEIGHT_UNIT_RELATIONS.POUNDS.KILOGRAMS, unit: WEIGHT_UNITS.KILOGRAMS })
                                break;
                        }
                    }
                }
                resolve();
            } catch (error) {
                reject(new ResponseError(error.message || "Internal server error"));
            }
        })
    },

    getProgressNotation: (date, month, year, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const currentDate = new Date(year, month - 1, date);
                let progressNotation = null;
                let average = 0;
                let weeklyWeights = [];
                const weights = await DbService.getMany(COLLECTIONS.DAILY_WEIGHTS, { userId: mongoose.Types.ObjectId(userId) })
                for (let weight of weights) {
                    const weightDate = new Date(weight.year, weight.month - 1, weight.date);
                    if (weightDate.getTime() < currentDate.getTime() && weightDate.getTime() + WEEK_TO_MILLISECONDS > currentDate.getTime()) {
                        weeklyWeights.push(weight);
                    }
                }
                if (weeklyWeights.length > 1) {
                    let greatestWeight = 0;
                    for (let weight of weeklyWeights) {
                        if (weight.weight > greatestWeight) greatestWeight = weight.weight;
                    }
                    for (let weight of weeklyWeights) {
                        if (weight.unit == WEIGHT_UNITS.KILOGRAMS) {
                            average += ((weight.weight + greatestWeight) / 2);
                            continue;
                        }
                        average += ((weight.weight * WEIGHT_UNIT_RELATIONS.KILOGRAMS.POUNDS + greatestWeight) / 2);
                    }
                    average /= weeklyWeights.length;
                    const percentageDifference = (average - weeklyWeights[0]) / weeklyWeights[0] * 100;
                    if (percentageDifference < 0) {
                        if (percentageDifference > -0.5) progressNotation = PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_LOSS
                        else if (percentageDifference > -1) progressNotation = PROGRESS_NOTATION.SUFFICIENT_WEIGHT_LOSS
                        else progressNotation = PROGRESS_NOTATION.RAPID_WEIGHT_LOSS
                    } else {
                        if (percentageDifference < 0.25) progressNotation = PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_GAIN
                        else if (percentageDifference < 0.75) progressNotation = PROGRESS_NOTATION.SUFFICIENT_WEIGHT_GAIN
                        else progressNotation = PROGRESS_NOTATION.RAPID_WEIGHT_GAIN
                    }
                }
                resolve(progressNotation)
            } catch (error) {
                reject(new ResponseError(error.message || "Internal server error"));
            }
        });
    }
}

module.exports = WeightTrackerService;