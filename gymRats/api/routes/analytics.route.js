const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ResponseError = require('../errors/responseError');
const Navigation = require('../db/models/analytics/navigation.model');
const DbService = require('../services/db.service');

const { authenticate, adminAuthenticate } = require('../middlewares/authenticate');

const { navigationAnalyticsValidation, devicePostValidation } = require('../validation/hapi');

const { HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE, COLLECTIONS } = require('../global');
const Device = require('../db/models/analytics/device.model');
const AnalyticsService = require('../services/analytics.service');

router.post("/navigation", async (req, res, next) => {
    const { error } = navigationAnalyticsValidation(req.body, req.headers.lng);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        for (let navigation of req.body.navigationAnalytics) {
            const navigationInstance = new Navigation(navigation);
            await DbService.create(COLLECTIONS.NAVIGATIONS, navigationInstance);
        }
        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/device", authenticate, async (req, res, next) => {
    const { error } = devicePostValidation(req.body, req.headers.lng);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        if (req.body.deviceId) {
            const existingDevice = await DbService.getById(COLLECTIONS.DEVICES, req.body.deviceId);
            if (existingDevice && existingDevice.userId.toString() == req.user._id.toString()) {
                return res.status(HTTP_STATUS_CODES.OK).send({
                    deviceId: existingDevice._id
                })
            }
        }

        await DbService.updateMany(COLLECTIONS.DEVICES, { userId: mongoose.Types.ObjectId(req.user._id) }, { isActive: false });

        const device = new Device(req.body);
        device.userId = mongoose.Types.ObjectId(req.user._id);
        await DbService.create(COLLECTIONS.DEVICES, device);

        return res.status(HTTP_STATUS_CODES.OK).send({
            deviceId: device._id
        });
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/expo-push-token/:token", authenticate, async (req, res, next) => {
    try {
        const devices = await DbService.getMany(COLLECTIONS.DEVICES, { userId: mongoose.Types.ObjectId(req.user._id) });
        for (let device of devices) {
            await DbService.update(COLLECTIONS.DEVICES, { _id: mongoose.Types.ObjectId(device._id), isActive: true }, { expoPushNotificationsToken: req.params.token });
        }

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.get("/user-stats/:id", adminAuthenticate, async(req, res, next) => {
    if(!mongoose.Types.ObjectId(req.params.id)) return next(new ResponseError("Invalid id params", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const stats = await AnalyticsService.getUserStats(req.params.id);
        return res.status(HTTP_STATUS_CODES.OK).send({
            stats
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
    }
});

module.exports = router;