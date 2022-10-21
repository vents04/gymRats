const { COLLECTIONS, HTTP_STATUS_CODES, ADMIN_STATUSES, SUPPORTED_LANGUAGES, ADMIN_SECRET } = require('../global');
const mongoose = require('mongoose')

const DbService = require('../services/db.service');
const ResponseError = require('../errors/responseError');

const errorHandler = require('../errors/errorHandler');
const AuthenticationService = require('../services/authentication.service');

let authenticate = async (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        errorHandler(new ResponseError("Token not provided", HTTP_STATUS_CODES.UNAUTHORIZED, 0), req, res, next);
        return;
    }
    try {
        const verified = AuthenticationService.verifyToken(token);
        if (!verified) {
            errorHandler(new ResponseError("Token verification failed", HTTP_STATUS_CODES.UNAUTHORIZED, 1), req, res, next);
            return;
        }

        let user = await DbService.getById(COLLECTIONS.USERS, verified._id);
        if (!user) {
            errorHandler(new ResponseError("User not found", HTTP_STATUS_CODES.UNAUTHORIZED, 2), req, res, next);
            return;
        }
        if (verified.iat <= new Date(user.lastPasswordReset).getTime() / 1000) {
            errorHandler(new ResponseError("Token has expired", HTTP_STATUS_CODES.UNAUTHORIZED, 3), req, res, next);
            return;
        }

        (async function () {
            await DbService.update(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(user._id) }, { language: Object.values(SUPPORTED_LANGUAGES).includes(req.lng) ? req.lng : SUPPORTED_LANGUAGES.ENGLISH })
        })();

        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        errorHandler(new ResponseError(error.message, error.status || HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
    }
}

let adminAuthenticate = async (req, res, next) => {
    const token = req.header("x-admin-token");
    const secret = req.header("x-admin-secret");
    if (!token) {
        errorHandler(new ResponseError("Token not provided", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
        return;
    }
    if (!secret) {
        errorHandler(new ResponseError("Secret not provided", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
        return;
    }
    try {
        if (secret != ADMIN_SECRET) {
            errorHandler(new ResponseError("Secret verification failed", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        }

        const verified = AuthenticationService.verifyToken(token);
        if (!verified) {
            errorHandler(new ResponseError("Token verification failed", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        }

        let admin = await DbService.getById(COLLECTIONS.ADMINS, verified._id);
        if (!admin) {
            errorHandler(new ResponseError("Admin not found", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        }

        if (admin.status == ADMIN_STATUSES.BLOCKED) {
            errorHandler(new ResponseError("Admin is blocked", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        }

        req.admin = admin;
        req.token = token;
        next();
    }
    catch (error) {
        errorHandler(new ResponseError(error.message, error.status || HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
    }
}


module.exports = {
    authenticate: authenticate,
    adminAuthenticate: adminAuthenticate,
    newAuthentication: newAuthentication,
};
