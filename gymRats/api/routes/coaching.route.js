const express = require('express');
const mongoose = require('mongoose');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, COLLECTIONS, REQUEST_STATUSES, PERSONAL_TRAINER_STATUSES, RELATION_STATUSES } = require('../global');
const DbService = require('../services/db.service');
const Request = require('../db/models/coaching/relation.model');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');
const { relationValidation, relationStatusUpdateValidation, coachingReviewPostValidation, coachApplicationPostValidation } = require('../validation/hapi');
const PersonalTrainer = require('../db/models/coaching/personalTrainer.model');
const Relation = require('../db/models/coaching/relation.model');

router.get('/', authenticate, async (req, res, next) => {
    try {
        let coaching = {
            myCoach: {
            },
            myClients: {
            }
        }

        const userAsTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        coaching.myClients.isPersonalTrainer = userAsTrainer ? true : false;
        coaching.myClients.trainerObject = coaching.myClients.isPersonalTrainer ? userAsTrainer : null;

        let relations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(userAsTrainer._id), status: RELATION_STATUSES.ACTIVE, to: null });
        for (let relation of relations) {
            const clientInstance = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
            relation.clientInstance = clientInstance;
        }
        coaching.myClients.clients = relations;

        let pendingClientsRelations = await DbService.getMany(COLLECTIONS.RELATIONS, {personalTrainerId: mongoose.Types.ObjectId(userAsTrainer._id), status: RELATION_STATUSES.PENDING_APPROVAL});
        for(let relation of pendingClientsRelations) {
            const clientInstance = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
            relation.clientInstance = clientInstance;
        }
        coaching.myClients.requests = pendingClientsRelations;

        const activeRelations = await DbService.getMany(COLLECTIONS.RELATIONS, { clientId: mongoose.Types.ObjectId(req.user._id), status: RELATION_STATUSES.ACTIVE, to: null });
        coaching.myCoach.hasCoaches = activeRelations.length > 0 ? true : false;
        for(let activeRelation of activeRelations) {
            const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, activeRelation.personalTrainerId);
            const coachUser = await DbService.getOne(COLLECTIONS.USERS, coach.userId);
            activeRelation.coach = coach;
            activeRelation.coachUser = coachUser;
        }
        coaching.myCoach.coaches = activeRelations;

        const pendingRelations = await DbService.getMany(COLLECTIONS.RELATIONS, { clientId: mongoose.Types.ObjectId(req.user._id), status: RELATION_STATUSES.PENDING_APPROVAL });
        for(let pendingRelation of pendingRelations) {
            const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, pendingRelation.personalTrainerId);
            const coachUser = await DbService.getOne(COLLECTIONS.USERS, {_id: coach.userId});
            pendingRelation.coach = coachUser;
        }
        coaching.myCoach.hasRelations = pendingRelations.length > 0;
        coaching.myCoach.relations = pendingRelations;

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

