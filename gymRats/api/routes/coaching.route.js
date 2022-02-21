const express = require('express');
const mongoose = require('mongoose');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, COLLECTIONS, REQUEST_STATUSES } = require('../global');
const DbService = require('../services/db.service');
const Request = require('../db/models/coaching/request.model');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');
const { requestValidation, requestsStatusUpdateValidation } = require('../validation/hapi');

router.get('/', authenticate, async (req, res, next) => {
    try {
        let coaching = {
            myCoach: {
                hasCoach: false
            },
            myClients: {
                isPersonalTrainer: false,
                hasClients: false
            }
        }

        const userAsTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        coaching.myClients.isPersonalTrainer = userAsTrainer ? true : false;
        coaching.myClients.trainerObject = coaching.myClients.isPersonalTrainer ? req.user : null;

        let clients = await DbService.getMany(COLLECTIONS.CLIENTS, { trainerId: mongoose.Types.ObjectId(req.user._id) });
        for (let client of clients) {
            const clientInstance = await DbService.getById(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(client.clientId) });
            client.clientInstance = clientInstance;
        }
        coaching.myClients.hasClients = clients.length > 0;
        coaching.myClients.clients = clients;

        let coach = null;
        const userAsClient = await DbService.getOne(COLLECTIONS.CLIENTS, { clientId: mongoose.Types.ObjectId(req.user._id) });
        if (userAsClient) coach = await DbService.getById(COLLECTIONS.USERS, userAsClient.trainerId);
        coaching.myCoach.hasCoach = userAsClient ? true : false;
        coaching.myCoach.coach = coach;
        coaching.myCoach.relationInstance = userAsClient;

        res.status(HTTP_STATUS_CODES.OK).send({
            coaching: coaching
        })
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.post('/request', authenticate, async (req, res, next) => {
    const { error } = requestValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingRequests = await DbService.getMany(COLLECTIONS.REQUESTS, {initiatorId: mongoose.Types.ObjectId(req.body.initiatorId), recieverId: mongoose.Types.ObjectId(req.body.recieverId)});
        let hasConflict = false;
        for(let request of existingRequests) {
            if(request.to){
                hasConflict = true;
                break;
            }
        }
        if(hasConflict) return next(new ResponseError("You have already sent a request. Please wait for a response!", HTTP_STATUS_CODES.CONFLICT));

        const request = new Request(req.body);
        await DbService.create(COLLECTIONS.REQUESTS, request);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    }catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.put('/request-status/:id', authenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid request id", HTTP_STATUS_CODES.BAD_REQUEST))
    const { error } = requestsStatusUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try{
        const request = await DbService.getById(COLLECTIONS.REQUESTS, req.params.id);
        if(!request) return next(new ResponseError("Request was not found", HTTP_STATUS_CODES.NOT_FOUND));

        if(req.user._id.toString() != req.body.recieverId.toString()) return next(new ResponseError("You cannot change the status of this request!", HTTP_STATUS_CODES.FORBIDDEN));

        if(request.status == req.body.status){
            if(request.status == REQUEST_STATUSES.ACCEPTED) return next(new ResponseError("The request is already accepted", HTTP_STATUS_CODES.CONFLICT));
            if(request.status == REQUEST_STATUSES.DECLINED) return next(new ResponseError("The request is already declined", HTTP_STATUS_CODES.CONFLICT));
            if(request.status == REQUEST_STATUSES.NOT_ANSWERED) return next(new ResponseError("The request is already not answered", HTTP_STATUS_CODES.CONFLICT));
        }

        await DbService.update(COLLECTIONS.REQUESTS, { _id: mongoose.Types.ObjectId(req.body.requestId)}, req.body);
    
        res.sendStatus(HTTP_STATUS_CODES.OK);
    }catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;