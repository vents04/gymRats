const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');
const AuthenticationService = require('../services/authentication.service');
const WeightTrackerService = require('../services/cards/weightTracker.service');

const User = require('../db/models/generic/user.model');
const Suggestion = require('../db/models/generic/suggestion.model');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');
const { signupValidation, loginValidation, suggestionPostValidation, userUpdateValidation } = require('../validation/hapi');

router.post("/signup", async (req, res, next) => {
    const { error } = signupValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingUser = await DbService.getOne(COLLECTIONS.USERS, { email: req.body.email });
        if (existingUser) return next(new ResponseError("User with this email already exists", HTTP_STATUS_CODES.BAD_REQUEST));

        const user = new User(req.body);
        user.password = AuthenticationService.hashPassword(req.body.password);
        await DbService.create(COLLECTIONS.USERS, user);

        setTimeout(() => {
            const token = AuthenticationService.generateToken({ _id: mongoose.Types.ObjectId(user._id) });
            return res.status(HTTP_STATUS_CODES.OK).send({
                token: token,
            });
        }, 1000);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/login", async (req, res, next) => {
    const { error } = loginValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const user = await DbService.getOne(COLLECTIONS.USERS, { email: req.body.email });
        if (!user) return next(new ResponseError("User with this email was not found", HTTP_STATUS_CODES.NOT_FOUND));

        const isPasswordValid = AuthenticationService.verifyPassword(req.body.password, user.password);
        if (!isPasswordValid) return next(new ResponseError("Invalid password", HTTP_STATUS_CODES.BAD_REQUEST));

        setTimeout(() => {
            const token = AuthenticationService.generateToken({ _id: mongoose.Types.ObjectId(user._id) });
            return res.status(HTTP_STATUS_CODES.OK).send({
                token: token,
            });
        }, 1000);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/", authenticate, async (req, res, next) => {
    const { error } = userUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        await DbService.update(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(req.user._id) }, req.body);
        if (req.user.weightUnit != req.body.weightUnit) await WeightTrackerService.updateAllWeightUnits(req.user._id, req.body.weightUnit);
        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/validate-token", async (req, res, next) => {
    const token = req.header("x-auth-token");
    let user = null;
    if (!token) return res.status(HTTP_STATUS_CODES.OK).send({
        valid: false,
        user,
    })

    try {
        let valid = true;

        const verified = AuthenticationService.verifyToken(token);
        if (!verified) valid = false;
        else {
            user = await DbService.getById(COLLECTIONS.USERS, verified._id);
            if (!user) valid = false;
            else {
                if (verified.iat <= user.lastPasswordReset.getTime() / 1000) valid = false;
            }
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            valid: valid,
            user
        })
    }
    catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
    }
});

router.post("/suggestion", authenticate, async (req, res, next) => {
    const { error } = suggestionPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const suggestion = new Suggestion(req.body);
        suggestion.userId = mongoose.Types.ObjectId(req.user._id);
        await DbService.create(COLLECTIONS.SUGGESTIONS, suggestion);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/", authenticate, async (req, res, next) => {
    return res.status(HTTP_STATUS_CODES.OK).send({
        user: req.user
    })
});

module.exports = router;
