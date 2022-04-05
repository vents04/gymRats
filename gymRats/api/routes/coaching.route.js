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

router.get("/coach/search",authenticate, async (req, res, next) => {
    const dt = new Date().getTime();
    let names = req.query.name;
    if (((req.query.lat && !req.query.lng) || (!req.query.lat && req.query.lng)) && !names) {
        const trainers = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, {});
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: trainers
        })
    }
    try {
        let minRating = 0;
        let distanceForCheck = 30;
        let allTrainers = [];
        let sorted = [];

        if (names) {
            names = names.split(" ");
            for (let name of names) {
                const users = await DbService.getMany(COLLECTIONS.USERS, { "$or": [{ firstName: { "$regex": name, "$options": "i"} }, { lastName: { "$regex": name, "$options": "i" } }] });
                for (let i = 0; i < users.length; i++) {
                    const trainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { "$or": [{userId: users[i]._id}, {userId: mongoose.Types.ObjectId(users[i]._id)}] });
                    if(trainer){
                        const clients = await DbService.getMany(COLLECTIONS.CLIENTS, { "$or": [{trainerId: trainer._id}, {trainerId: mongoose.Types.ObjectId(trainer._id)}] });
                        Object.assign(trainer, { criteriasMet: 0 }, {clients: clients.length});
                        if (trainer.status == PERSONAL_TRAINER_STATUSES.ACTIVE && trainer.userId.toString() != req.user._id.toString()) {
                            allTrainers.push(trainer);
                        }
                    }
                }
            }
        }else{
            const trainers = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, {})
            for (let trainer of trainers) {
                const clients = await DbService.getMany(COLLECTIONS.CLIENTS, { "$or": [{trainerId: trainer._id}, {trainerId: mongoose.Types.ObjectId(trainer._id)}] });
                Object.assign(trainer, { criteriasMet: 0 }, {clients: clients.length});
                if (trainer.status == PERSONAL_TRAINER_STATUSES.ACTIVE && trainer.userId.toString() != req.user._id.toString()) {
                    allTrainers.push(trainer);
                }
            }
        }


        if (req.query.lat && req.query.lng) {
            for (let i = 0; i < allTrainers.length; i++) {
                let lat1 = allTrainers[i].location.lat;
                let lat2 = req.query.lat;
                let lng1 = allTrainers[i].location.lng;
                let lng2 = req.query.lng;

                lng1 = lng1 * Math.PI / 180;
                lng2 = lng2 * Math.PI / 180;

                lat1 = lat1 * Math.PI / 180;
                lat2 = lat2 * Math.PI / 180;

                let dlon = lng2 - lng1;
                let dlat = lat2 - lat1;
                let a = Math.pow(Math.sin(dlat / 2), 2)
                    + Math.cos(lat1) * Math.cos(lat2)
                    * Math.pow(Math.sin(dlon / 2), 2);

                let c = 2 * Math.asin(Math.sqrt(a));

                let radius = 6371;

                let distance = c * radius;
                Object.assign(allTrainers[i], { distance: distance });
                if (req.query.maxDistance) {
                    if (distance > req.query.maxDistance) {
                        continue;
                    }
                    allTrainers[i].criteriasMet++;
                }
            }
        } else if (req.query.maxDistance) {
            return next(new ResponseError("We cannot search for max distance when we don't know your location", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const reviews = await DbService.getMany(COLLECTIONS.REVIEWS, {});
        for (let i = 0; i < allTrainers.length; i++) {
            let sumOfAllRatings = 0, counter = 1;
            for (let review of reviews) {
                const request = await DbService.getOne(COLLECTIONS.REQUESTS, { "$or": [{_id: review.requestId}, {_id: mongoose.Types.ObjectId(review.requestId)}] });
                if (request.recieverId.toString() == allTrainers[i].userId.toString()) {
                    sumOfAllRatings += review.rating;
                    counter++;
                }
            }
            let overallRating = Number.parseFloat(sumOfAllRatings / counter).toFixed(1);
            if (req.query.minRating) {
                minRating = req.query.minRating
                if (overallRating < minRating) {
                    continue;
                }
                allTrainers[i].criteriasMet++;
            }
            Object.assign(allTrainers[i], { rating: overallRating, reviews: reviews.length });
        }


        if (req.query.maxDistance && req.query.maxDistance <= 120) {
            distanceForCheck = req.query.maxDistance / 4;
        }

        for (let i = 0; i < allTrainers.length; i++) {
            if (allTrainers[i].distance <= distanceForCheck
                && allTrainers[i].rating >= (5 - minRating) / 2 + minRating) {
                allTrainers[i].criteriasMet += 4
                sorted.push(allTrainers[i]);
                continue;
            }
            if (allTrainers[i].distance > distanceForCheck
                && allTrainers[i].rating >= (5 - minRating) / 2 + minRating) {
                allTrainers[i].criteriasMet += 3
                sorted.push(allTrainers[i]);
                continue;
            }
            if (allTrainers[i].distance <= distanceForCheck
                && allTrainers[i].rating < (5 - minRating) / 2 + minRating) {
                allTrainers[i].criteriasMet += 2;
                sorted.push(allTrainers[i]);
                continue;
            }
            if (allTrainers[i].distance > distanceForCheck
                && allTrainers[i].rating < (5 - minRating) / 2 + minRating) {
                allTrainers[i].criteriasMet += 1;
                sorted.push(allTrainers[i]);
                continue;
            }
        }

        for (let i = 0; i < sorted.length; i++) {
            for (let j = 0; j < (sorted.length - i - 1); j++) {
                if (sorted[j].criteriasMet < sorted[j + 1].criteriasMet) {
                    var temp = sorted[j]
                    sorted[j] = sorted[j + 1]
                    sorted[j + 1] = temp
                }
            }
        }

        for (let index = 0; index < sorted.length; index++) {
            let user = await DbService.getById(COLLECTIONS.USERS, sorted[index].userId.toString());
            // remove below line when in production
            if (!user) user = await DbService.getOne(COLLECTIONS.USERS, { _id: sorted[index].userId.toString() });
            if (!user) {
                sorted.splice(index, 1);
                index--;
                continue;
            }
            sorted[index].user = user;
        }

        const dt2 = new Date().getTime();
        console.log(dt - dt2);
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: sorted
        })
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;