const express = require('express');
const mongoose = require('mongoose');
const ResponseError = require('../errors/responseError');
const { COLLECTIONS, ADMIN_STATUSES, HTTP_STATUS_CODES, PERSONAL_TRAINER_STATUSES } = require('../global');
const { adminAuthenticate } = require('../middlewares/authenticate');
const AuthenticationService = require('../services/authentication.service');
const DbService = require('../services/db.service');
const { loginValidation } = require('../validation/hapi');
const router = express.Router();

router.post("/login", async (req, res, next) => {
    const { error } = loginValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    req.body.email = req.body.email.toLowerCase();
    if (req.body.email.split('@')[1] != "uploy.app")
        return next(new ResponseError("Email should end with uploy.app", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const admin = await DbService.getOne(COLLECTIONS.ADMINS, { email: req.body.email });
        if (!admin) return next(new ResponseError("Admin not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (admin.status != ADMIN_STATUSES.ACTIVE) return next(new ResponseError("Admin status must be active to login", HTTP_STATUS_CODES.CONFLICT))

        const isPasswordValid = AuthenticationService.verifyPassword(req.body.password, admin.password);
        if (!isPasswordValid) return next(new ResponseError("Invalid credentials for login", HTTP_STATUS_CODES.BAD_REQUEST));

        setTimeout(() => {
            const token = AuthenticationService.generateToken({ _id: mongoose.Types.ObjectId(admin._id) });
            return res.status(HTTP_STATUS_CODES.OK).send({
                token: token
            });
        }, 1000);
    } catch (error) {
        return next(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});


router.post('/validate-token', async (req, res, next) => {
    const token = req.header("x-admin-token");
    let admin = null;
    if (!token) return res.status(HTTP_STATUS_CODES.OK).send({
        valid: false,
        admin,
    })

    try {
        let valid = true;

        const verified = AuthenticationService.verifyToken(token);
        if (!verified) valid = false;
        else {
            admin = await DbService.getById(COLLECTIONS.ADMINS, verified._id);
            if (!admin) valid = false;
            else {
                if (admin.status != ADMIN_STATUSES.ACTIVE) valid = false;
            }
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            valid,
            admin
        })
    }
    catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
    }
});

router.get('/pending-trainers', adminAuthenticate, async (req, res, next) => {
    try {
        const pendingTrainers = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, {status: PERSONAL_TRAINER_STATUSES.PENDING})

        return res.status(HTTP_STATUS_CODES.OK).send({
            pendingTrainers
        })
        
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

/*router.put('/pending-trainers-update', adminAuthenticate, async (req, res, next) => {
    try {
        const pendingTrainers = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, {status: PERSONAL_TRAINER_STATUSES.PENDING})

        return res.status(HTTP_STATUS_CODES.OK).send({
            pendingTrainers
        })
        
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});*/


module.exports = router;