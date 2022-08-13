const { COLLECTIONS } = require("../global");
const AuthenticationService = require("./authentication.service");
const DbService = require("./db.service");

const StatsService = {
    getTotalUsersCount: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await DbService.getMany(COLLECTIONS.USERS, {});
                resolve(users.length);
            } catch (err) {
                reject(err);
            }
        })
    },

    getAveragePeriodBetweenLogins: () => {
        // Calculates only for user ids who are in users collections
        return new Promise(async (resolve, reject) => {
            try {
                const navigationsPerUser = await StatsService.getNavigationsPerUser();
                let finalNavigationsPerUser = {};
                for (let userId in navigationsPerUser) {
                    const user = await DbService.getById(COLLECTIONS.USERS, userId);
                    if (user) {
                        if (!finalNavigationsPerUser[userId]) finalNavigationsPerUser[userId] = [];
                        finalNavigationsPerUser[userId].push(...navigationsPerUser[userId])
                    }
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    },

    getScreensRankedByVisits: () => {
        return new Promise(async (resolve, reject) => {
            try {

            } catch (err) {
                reject(err);
            }
        })
    },

    getScreensRankedByWatchTime: () => {
        return new Promise(async (resolve, reject) => {
            try {

            } catch (err) {
                reject(err);
            }
        })
    },

    getNavigationsPerUser: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const navigations = await DbService.getManyWithSort(COLLECTIONS.NAVIGATIONS, {}, { toDt: -1 });
                const navigationsPerUser = {};
                const tokensMap = {};
                for (let navigation of navigations) {
                    let userId = null;
                    if (navigation.token) {
                        if (!tokensMap[navigation.token]) {
                            const verifiedToken = AuthenticationService.verifyToken(navigation.token);
                            if (verifiedToken && verifiedToken._id) tokensMap[navigation.token] = verifiedToken._id;
                        }
                        userId = tokensMap[navigation.token];
                        if (userId) {
                            if (!navigationsPerUser[userId]) navigationsPerUser[userId] = [];
                            navigationsPerUser[userId].push(navigation);
                        }
                    }
                }
                resolve(navigationsPerUser);
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = StatsService;