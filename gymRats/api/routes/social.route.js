const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE, CONNECTION_STATUSES } = require('../global');

const Connection = require('../db/models/social/connection.model');

const { connectionPostValidation } = require('../validation/hapi');

router.post('/', authenticate, async (req, res, next) => {
    const { error } = connectionPostValidation(req.body);
    if (error) return next(new ResponseError(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST)));

    const connection = new Connection(req.body)
    
    try {
        const existingConnection = DbService.getOne(COLLECTIONS.CONNECTIONS, {"$or": [{initiatorId: mongoose.Types.ObjectId(req.body.initiatorId), recieverId: mongoose.Types.ObjectId(req.body.recieverId)},
        {initiatorId: mongoose.Types.ObjectId(req.body.recieverId), recieverId: mongoose.Types.ObjectId(req.body.initiatorId)}]});

        if(existingConnection) return next(new ResponseError("You already have a connection", HTTP_STATUS_CODES.CONFLICT, 26));

        await DbService.create(COLLECTIONS.CONNECTIONS, connection);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
        
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/', authenticate, async (req, res, next) => {
    try {
        const connections = await DbService.getMany(COLLECTIONS.CONNECTIONS, {initiatorId: mongoose.Types.ObjectId(req.user._id), "$or": [{CONNECTION_STATUSES: CONNECTION_STATUSES.ACCEPTED}, {CONNECTION_STATUSES: CONNECTION_STATUSES.REQUESTED}]})
        return res.status(HTTP_STATUS_CODES.OK).send({
            connections
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});




module.exports = router;