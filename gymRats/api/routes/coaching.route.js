const express = require('express');
const mongoose = require('mongoose');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, COLLECTIONS, REQUEST_STATUSES, PERSONAL_TRAINER_STATUSES, RELATION_STATUSES, CONTENT_VISIBILITY_SCOPES } = require('../global');
const DbService = require('../services/db.service');
const Request = require('../db/models/coaching/relation.model');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');
const { relationValidation, relationStatusUpdateValidation, coachingReviewPostValidation, coachApplicationPostValidation, contentPostValidation, contentUpdateValidation } = require('../validation/hapi');
const PersonalTrainer = require('../db/models/coaching/personalTrainer.model');
const Relation = require('../db/models/coaching/relation.model');
const Content = require('../db/models/coaching/content.model');
const MessagingService = require('../services/messaging.service');


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
        let relations, pendingClientsRelations = []
        if(userAsTrainer){
            relations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(userAsTrainer._id), status: RELATION_STATUSES.ACTIVE, to: null });
            for (let relation of relations) {
                const clientInstance = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
                relation.clientInstance = clientInstance;
            }

            pendingClientsRelations = await DbService.getMany(COLLECTIONS.RELATIONS, {personalTrainerId: mongoose.Types.ObjectId(userAsTrainer._id), status: RELATION_STATUSES.PENDING_APPROVAL});
            for(let relation of pendingClientsRelations) {
                const clientInstance = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
                relation.clientInstance = clientInstance;
            }
        }
        coaching.myClients.clients = relations;
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

