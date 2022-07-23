const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { adminAuthenticate } = require('../middlewares/authenticate');
const DbService = require('../services/db.service');
const ResponseError = require('../errors/responseError');
const { COLLECTIONS, HTTP_STATUS_CODES } = require('../global');

const { Expo } = require('expo-server-sdk');
let expo = new Expo();

router.post("/retention-notifications", adminAuthenticate, async (req, res, next) => {
    try {
        let usersForNotification = [];
        const users = await DbService.getMany(COLLECTIONS.USERS, {});
        for(let user of users) {
            let hasAddedDailyWeightToday = false;
            let hasAddedCaloriesCounterDayToday = false;
            let hasAddedWorkoutSessionToday = false;

            const dailyWeights = (await DbService.getManyWithSort(COLLECTIONS.DAILY_WEIGHTS, {
                userId: mongoose.Types.ObjectId(user._id),
                "$and": [
                    {"$or": [{year: {"$lt": new Date().getFullYear()}}, {year: {"$eq": new Date().getFullYear()}}]},
                    {"$or": [{month: {"$lt": new Date().getMonth() + 1}}, {month: {"$eq": new Date().getMonth() + 1}}]},
                    {"$or": [{date: {"$lt": new Date().getDate()}}, {date: {"$eq": new Date().getDate()}}]},
                ]
            }, {
                year: -1, month: -1, date: -1  
            }))

            const lastDailyWeight = dailyWeights.length > 0 ? dailyWeights[0] : null;
            if(lastDailyWeight) {
                hasAddedDailyWeightToday = lastDailyWeight.year == new Date().getFullYear()
                && lastDailyWeight.month == new Date().getMonth() + 1
                && lastDailyWeight.date == new Date().getDate()
            }

            const caloriesCounterDays = (await DbService.getManyWithSort(COLLECTIONS.CALORIES_COUNTER_DAYS, {
                userId: mongoose.Types.ObjectId(user._id),
                "$and": [
                    {"$or": [{year: {"$lt": new Date().getFullYear()}}, {year: {"$eq": new Date().getFullYear()}}]},
                    {"$or": [{month: {"$lt": new Date().getMonth() + 1}}, {month: {"$eq": new Date().getMonth() + 1}}]},
                    {"$or": [{date: {"$lt": new Date().getDate()}}, {date: {"$eq": new Date().getDate()}}]},
                ]
            }, {
                year: -1, month: -1, date: -1  
            }))

            const lastCaloriesCounterDay = caloriesCounterDays.length > 0 ? caloriesCounterDays[0] : null;
            if(lastCaloriesCounterDay) {
                hasAddedCaloriesCounterDayToday = lastCaloriesCounterDay.year == new Date().getFullYear()
                && lastCaloriesCounterDay.month == new Date().getMonth() + 1
                && lastCaloriesCounterDay.date == new Date().getDate()
            }

            const workoutSessions = (await DbService.getManyWithSort(COLLECTIONS.WORKOUT_SESSIONS, {
                userId: mongoose.Types.ObjectId(user._id),
                "$and": [
                    {"$or": [{year: {"$lt": new Date().getFullYear()}}, {year: {"$eq": new Date().getFullYear()}}]},
                    {"$or": [{month: {"$lt": new Date().getMonth() + 1}}, {month: {"$eq": new Date().getMonth() + 1}}]},
                    {"$or": [{date: {"$lt": new Date().getDate()}}, {date: {"$eq": new Date().getDate()}}]},
                ]
            }, {
                year: -1, month: -1, date: -1  
            }))

            const lastWorkoutSession = workoutSessions.length > 0 ? workoutSessions[0] : null;
            if(lastWorkoutSession) {
                hasAddedWorkoutSessionToday = lastWorkoutSession.year == new Date().getFullYear()
                && lastWorkoutSession.month == new Date().getMonth() + 1
                && lastWorkoutSession.date == new Date().getDate()
            }

            const shouldSendNotification = !hasAddedDailyWeightToday && !hasAddedCaloriesCounterDayToday && !hasAddedWorkoutSessionToday;
            if(shouldSendNotification){
                usersForNotification.push({_id: user._id.toString(), firstName: user.firstName});
            }
        }
        for(let user of usersForNotification) {
            const devices = await DbService.getMany(COLLECTIONS.DEVICES, { userId: mongoose.Types.ObjectId(user._id)});
            let uniqueExpoPushTokens = [];
            for(let device of devices) {
                if(device.expoPushNotificationsToken && !uniqueExpoPushTokens.includes(device.expoPushNotificationsToken))
                    uniqueExpoPushTokens.push(device.expoPushNotificationsToken);
            }
            for(let expoPushToken of uniqueExpoPushTokens) {
                const notification = {
                    to: expoPushToken, 
                    data: {}, 
                    title: "Get back on track", 
                    body: "Daily tracking helps you progress quicker", 
                    ttl: 2419200, 
                    expiration: 7.2e+6, 
                    priority: 'high'
                };
                const ticket = await expo.sendPushNotificationsAsync([notification]);
                console.log(ticket, notification, user._id);
            }
        }
        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;