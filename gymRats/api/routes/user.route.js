const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { uuid } = require('uuidv4');

const DbService = require('../services/db.service');
const AuthenticationService = require('../services/authentication.service');
const WeightTrackerService = require('../services/cards/weightTracker.service');
const EmailService = require('../services/email.service');

const User = require('../db/models/generic/user.model');
const Suggestion = require('../db/models/generic/suggestion.model');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');
const { signupValidation, loginValidation, suggestionPostValidation, userUpdateValidation, forgottenPasswordPostValidation, passwordPutValidation, emailVerificationPostValidation } = require('../validation/hapi');
const PasswordRecoveryCode = require('../db/models/generic/passwordRecoveryCode.model');
const EmailVerificationCode = require('../db/models/generic/emailVerificationCode.model');
const UserService = require('../services/user.service');

router.post("/signup", async (req, res, next) => {
    const { error } = signupValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingUser = await DbService.getOne(COLLECTIONS.USERS, { email: req.body.email });
        if (existingUser) return next(new ResponseError("User with this email already exists", HTTP_STATUS_CODES.BAD_REQUEST, 46));

        const user = new User(req.body);
        user.password = AuthenticationService.hashPassword(req.body.password);
        await DbService.create(COLLECTIONS.USERS, user);

        UserService.addToUnverifiedEmailTimeouts(user._id);

        return res.sendStatus(HTTP_STATUS_CODES.OK);

    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/login", async (req, res, next) => {
    const { error } = loginValidation(req.body);
    if (error) return next(new ResponseError("Invalid credentials for login", HTTP_STATUS_CODES.BAD_REQUEST, 58));

    try {
        const user = await DbService.getOne(COLLECTIONS.USERS, { email: req.body.email });
        if (!user) return next(new ResponseError("Invalid credentials for login", HTTP_STATUS_CODES.NOT_FOUND, 58));

        const isPasswordValid = AuthenticationService.verifyPassword(req.body.password, user.password);
        if (!isPasswordValid) return next(new ResponseError("Invalid credentials for login", HTTP_STATUS_CODES.BAD_REQUEST, 58));

        setTimeout(() => {
            const token = AuthenticationService.generateToken({ _id: mongoose.Types.ObjectId(user._id) });
            return res.status(HTTP_STATUS_CODES.OK).send({
                token: token,
                verifiedEmail: user.verifiedEmail
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
                if (verified.iat <= new Date(user.lastPasswordReset).getTime() / 1000) valid = false;
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

        await EmailService.send("Suggestion posted", `${req.user.firstName} ${req.user.lastName} with an id ${req.user._id} wrote: ${req.body.suggestion}`);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/", authenticate, async (req, res, next) => {
    console.log(req.headers);
    return res.status(HTTP_STATUS_CODES.OK).send({
        user: req.user
    })
});

router.post("/suggestion", authenticate, async (req, res, next) => {
    const { error } = suggestionPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const suggestion = new Suggestion(req.body);
        suggestion.userId = mongoose.Types.ObjectId(req.user._id);

        await DbService.create(COLLECTIONS.SUGGESTIONS, suggestion);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/suggestion", authenticate, async (req, res, next) => {
    try {
        const suggestions = await DbService.getMany(COLLECTIONS.SUGGESTIONS, { userId: mongoose.Types.ObjectId(req.user._id) });
        return res.status(HTTP_STATUS_CODES.OK).send({
            suggestions
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/password-recovery-code", async (req, res, next) => {
    console.log("here");
    const { error } = forgottenPasswordPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const user = await DbService.getOne(COLLECTIONS.USERS, { email: req.body.email });
        if (!user) return next(new ResponseError("User with this email was not found", HTTP_STATUS_CODES.NOT_FOUND, 47));
        if (!user.verifiedEmail) return next(new ResponseError("We cannot issue password recovery for users with unverified emails", HTTP_STATUS_CODES.CONFLICT, 49));


        const passwordRecoveryCode = new PasswordRecoveryCode({
            userId: user._id,
            identifier: uuid(),
            code: Math.floor((Math.random() * 900000) + 100000).toString()
        });

        await DbService.create(COLLECTIONS.PASSWORD_RECOVERY_CODES, passwordRecoveryCode);

        await EmailService.send(user.email, "Password recovery code", "Enter this password recovery code in the app: " + passwordRecoveryCode.code);

        return res.status(HTTP_STATUS_CODES.OK).send({
            identifier: passwordRecoveryCode.identifier
        })
    } catch (err) {
        console.log(err)
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/check-password-recovery-code", async (req, res, next) => {
    if (!req.query.code || !req.query.identifier)
        return next(new ResponseError("Code and identifier must be provided", 50));

    try {
        const passwordRecoveryCode = await DbService.getOne(COLLECTIONS.PASSWORD_RECOVERY_CODES, { identifier: req.query.identifier, code: req.query.code });
        if (!passwordRecoveryCode) return next(new ResponseError("Invalid password recovery code", HTTP_STATUS_CODES.NOT_FOUND, 51));
        if (passwordRecoveryCode.hasBeenUsed) return next(new ResponseError("Password recovery code has already been used", HTTP_STATUS_CODES.CONFLICT, 52));
        if (new Date(passwordRecoveryCode.createdDt).getTime() + 120000 <= new Date().getTime()) return next(new ResponseError("Password recovery code has expired", HTTP_STATUS_CODES.CONFLICT, 53));

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.put("/password", async (req, res, next) => {
    const { error } = passwordPutValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const passwordRecoveryCode = await DbService.getOne(COLLECTIONS.PASSWORD_RECOVERY_CODES, { identifier: req.body.identifier });
        if (!passwordRecoveryCode) return next(new ResponseError("Password recovery code not found", HTTP_STATUS_CODES.NOT_FOUND, 54));
        if (passwordRecoveryCode.code != req.body.code) return next(new ResponseError("Password recovery code is invalid", HTTP_STATUS_CODES.CONFLICT, 51));
        if (passwordRecoveryCode.hasBeenUsed) return next(new ResponseError("Password recovery code has already been used", HTTP_STATUS_CODES.CONFLICT, 52));
        if (new Date(passwordRecoveryCode.createdDt).getTime() + 120000 <= new Date().getTime()) return next(new ResponseError("Password recovery code has expired", HTTP_STATUS_CODES.CONFLICT, 53));

        const user = await DbService.getById(COLLECTIONS.USERS, passwordRecoveryCode.userId);
        if (!user) return next(new ResponseError("User not found", HTTP_STATUS_CODES.NOT_FOUND, 39));

        const hashedPassword = AuthenticationService.hashPassword(req.body.password);

        await DbService.update(COLLECTIONS.USERS, { _id: user._id }, { password: hashedPassword });
        await DbService.update(COLLECTIONS.PASSWORD_RECOVERY_CODES, { identifier: req.body.identifier }, { hasBeenUsed: true });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post("/email-verification-code", async (req, res, next) => {
    const { error } = emailVerificationPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const user = await DbService.getOne(COLLECTIONS.USERS, { email: req.body.email });
        if (!user) return next(new ResponseError("User with this email was not found", HTTP_STATUS_CODES.NOT_FOUND, 47));
        if (user.verifiedEmail) return next(new ResponseError("You can't confirm your email because it already is!", HTTP_STATUS_CODES.BAD_REQUEST, 55));


        const emailVerificationCode = new EmailVerificationCode({
            userId: user._id,
            identifier: uuid(),
            code: Math.floor((Math.random() * 900000) + 100000).toString()
        });

        await DbService.create(COLLECTIONS.EMAIL_VERIFICATION_CODES, emailVerificationCode);

        await EmailService.send(user.email, "Email verification code", "Enter this email verification code in the app: " + emailVerificationCode.code);

        return res.status(HTTP_STATUS_CODES.OK).send({
            identifier: emailVerificationCode.identifier
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/check-email-verification-code", async (req, res, next) => {
    if (!req.query.code || !req.query.identifier)
        return next(new ResponseError("Code and identifier must be provided", HTTP_STATUS_CODES.BAD_REQUEST, 50));

    try {
        console.log(req.query)
        const emailVerificationCode = await DbService.getOne(COLLECTIONS.EMAIL_VERIFICATION_CODES, { identifier: req.query.identifier, code: req.query.code });
        if (!emailVerificationCode) return next(new ResponseError("Invalid email verification code", HTTP_STATUS_CODES.NOT_FOUND, 56));
        if (emailVerificationCode.hasBeenUsed) return next(new ResponseError("Email verification code has already been used", HTTP_STATUS_CODES.CONFLICT));
        if (new Date(emailVerificationCode.createdDt).getTime() + 600000 <= new Date().getTime()) return next(new ResponseError("Email verification code has expired", HTTP_STATUS_CODES.CONFLICT, 57));

        await DbService.update(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(emailVerificationCode.userId) }, { verifiedEmail: true });
        await DbService.update(COLLECTIONS.EMAIL_VERIFICATION_CODES, { identifier: req.query.identifier }, { hasBeenUsed: true });

        await UserService.removeItemFromUnverifiedEmailTimeouts(emailVerificationCode.userId);

        setTimeout(() => {
            const token = AuthenticationService.generateToken({ _id: mongoose.Types.ObjectId(emailVerificationCode.userId) });
            return res.status(HTTP_STATUS_CODES.OK).send({
                token: token,
            });
        }, 1000);

    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;
