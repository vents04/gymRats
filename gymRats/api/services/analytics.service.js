const ResponseError = require("../errors/responseError");
const { COLLECTIONS, HTTP_STATUS_CODES } = require("../global");
const AuthenticationService = require("./authentication.service");
const DbService = require("./db.service");
const mongoose = require("mongoose");

const AnalyticsService = {
    getUserStats: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await DbService.getById(COLLECTIONS.USERS, userId);
                if(!user) reject(new ResponseError("User not found", HTTP_STATUS_CODES.NOT_FOUND));
                
                let userNavigations = [];
                const navigations = await DbService.getManyWithSort(COLLECTIONS.NAVIGATIONS, {}, {toDt: 1});
                for(let navigation of navigations) {
                    if(navigation.token) {
                        const tokenPayload = (await AuthenticationService.verifyToken(navigation.token));
                        const userId = tokenPayload._id;
                        if(userId && userId.toString() == userId.toString()) {
                            userNavigations.push(navigation);
                        }
                    }
                }

                let sessions = [];
                let lastSessionStartIndex = 0;
                for(let index = 0; index < userNavigations.length; index++) {
                    if(index > 0) {
                        if(userNavigations[index].toDt - userNavigations[index-1] > 900000) {
                            let currentSession = {
                                navigations: []
                            };
                            for(let innerIndex = lastSessionStartIndex; innerIndex < userNavigations.length; innerIndex++) {
                                currentSession.navigations.push(userNavigations[innerIndex]);
                            }
                            sessions.push(currentSession);
                            lastSessionStartIndex = index;
                        }
                    }
                }

                const dailyWeights = await DbService.getMany(COLLECTIONS.DAILY_WEIGHTS, { userId: mongoose.Types.ObjectId(userId) });
                const workoutSessions = await DbService.getMany(COLLECTIONS.WORKOUT_SESSIONS, {userId: mongoose.Types.ObjectId(userId)});
                const caloriesCounterDays = await DbService.getMany(COLLECTIONS.CALORIES_COUNTER_DAYS, { userId: mongoose.Types.ObjectId(userId) });
                const devices = await DbService.getMany(COLLECTIONS.DEVICES, { userId: mongoose.Types.ObjectId(userId) });

                resolve({
                    sessions,
                    dailyWeights,
                    workoutSessions,
                    caloriesCounterDays,
                    devices
                })
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = AnalyticsService;