const { COLLECTIONS } = require('../global');
const DbService = require('./db.service');
const mongoose = require('mongoose');

let unverifiedEmailTimeouts = [];

const UserService = {
    addToUnverifiedEmailTimeouts: (userId) => {
        for (let item of unverifiedEmailTimeouts) {
            if (item.userId == userId) {
                clearTimeout(item.timeout);
                unverifiedEmailTimeouts.splice(unverifiedEmailTimeouts.indexOf(item), 1);
            }
        }
        unverifiedEmailTimeouts.push({
            userId,
            timeout: setTimeout(async () => {
                await DbService.delete(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(userId) });
                for (let item of unverifiedEmailTimeouts) {
                    if (item.userId == userId) unverifiedEmailTimeouts.splice(unverifiedEmailTimeouts.indexOf(item), 1);
                }
            }, 60000)
        });
    },

    removeItemFromUnverifiedEmailTimeouts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await DbService.getById(COLLECTIONS.USERS, userId);
                if (user && !user.verifiedEmail) {
                    for (let item of unverifiedEmailTimeouts) {
                        if (item.userId == userId) {
                            clearTimeout(item.timeout);
                            unverifiedEmailTimeouts.splice(unverifiedEmailTimeouts.indexOf(item), 1);
                            return;
                        }
                    }
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    },

    generateUnverifiedTimeouts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await DbService.getMany(COLLECTIONS.USERS, { verifiedEmail: false });
                for (let user of users) {
                    let item = {
                        userId: user._id,
                        timeout: setTimeout(() => {
                            DbService.delete(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(user._id) });
                            for (let item of unverifiedEmailTimeouts) {
                                if (item.userId == user._id) unverifiedEmailTimeouts.splice(unverifiedEmailTimeouts.indexOf(item), 1);
                            }
                        }, (new Date(user.createdDt).getTime() + 60000) - new Date().getTime())
                    }
                    unverifiedEmailTimeouts.push(item);
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = UserService;