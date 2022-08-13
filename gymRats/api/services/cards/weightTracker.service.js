const { HTTP_STATUS_CODES, COLLECTIONS, WEIGHT_UNITS, WEIGHT_UNIT_RELATIONS, PROGRESS_NOTATION, WEEK_TO_MILLISECONDS } = require("../../global");
const DbService = require("../db.service");
const mongoose = require("mongoose");
const ResponseError = require("../../errors/responseError");
const progressTips = require("../../progressTips");

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
                let weeklyWeights = await DbService.getManyWithSortAndLimit(COLLECTIONS.DAILY_WEIGHTS, {
                    userId: mongoose.Types.ObjectId(userId),
                    "$and": [
                        { "$or": [{ year: { "$lt": currentDate.getFullYear() } }, { year: { "$eq": currentDate.getFullYear() } }] },
                        { "$or": [{ month: { "$lt": currentDate.getMonth() + 1 } }, { month: { "$eq": currentDate.getMonth() + 1 } }] },
                        { "$or": [{ date: { "$lt": currentDate.getDate() } }, { date: { "$eq": currentDate.getDate() } }] }
                    ]
                }, { year: -1, month: -1, date: -1 }, 5);
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
                    const lowestEndRangeValue = weeklyWeights[0].weight > weeklyWeights[weeklyWeights.length - 1].weight ? weeklyWeights[weeklyWeights.length - 1].weight : weeklyWeights[0].weight;
                    const percentageDifference = (average - lowestEndRangeValue) / lowestEndRangeValue * 100;
                    const lastDate = new Date(weeklyWeights[0].year, weeklyWeights[0].month - 1, weeklyWeights[0].date).getTime();
                    const firstDate = new Date(weeklyWeights[weeklyWeights.length - 1].year, weeklyWeights[weeklyWeights.length - 1].month - 1, weeklyWeights[weeklyWeights.length - 1].date).getTime();
                    const periodInDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
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
                reject(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        });
    },

    getProgressGraphRanges: (weight, weeks) => {
        return new Promise(async (resolve, reject) => {
            try {
                weight = parseFloat(parseFloat(weight).toFixed(2))
                let ranges = {};
                for (let index = 0; index < weeks; index++) {
                    let sufficientWeightGainRanges = [];
                    let insufficientWeightGainRanges = [];
                    let insufficientWeightLossRanges = [];
                    let sufficientWeightLossRanges = [];
                    if (index == 0) {
                        sufficientWeightGainRanges.push(
                            parseFloat(parseFloat(weight + (0.0075 * weight)).toFixed(2)),
                            parseFloat(parseFloat(weight + (0.0025 * weight)).toFixed(2)),
                        )
                        insufficientWeightGainRanges.push(
                            parseFloat(parseFloat(sufficientWeightGainRanges[1] - 0.01).toFixed(2)),
                            weight
                        )
                        insufficientWeightLossRanges.push(
                            parseFloat(parseFloat(weight - 0.01).toFixed(2)),
                            parseFloat(parseFloat(weight - (0.005 * weight)).toFixed(2)),
                        )
                        sufficientWeightLossRanges.push(
                            parseFloat(parseFloat(insufficientWeightLossRanges[1] - 0.01).toFixed(2)),
                            parseFloat(parseFloat(weight - (0.01 * weight)).toFixed(2)),
                        )
                    } else {
                        sufficientWeightGainRanges.push(
                            parseFloat(parseFloat(ranges[index - 1].sufficientWeightGainRanges[0] + (0.0075 * ranges[index - 1].sufficientWeightGainRanges[0])).toFixed(2)),
                            parseFloat(parseFloat(ranges[index - 1].sufficientWeightGainRanges[1] + (0.0025 * ranges[index - 1].sufficientWeightGainRanges[1])).toFixed(2)),
                        )
                        insufficientWeightGainRanges.push(
                            parseFloat(parseFloat(sufficientWeightGainRanges[1] - 0.01).toFixed(2)),
                            weight
                        )
                        insufficientWeightLossRanges.push(
                            parseFloat(parseFloat(weight - 0.01).toFixed(2)),
                            parseFloat(parseFloat(ranges[index - 1].insufficientWeightLossRanges[1] - (0.005 * ranges[index - 1].insufficientWeightLossRanges[1])).toFixed(2)),
                        )
                        sufficientWeightLossRanges.push(
                            parseFloat(parseFloat(insufficientWeightLossRanges[1] - 0.01).toFixed(2)),
                            parseFloat(parseFloat(ranges[index - 1].sufficientWeightLossRanges[1] - (0.01 * ranges[index - 1].sufficientWeightLossRanges[1])).toFixed(2)),
                        )
                    }
                    ranges[index] = {
                        sufficientWeightGainRanges,
                        insufficientWeightGainRanges,
                        insufficientWeightLossRanges,
                        sufficientWeightLossRanges
                    }
                }
                resolve(ranges);
            } catch (err) {
                reject(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
            }
        })
    },

    getProgressNotationNew: (date, month, year, userId, lng) => {
        if (!lng) lng = "en"
        return new Promise(async (resolve, reject) => {
            try {
                const currentDate = new Date(year, month - 1, date);
                let weights = await DbService.getManyWithSortAndLimit(COLLECTIONS.DAILY_WEIGHTS, {
                    userId: mongoose.Types.ObjectId(userId),
                    "$and": [
                        { "$or": [{ year: { "$lt": currentDate.getFullYear() } }, { year: { "$eq": currentDate.getFullYear() } }] },
                        { "$or": [{ month: { "$lt": currentDate.getMonth() + 1 } }, { month: { "$eq": currentDate.getMonth() + 1 } }] },
                        { "$or": [{ date: { "$lt": currentDate.getDate() } }, { date: { "$eq": currentDate.getDate() } }] }
                    ]
                }, { year: -1, month: -1, date: -1 }, 3);
                if (weights.length < 2) return resolve(null);

                const weight = weights[0].weight;
                const days =
                    (new Date(weights[0].year, weights[0].month - 1, weights[0].date)
                        - new Date(weights[1].year, weights[1].month - 1, weights[1].date)) / (1000 * 60 * 60 * 24);

                const weightProgressGraph = await WeightTrackerService.getProgressGraphRanges(weights[weights.length - 1].weight, Math.ceil(days / 7));
                const week = days != 0 ? parseInt((days - 1) / 7) : 0;
                const dayInWeek = (days % 7) == 0 ? 7 : (days % 7);
                const weightProgressGraphWeek = weightProgressGraph[week];
                let weightProgressDay = {
                    sufficientWeightGainRanges: [],
                    insufficientWeightGainRanges: [],
                    insufficientWeightLossRanges: [],
                    sufficientWeightLossRanges: []
                }
                for (let key in weightProgressGraphWeek) {
                    const topDifference = Math.abs(week != 0 ? weightProgressGraphWeek[key][0] - weightProgressGraph[week - 1][key][0] : weightProgressGraphWeek[key][0] - weight);
                    const bottomDifference = Math.abs(week != 0 ? weightProgressGraphWeek[key][1] - weightProgressGraph[week - 1][key][1] : weightProgressGraphWeek[key][1] - weight);
                    const topDifferencePerDay = topDifference / 7;
                    const bottomDifferencePerDay = bottomDifference / 7;
                    weightProgressDay[key].push(
                        parseFloat(parseFloat(
                            key == "sufficientWeightGainRanges" || key == "insufficientWeightGainRanges"
                                ? weightProgressGraphWeek[key][0] - topDifferencePerDay * (dayInWeek != 7 ? 7 - dayInWeek : 1)
                                : weightProgressGraphWeek[key][0] + topDifferencePerDay * (dayInWeek != 7 ? 7 - dayInWeek : 1)).toFixed(2)),
                        parseFloat(parseFloat(
                            key == "sufficientWeightGainRanges" || key == "insufficientWeightGainRanges"
                                ? weightProgressGraphWeek[key][1] - bottomDifferencePerDay * (dayInWeek != 7 ? 7 - dayInWeek : 1)
                                : weightProgressGraphWeek[key][1] + bottomDifferencePerDay * (dayInWeek != 7 ? 7 - dayInWeek : 1)).toFixed(2)),
                    )
                }
                let notation = null;
                if (weight > weightProgressDay.sufficientWeightGainRanges[0]) {
                    notation = PROGRESS_NOTATION.RAPID_WEIGHT_GAIN;
                } else if (weight < weightProgressDay.sufficientWeightLossRanges[1]) {
                    notation = PROGRESS_NOTATION.RAPID_WEIGHT_LOSS;
                } else {
                    for (let key in weightProgressDay) {
                        if (weightProgressDay[key][0] >= weight && weightProgressDay[key][1] <= weight) {
                            switch (key) {
                                case "sufficientWeightGainRanges":
                                    notation = PROGRESS_NOTATION.SUFFICIENT_WEIGHT_GAIN;
                                    break;
                                case "insufficientWeightGainRanges":
                                    notation = PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_GAIN;
                                    break;
                                case "insufficientWeightLossRanges":
                                    notation = PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_LOSS;
                                    break;
                                case "sufficientWeightLossRanges":
                                    notation = PROGRESS_NOTATION.SUFFICIENT_WEIGHT_LOSS;
                                    break;
                            }
                        }
                    }
                }

                let tips = [];
                switch (notation) {
                    case PROGRESS_NOTATION.RAPID_WEIGHT_GAIN:
                        tips = progressTips[lng].rapidWeightGain;
                        break;
                    case PROGRESS_NOTATION.SUFFICIENT_WEIGHT_GAIN:
                        tips = progressTips[lng].sufficientWeightGain;
                        break;
                    case PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_GAIN:
                        tips = progressTips[lng].insufficientWeightGain;
                        break;
                    case PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_LOSS:
                        tips = progressTips[lng].insufficientWeightLoss;
                        break;
                    case PROGRESS_NOTATION.SUFFICIENT_WEIGHT_LOSS:
                        tips = progressTips[lng].sufficientWeightLoss;
                        break;
                    case PROGRESS_NOTATION.RAPID_WEIGHT_LOSS:
                        tips = progressTips[lng].rapidWeightLoss;
                        break;
                }

                resolve({
                    notation,
                    tips
                })
            } catch (err) {
                reject(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
            }
        })
    }
}

module.exports = WeightTrackerService;