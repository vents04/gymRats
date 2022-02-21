const { HTTP_STATUS_CODES, COLLECTIONS, WEIGHT_UNITS } = require("../../global");
const DbService = require("../db.service");
const mongoose = require("mongoose");
const ResponseError = require("../../errors/responseError");

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
                                    previousDailyWeight.weight = previousDailyWeight.weight * 2.20462;
                                    previousDailyWeight.unit = WEIGHT_UNITS.POUNDS;
                                    break;
                                case WEIGHT_UNITS.POUNDS:
                                    previousDailyWeight.weight = previousDailyWeight.weight * 0.453592;
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
                for (let dailyWeight of dailyWeights) {
                    times.push({ _id: dailyWeight._id, time: new Date(dailyWeight.year, dailyWeight.month - 1, dailyWeight.date).getTime() });
                }

                let currentMin = {
                    _id: null,
                    time: null
                };

                for (let time of times) {
                    if (currentMin.time == null || (Math.abs(currentDailyWeightTime - time.time) < currentMin.time && time.time < currentDailyWeightTime)) {
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
                                dailyWeight.weight = dailyWeight.weight * 2.20462;
                                dailyWeight.unit = WEIGHT_UNITS.POUNDS;
                                break;
                            case WEIGHT_UNITS.POUNDS:
                                dailyWeight.weight = dailyWeight.weight * 0.453592;
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
    }
}

module.exports = WeightTrackerService;