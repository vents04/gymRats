const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { adminAuthenticate } = require('../middlewares/authenticate');
const DbService = require('../services/db.service');
const ResponseError = require('../errors/responseError');
const { COLLECTIONS, HTTP_STATUS_CODES } = require('../global');

router.post("/retention-notifications", adminAuthenticate, async (req, res, next) => {
    try {
        const users = await DbService.getMany(COLLECTIONS.USERS, {});
        for(let user of users) {
            let hasAddedDailyWeightToday = false;

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
        }
        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;