router.post('/relation', authenticate, async (req, res, next) => {
    const { error } = relationValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, req.body.coachId);
        if(!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND));
        if(coach.status != PERSONAL_TRAINER_STATUSES.ACTIVE) return next(new ResponseError("This coach is not accepting requests currently", HTTP_STATUS_CODES.CONFLICT));

        const existingRequests = await DbService.getMany(COLLECTIONS.RELATIONS, { clientId: mongoose.Types.ObjectId(req.user._id), personalTrainerId: mongoose.Types.ObjectId(req.body.coachId) });
        let hasConflict = false;
        for (let request of existingRequests) {
            if (request.status == RELATION_STATUSES.PENDING_APPROVAL || request.status == RELATION_STATUSES.ACTIVE) {
                hasConflict = true;
                break;
            }
        }

        if (hasConflict) return next(new ResponseError("You have already sent a request or have an active relation with this coach. Please wait for a response!", HTTP_STATUS_CODES.CONFLICT));

        const relation = new Relation({
            clientId: mongoose.Types.ObjectId(req.user._id),
            personalTrainerId: mongoose.Types.ObjectId(req.body.coachId),
        });

        await DbService.create(COLLECTIONS.RELATIONS, relation);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.delete("/relation/:id", authenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid request id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const request = await DbService.getById(COLLECTIONS.RELATIONS, req.params.id);
        if(!request) return next(new ResponseError("Request was not found", HTTP_STATUS_CODES.NOT_FOUND));
        if(request.status != RELATION_STATUSES.PENDING_APPROVAL) return next(new ResponseError("Request was already answered", HTTP_STATUS_CODES.CONFLICT));
        if(request.clientId.toString() != req.user._id.toString()) return next(new ResponseError("You are not allowed to delete this request", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.delete(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) });

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/relation/:id/status', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid relation id", HTTP_STATUS_CODES.BAD_REQUEST))
    const { error } = relationStatusUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const relation = await DbService.getById(COLLECTIONS.RELATIONS, req.params.id);
        if (!relation) return next(new ResponseError("Relation was not found", HTTP_STATUS_CODES.NOT_FOUND));

        const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { _id: mongoose.Types.ObjectId(relation.personalTrainerId) });
        if(!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND));

        console.log(!(relation.status == RELATION_STATUSES.PENDING_APPROVAL 
            && req.body.status == RELATION_STATUSES.ACTIVE
            && req.user._id.toString() == coach.userId.toString())
        );
        console.log(!(relation.status == RELATION_STATUSES.PENDING_APPROVAL 
            && req.body.status == RELATION_STATUSES.DECLINED
            && req.user._id.toString() == coach.userId.toString())
        );
        console.log(!(relation.status == RELATION_STATUSES.ACTIVE 
            && req.body.status == RELATION_STATUSES.CANCELED
            && (req.user._id.toString() == coach.userId.toString() || req.user._id.toString() == relation.clientId.toString()))
        );
            

        if(relation.status != RELATION_STATUSES.ACTIVE
            && relation.status != RELATION_STATUSES.PENDING_APPROVAL) return next(new ResponseError("Relation must be in statuses active or pending approval to update its status", HTTP_STATUS_CODES.CONFLICT));
        if(!(relation.status == RELATION_STATUSES.PENDING_APPROVAL 
            && req.body.status == RELATION_STATUSES.ACTIVE
            && req.user._id.toString() == coach.userId.toString())
        && !(relation.status == RELATION_STATUSES.PENDING_APPROVAL 
            && req.body.status == RELATION_STATUSES.DECLINED
            && req.user._id.toString() == coach.userId.toString())
        && !(relation.status == RELATION_STATUSES.ACTIVE 
            && req.body.status == RELATION_STATUSES.CANCELED
            && (req.user._id.toString() == coach.userId.toString() || req.user._id.toString() == relation.clientId.toString()))) 
            return next(new ResponseError("Cannot perform this status update", HTTP_STATUS_CODES.CONFLICT));

        await DbService.update(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) }, req.body);
        if(req.body.status == RELATION_STATUSES.ACTIVE){
            await DbService.update(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                from: new Date().getTime()
            });
        }
        if(req.body.status == RELATION_STATUSES.CANCELED) {
            await DbService.update(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                to: new Date().getTime()
            })
        }

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.get('/requests', authenticate, async (req, res, next) => {
    try {
        const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        console.log(coach)
        if(!coach) return res.status(HTTP_STATUS_CODES.OK).send({relations: []})
        const relations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(coach._id), status: RELATION_STATUSES.PENDING_APPROVAL });
        console.log(coach._id, RELATION_STATUSES.PENDING_APPROVAL, relations)
        for(let relation of relations) {
            const client = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
            relation.client = client;
        }
        res.status(HTTP_STATUS_CODES.OK).send({
            relations
        })
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post('/review/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid relation id", HTTP_STATUS_CODES.BAD_REQUEST))

    try {
        const relation = await DbService.getById(COLLECTIONS.RELATIONS, req.params.id);
        if (!relation) return next(new ResponseError("Relation not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (!relation.to) return next(new ResponseError("Relation has not been ended so you cannot leave a review", HTTP_STATUS_CODES.CONFLICT));

        const review = await DbService.getOne(COLLECTIONS.REVIEWS, { relationId: mongoose.Types.ObjectId(req.params.id) });
        if (review) return next(new ResponseError("Review already added", HTTP_STATUS_CODES.CONFLICT));
        if (relation.clientId.toString() != req.user._id.toString()) return next(new ResponseError("Only clients may post reviews", HTTP_STATUS_CODES.CONFLICT));

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