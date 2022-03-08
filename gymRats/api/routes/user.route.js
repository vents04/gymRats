const express = require('express');
const mongoose = require('mongoose');
const { HTTP_STATUS_CODES, COLLECTIONS, WATER_INTAKE_UNITS } = require('../global');
const { signupValidation, loginValidation, suggestionPostValidation, userUpdateValidation } = require('../validation/hapi');
const User = require('../db/models/generic/user.model');
const router = express.Router();

const { authenticate } = require('../middlewares/authenticate');

const ResponseError = require('../errors/responseError');
const DbService = require('../services/db.service');
const AuthenticationService = require('../services/authentication.service');
const Suggestion = require('../db/models/generic/suggestion.model');
const WeightTrackerService = require('../services/cards/weightTracker.service');

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
            res.status(HTTP_STATUS_CODES.OK).send({
                token: token,
            });
        }, 1000);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/login", async (req, res, next) => {
    const { error } = loginValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const user = await DbService.getOne(COLLECTIONS.USERS, { email: req.body.email });
        if (!user) return next(new ResponseError("User with this email has not been found", HTTP_STATUS_CODES.NOT_FOUND));

        const isPasswordValid = AuthenticationService.verifyPassword(req.body.password, user.password);
        if (!isPasswordValid) return next(new ResponseError("Invalid password", HTTP_STATUS_CODES.BAD_REQUEST));

        setTimeout(() => {
            const token = AuthenticationService.generateToken({ _id: mongoose.Types.ObjectId(user._id) });
            res.status(HTTP_STATUS_CODES.OK).send({
                token: token,
            });
        }, 1000);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/", authenticate, async (req, res, next) => {
    const { error } = userUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        await DbService.update(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(req.user._id) }, req.body);
        const user = await DbService.getById(COLLECTIONS.USERS, req.user._id);
        await WeightTrackerService.updateAllWeightUnits(req.user._id, user.weightUnit);
        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/validate-token", async (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return next(new ResponseError("Token not provided", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
    }

    try {
        let valid = true;

        const verified = AuthenticationService.verifyToken(token);
        let firstName = null;
        if (!verified) valid = false;
        else {
            const user = await DbService.getById(COLLECTIONS.USERS, verified._id);
            firstName = user.firstName;
            if (!user) valid = false;
            else {
                if (verified.iat <= user.lastPasswordReset.getTime() / 1000) valid = false;
            }
        }

        res.status(HTTP_STATUS_CODES.OK).send({
            valid: valid,
            verified: verified,
            firstName: firstName
        })
    }
    catch (error) {
        return next(new ResponseError(error.message, error.status || HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
    }
});

router.post("/suggestion", authenticate, async (req, res, next) => {
    const { error } = suggestionPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const suggestion = new Suggestion(req.body);
        suggestion.userId = mongoose.Types.ObjectId(req.user._id);
        await DbService.create(COLLECTIONS.SUGGESTIONS, suggestion);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/profile", authenticate, async (req, res, next) => {
    try {
        const user = await DbService.getById(COLLECTIONS.USERS, req.user._id);
        if (!user) return next(new ResponseError("User not found", HTTP_STATUS_CODES.NOT_FOUND))

        res.status(HTTP_STATUS_CODES.OK).send({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePicture: user.profilePicture,
            weightUnit: user.weightUnit,
            createdDt: user.createdDt
        })
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;