router.get('/me-as-coach', authenticate, async (req, res, next) => {
    try {
        const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if(!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND));

        const relations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(coach._id), status: RELATION_STATUSES.ACTIVE, to: null });
        coach.relations = relations;
        let overallRating = 3;
        let overallRatingCounter = 1;
        for(let relation of relations) {
            const rating = await DbService.getOne(COLLECTIONS.REVIEWS, { relationId: mongoose.Types.ObjectId(relation._id) })
            relation.rating = rating;
            overallRatingCounter++;
            overallRating = (overallRating + rating.rating) / overallRatingCounter;
        }

        const clients = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(coach._id)});
        coach.clients = clients.length;
        coach.rating = parseFloat(overallRating).toFixed(1);
        coach.user = req.user;

        res.status(HTTP_STATUS_CODES.OK).send({
            coach
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
            await MessagingService.createChat(relation.personalTrainerId, relation.clientId)
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
        const minRating = 0;
        const distanceForCheck = 30;
        let allTrainers = [];
        const reviews = await DbService.getMany(COLLECTIONS.REVIEWS, {});

        if (req.query.maxDistance && req.query.maxDistance <= 120) {
            distanceForCheck = req.query.maxDistance / 4;
        }

        if (names) {
            names = names.split(" ");
            for (let name of names) {
                const users = await DbService.getMany(COLLECTIONS.USERS, { "$or": [{ firstName: { "$regex": name, "$options": "i"} }, { lastName: { "$regex": name, "$options": "i" } }] });
                for (let i = 0; i < users.length; i++) {
                    const trainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { "$or": [{userId: users[i]._id}, {userId: mongoose.Types.ObjectId(users[i]._id)}] });
                    if(trainer){
                        const clients = await DbService.getMany(COLLECTIONS.CLIENTS, { "$or": [{personalTrainerId: trainer._id}, {personalTrainerId: mongoose.Types.ObjectId(trainer._id)}] });
                        Object.assign(trainer, { criteriasMet: 0 }, {clients: clients.length});
                        if (trainer.status == PERSONAL_TRAINER_STATUSES.ACTIVE && trainer.userId.toString() != req.user._id.toString()) {
                            const relation = await DbService.getOne(COLLECTIONS.RELATIONS, {personalTrainerId: trainer._id, clientId: req.user._id})
                            if(relation && relation.status == RELATION_STATUSES.PENDING_APPROVAL) continue;
                            allTrainers.push(trainer);
                        }
                    }
                }
            }
        }else{
            const trainers = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, {})
            for (let trainer of trainers) {
                const clients = await DbService.getMany(COLLECTIONS.CLIENTS, { "$or": [{personalTrainerId: trainer._id}, {personalTrainerId: mongoose.Types.ObjectId(trainer._id)}] });
                Object.assign(trainer, { criteriasMet: 0 }, {clients: clients.length});
                if (trainer.status == PERSONAL_TRAINER_STATUSES.ACTIVE && trainer.userId.toString() != req.user._id.toString()) {
                    const relation = await DbService.getOne(COLLECTIONS.RELATIONS, {personalTrainerId: trainer._id, clientId: req.user._id})
                    if(relation && relation.status == RELATION_STATUSES.PENDING_APPROVAL) continue;
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

                if (req.query.maxDistance) {
                    if (distance > req.query.maxDistance) {
                        allTrainers.splice(i, 1);
                        i--;
                        continue;
                    }
                    allTrainers[i].criteriasMet++;
                }
                Object.assign(allTrainers[i], { distance: distance });


                let sumOfAllRatings = 0, counter = 0, overallRating = 0;
                for (let review of reviews) {
                    const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { "$or": [{_id: review.relationId}, {_id: mongoose.Types.ObjectId(review.relationId)}]});
                    if(relation.personalTrainerId.toString() == allTrainers[i].userId.toString()){
                        sumOfAllRatings += review.rating;
                        counter++;
                    }
                }
                if(counter != 0){ 
                    overallRating = Number.parseFloat(sumOfAllRatings / counter).toFixed(1);
                }
                if (req.query.minRating) {
                    minRating = req.query.minRating
                    if (overallRating < minRating) {
                        allTrainers.splice(i, 1);
                        i--;
                        continue;
                    }
                    allTrainers[i].criteriasMet++;
                }
                Object.assign(allTrainers[i], { rating: overallRating, reviews: counter });

                if (allTrainers[i].distance <= distanceForCheck
                    && allTrainers[i].rating >= (5 - minRating) / 2 + minRating) {
                    allTrainers[i].criteriasMet += 4
                    continue;
                }
                if (allTrainers[i].distance > distanceForCheck
                    && allTrainers[i].rating >= (5 - minRating) / 2 + minRating) {
                    allTrainers[i].criteriasMet += 3
                    continue;
                }
                if (allTrainers[i].distance <= distanceForCheck
                    && allTrainers[i].rating < (5 - minRating) / 2 + minRating) {
                    allTrainers[i].criteriasMet += 2;
                    continue;
                }
                if (allTrainers[i].distance > distanceForCheck
                    && allTrainers[i].rating < (5 - minRating) / 2 + minRating) {
                    allTrainers[i].criteriasMet += 1;
                    continue;
                }

            }
        } else if (req.query.maxDistance) {
            return next(new ResponseError("We cannot search for max distance when we don't know your location", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        for (let i = 0; i < allTrainers.length; i++) {
            for (let j = 0; j < (allTrainers.length - i - 1); j++) {
                var temp = allTrainers[j]
                if (allTrainers[j].criteriasMet < allTrainers[j + 1].criteriasMet) {
                    allTrainers[j] = allTrainers[j + 1]
                    allTrainers[j + 1] = temp
                }
                if(allTrainers[j].criteriasMet == allTrainers[j + 1].criteriasMet){
                    if (allTrainers[j].distance > allTrainers[j + 1].distance) {
                        allTrainers[j] = allTrainers[j + 1];
                        allTrainers[j + 1] = temp;
                    }
                }
            }
        }

        for (let index = 0; index < allTrainers.length; index++) {
            let user = await DbService.getById(COLLECTIONS.USERS, allTrainers[index].userId.toString());
            // remove below line when in production
            if (!user) user = await DbService.getOne(COLLECTIONS.USERS, { _id: allTrainers[index].userId.toString() });
            if (!user) {
                allTrainers.splice(index, 1);
                index--;
                continue;
            }
            allTrainers[index].user = user;
        }

        /*for(let i = 0; i < allTrainers.length; i++){
            console.log(allTrainers[i])
        }*/

        const dt2 = new Date().getTime();
        console.log(dt - dt2);
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: allTrainers
        })
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post('/content', authenticate, async (req, res, next) => {
    const { error } = contentPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if(!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND));

        const content = new Content(req.body);
        content.personalTrainerId = personalTrainer._id;

        await DbService.create(COLLECTIONS.CONTENTS, content);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/content/:id', authenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid content id", HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = contentUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const content = await DbService.getById(COLLECTIONS.CONTENTS, req.params.id);
        if(!content) return next(new ResponseError("Content not found", HTTP_STATUS_CODES.NOT_FOUND));
        
        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if(!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND));
        if(personalTrainer.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot update this content", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.update(COLLECTIONS.CONTENTS, { _id: mongoose.Types.ObjectId(req.params.id) }, req.body);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete('/:id', authenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid content id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const content = await DbService.getById(COLLECTIONS.CONTENTS, req.params.id);
        if(!content) return next(new ResponseError("Content not found", HTTP_STATUS_CODES.NOT_FOUND));

        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if(!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND));
        if(personalTrainer.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot update this content", HTTP_STATUS_CODES.FORBIDDEN));
        
        await DbService.delete(COLLECTIONS.CONTENTS, { _id: mongoose.Types.ObjectId(req.params.id) });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/content/:personalTrainerId', authenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.personalTrainerId)) return next(new ResponseError("Invalid personal trainer id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, req.params.personalTrainerId);
        if(!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND));
        
        const relations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(coach._id), status: RELATION_STATUSES.ACTIVE});
        let contents = [];
        for(let relation of relations) {
            if(relation.clientId.toString() == req.user._id.toString()) {
                const clientsContents = await DbService.getMany(COLLECTIONS.CONTENTS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id), isVisible: true, visibilityScope: CONTENT_VISIBILITY_SCOPES.CLIENTS })
                contents.push(...clientsContents);
                break;
            }
        }
        if(personalTrainer.userId.toString() == req.user._id.toString()) {
            const allContents = await DbService.getMany(COLLECTIONS.CONTENTS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id) });
            contents.push(...allContents);
        } else {
            const publicContents = await DbService.getMany(COLLECTIONS.CONTENTS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id), isVisible: true, visibilityScope: CONTENT_VISIBILITY_SCOPES.PUBLIC })
            contents.push(...publicContents);
        }


        let response = {}
        for(let content of contents) {
            if(!response[content.section]) {
                response[content.section] = [].push(content);
                continue;
            }
            response[content.section].push(content);
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            response
        })
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;