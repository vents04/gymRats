const express = require('express');
const mongoose = require('mongoose');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, COLLECTIONS, REQUEST_STATUSES, PERSONAL_TRAINER_STATUSES } = require('../global');
const DbService = require('../services/db.service');
const Request = require('../db/models/coaching/request.model');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');
const { requestValidation, requestsStatusUpdateValidation, coachingReviewPostValidation, coachApplicationPostValidation } = require('../validation/hapi');
const PersonalTrainer = require('../db/models/coaching/personalTrainer.model');

router.get('/', authenticate, async (req, res, next) => {
    try {
        let coaching = {
            myCoach: {
                hasCoach: false
            },
            myClients: {
                isPersonalTrainer: false,
            }
        }

        const userAsTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        coaching.myClients.isPersonalTrainer = userAsTrainer ? true : false;
        coaching.myClients.trainerObject = coaching.myClients.isPersonalTrainer ? userAsTrainer : null;

        let clients = await DbService.getMany(COLLECTIONS.CLIENTS, { trainerId: mongoose.Types.ObjectId(req.user._id) });
        for (let client of clients) {
            const clientInstance = await DbService.getById(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(client.clientId) });
            client.clientInstance = clientInstance;
        }
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

router.post('/application', authenticate, async (req, res, next) => {
    const { error } = coachApplicationPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (personalTrainer) return next(new ResponseError("Request denied", HTTP_STATUS_CODES.CONFLICT));

        const newPersonalTrainer = new PersonalTrainer({
            userId: mongoose.Types.ObjectId(req.user._id),
            location: req.body.location
        })
        await DbService.create(COLLECTIONS.PERSONAL_TRAINERS, newPersonalTrainer);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post('/request', authenticate, async (req, res, next) => {
    const { error } = requestValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingRequests = await DbService.getMany(COLLECTIONS.REQUESTS, { initiatorId: mongoose.Types.ObjectId(req.body.initiatorId), recieverId: mongoose.Types.ObjectId(req.body.recieverId) });
        let hasConflict = false;
        for (let request of existingRequests) {
            if (request.to) {
                hasConflict = true;
                break;
            }
        }
        if (hasConflict) return next(new ResponseError("You have already sent a request. Please wait for a response!", HTTP_STATUS_CODES.CONFLICT));

        const request = new Request(req.body);
        await DbService.create(COLLECTIONS.REQUESTS, request);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.put('/request-status/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid request id", HTTP_STATUS_CODES.BAD_REQUEST))
    const { error } = requestsStatusUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const request = await DbService.getById(COLLECTIONS.REQUESTS, req.params.id);
        if (!request) return next(new ResponseError("Request was not found", HTTP_STATUS_CODES.NOT_FOUND));

        if (req.user._id.toString() != req.body.recieverId.toString()) return next(new ResponseError("You cannot change the status of this request!", HTTP_STATUS_CODES.FORBIDDEN));

        if (request.status == req.body.status) {
            if (request.status == REQUEST_STATUSES.ACCEPTED) return next(new ResponseError("The request is already accepted", HTTP_STATUS_CODES.CONFLICT));
            if (request.status == REQUEST_STATUSES.DECLINED) return next(new ResponseError("The request is already declined", HTTP_STATUS_CODES.CONFLICT));
            if (request.status == REQUEST_STATUSES.NOT_ANSWERED) return next(new ResponseError("The request is already not answered", HTTP_STATUS_CODES.CONFLICT));
        }

        await DbService.update(COLLECTIONS.REQUESTS, { _id: mongoose.Types.ObjectId(req.body.requestId) }, req.body);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.put('/end-relation/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid request id", HTTP_STATUS_CODES.BAD_REQUEST));
    const { error } = coachingReviewPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const request = await DbService.getById(COLLECTIONS.REQUESTS, req.params.id);
        if (!request) return next(new ResponseError("Request not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (request.clientId.toString() != req.user._id.toString()
            && request.trainerId.toString() != req.user._id.toString())
            return next(new ResponseError("Forbidden", HTTP_STATUS_CODES.FORBIDDEN));
        if (request.to) return next(new ResponseError("Relations for this object have already been ended", HTTP_STATUS_CODES.CONFLICT));

        await DbService.update(COLLECTIONS.REQUESTS, { _id: mongoose.Types.ObjectId(req.params.id) }, { to: new Date().getTime() });

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post('/review/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid request id", HTTP_STATUS_CODES.BAD_REQUEST))

    try {
        const request = await DbService.getById(COLLECTIONS.REQUESTS, req.params.id);
        if (!request) return next(new ResponseError("Request not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (request.clientId.toString() != req.user._id.toString()) return next(new ResponseError("Forbidden", HTTP_STATUS_CODES.FORBIDDEN));
        if (!request.to) return next(new ResponseError("Relations for this object have not been ended so you cannot leave a review", HTTP_STATUS_CODES.CONFLICT));

        const review = await DbService.getOne(COLLECTIONS.REVIEWS, { requestId: mongoose.Types.ObjectId(req.params.id) });
        if (review) return next(new ResponseError("Review already added", HTTP_STATUS_CODES.CONFLICT));

        await DbService.create()

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/coach/search", async (req, res, next) => {
    let valuesGiven = {
        names: false,
        minRating: false,
        maxDistance: false
    }
    let names = req.query.name;
    if ((req.query.lat && !req.query.lng) || (!req.query.lat && req.query.lng)) {
        const trainers = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, {});
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: trainers
        })
    }
    try {
        console.log(names);
        names = names.split(" ");
        let allTrainers = [];
        let sorted = [];
        let criteriaToBeMet = 2;
        if (names) {
            for (let name of names) {
                const users = await DbService.getMany(COLLECTIONS.USERS, { "$and": [{ firstName: { "$regex": name } }, { lastName: { "$regex": name } }] });
                for (let user in users) {
                    const trainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(user._id) });
                    Object.assign(trainer, { criteria: 1});
                    for(let i = 0; i < allTrainers.length; i++){
                        if(allTrainers[i] == trainer && trainer.status != PERSONAL_TRAINER_STATUSES.ACTIVE && trainer._id.toString() == req.user._id.toString()){
                            continue;
                        }
                    }
                    allTrainers.push(trainer); 
                }
            }
        }
        for (let i = 0; i < allTrainers.length; i++) {
            allTrainers[i].location.lng = allTrainers[i].location.lng * Math.PI / 180;
            req.query.lng = req.query.lng * Math.PI / 180;

            allTrainers[i].location.lat = allTrainers[i].location.lat * Math.PI / 180;
            req.query.lat = req.query.lat * Math.PI / 180;

            let dlon = req.query.lng - allTrainers[i].location.lng;
            let dlat = req.query.lat - allTrainers[i].location.lat;
            let a = Math.pow(Math.sin(dlat / 2), 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.pow(Math.sin(dlon / 2), 2);

            let c = 2 * Math.asin(Math.sqrt(a));

            let radius = 6371;

            let distance = c * radius;
            if(req.query.maxDistance){
                criteriaToBeMet = 3;
                if(distance > req.query.maxDistance){
                    continue;
                }
            }
            allTrainers[i].criteria++;
            

            let sumOfAllRatings, counter = 0;
            const reviews = await DbService.getMany(COLLECTIONS.REVIEWS, {});
            for(let review of reviews){
                const request = await DbService.getOne(COLLECTIONS.REQUESTS, {_id: mongoose.Types.ObjectId(review.requestId)});
                if(request.initiatorId.toString() == allTrainers[i].userId.toString()){
                    sumOfAllRatings += review.rating;
                    counter++;
                }
            }
            let overallRating = sumOfAllRatings / counter;
            if(overallRating < minRating){
                continue;
            }
            allTrainers[i].criteria++;
            
        }

        let distanceForCheck = 30; 
        if(req.query.maxDistance && req.query.maxDistance < 200){
            distanceForCheck = req.query.maxDistance/6;

        }

        for (let i = 0; i < allTrainers.length; i++) {
            if(allTrainers[i].distance <= distanceForCheck 
            && allTrainers[i].rating >= (5 - req.query.minRating)/2 + req.query.minRating 
            && allTrainers[i].criteria == criteriaToBeMet) {
                Object.assign(allTrainers[i], { category: 1});
                sorted.push(allTrainers[i]);
                continue;
            }
            if(allTrainers[i].distance > distanceForCheck 
            && allTrainers[i].rating >= (5 - req.query.minRating)/2 + req.query.minRating
            && allTrainers[i].criteria == criteriaToBeMet){
                Object.assign(allTrainers[i], { category: 2});
                sorted.push(allTrainers[i]);
                continue;
            }
            if(allTrainers[i].distance <= distanceForCheck 
            && allTrainers[i].rating < (5 - req.query.minRating)/2 + req.query.minRating
            && allTrainers[i].criteria == criteriaToBeMet){
                Object.assign(allTrainers[i], { category: 3});
                sorted.push(allTrainers[i]);
                continue;
            }
            if(allTrainers[i].distance > distanceForCheck 
            && allTrainers[i].rating < (5 - req.query.minRating)/2 + req.query.minRating
            && allTrainers[i].criteria == criteriaToBeMet){
                Object.assign(allTrainers[i], { category: 4});
                sorted.push(allTrainers[i]);
                continue;
            }
        }

        for(let i = 0; i < sorted.length - 1; i++){
            let temp = sorted[i];
            if (sorted[i].category > sorted[i + 1].category) {
                sorted[i] = sorted[i + 1];
                sorted[i + 1] = temp;
            }
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            results: sorted
        })
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;