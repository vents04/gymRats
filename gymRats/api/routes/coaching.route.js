const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');
const MessagingService = require('../services/messaging.service');

const PersonalTrainer = require('../db/models/coaching/personalTrainer.model');
const Relation = require('../db/models/coaching/relation.model');
const Review = require('../db/models/coaching/review.model');

const ResponseError = require('../errors/responseError');

const { authenticate, adminAuthenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, PERSONAL_TRAINER_STATUSES, RELATION_STATUSES, DEFAULT_ERROR_MESSAGE, CARD_COLLECTIONS } = require('../global');
const { relationValidation, relationStatusUpdateValidation, coachApplicationPostValidation, coachingReviewPostValidation, adminCoachStatusUpdateValidation } = require('../validation/hapi');
const WeightTrackerService = require('../services/cards/weightTracker.service');
const { func } = require('@hapi/joi');
const { quicksort } = require('../helperFunctions/quickSortForCoaches')
const { checkForDistanceAndReviews } = require('../helperFunctions/checkDistanceAndReviews');
const EmailService = require('../services/email.service');

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
        if (userAsTrainer) {
            relations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(userAsTrainer._id), status: RELATION_STATUSES.ACTIVE, to: null });
            for (let relation of relations) {
                const clientInstance = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
                relation.clientInstance = clientInstance;
            }

            pendingClientsRelations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(userAsTrainer._id), status: RELATION_STATUSES.PENDING_APPROVAL });
            for (let relation of pendingClientsRelations) {
                const clientInstance = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
                relation.clientInstance = clientInstance;
            }
        }
        coaching.myClients.clients = relations;
        coaching.myClients.requests = pendingClientsRelations;

        const activeRelations = await DbService.getMany(COLLECTIONS.RELATIONS, { clientId: mongoose.Types.ObjectId(req.user._id), status: RELATION_STATUSES.ACTIVE, to: null });
        coaching.myCoach.hasCoaches = activeRelations.length > 0 ? true : false;
        for (let activeRelation of activeRelations) {
            const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, activeRelation.personalTrainerId);
            const coachUser = await DbService.getOne(COLLECTIONS.USERS, coach.userId);
            activeRelation.coach = coach;
            activeRelation.coachUser = coachUser;
        }
        coaching.myCoach.coaches = activeRelations;

        const pendingRelations = await DbService.getMany(COLLECTIONS.RELATIONS, { clientId: mongoose.Types.ObjectId(req.user._id), status: RELATION_STATUSES.PENDING_APPROVAL });
        for (let pendingRelation of pendingRelations) {
            const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, pendingRelation.personalTrainerId);
            const coachUser = await DbService.getOne(COLLECTIONS.USERS, { _id: coach.userId });
            pendingRelation.coach = coachUser;
        }
        coaching.myCoach.hasRelations = pendingRelations.length > 0;
        coaching.myCoach.relations = pendingRelations;

        let finalCanceledRelations = [];
        const canceledRelations = await DbService.getMany(COLLECTIONS.RELATIONS, { clientId: mongoose.Types.ObjectId(req.user._id), status: RELATION_STATUSES.CANCELED });
        for (let canceledRelation of canceledRelations) {
            const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, canceledRelation.personalTrainerId);
            const coachUser = await DbService.getOne(COLLECTIONS.USERS, { _id: coach.userId });
            canceledRelation.coach = coachUser;
            const review = await DbService.getOne(COLLECTIONS.REVIEWS, { relationId: mongoose.Types.ObjectId(canceledRelation._id) });
            canceledRelation.hasReview = false;
            if (!review) finalCanceledRelations.push(canceledRelation);
        }
        coaching.myCoach.canceledRelations = finalCanceledRelations;

        return res.status(HTTP_STATUS_CODES.OK).send({
            coaching
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/me-as-coach', authenticate, async (req, res, next) => {
    try {
        const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND, 17));

        const activeRelations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(coach._id), status: RELATION_STATUSES.ACTIVE });
        coach.relations = activeRelations;

        let overallRating = 3;
        let overallRatingCounter = 1;
        const finishedRelations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(coach._id), status: RELATION_STATUSES.CANCELED })
        for (let finishedRelation of finishedRelations) {
            const rating = await DbService.getOne(COLLECTIONS.REVIEWS, { relationId: mongoose.Types.ObjectId(finishedRelation._id) })
            if (rating) {
                overallRatingCounter++;
                overallRating = (overallRating + rating.rating) / overallRatingCounter;
            }
        }

        const clients = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(coach._id) });
        coach.clients = clients.length;
        coach.rating = parseFloat(overallRating).toFixed(1);
        coach.user = req.user;

        return res.status(HTTP_STATUS_CODES.OK).send({
            coach
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.post('/application', authenticate, async (req, res, next) => {
    const { error } = coachApplicationPostValidation(req.body, req.headers.lng);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    const personalTrainer = new PersonalTrainer(req.body);

    try {
        const existingPersonalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (existingPersonalTrainer) return next(new ResponseError("You are already a personal trainer", HTTP_STATUS_CODES.CONFLICT, 26));

        personalTrainer.userId = req.user._id;
        personalTrainer.firstName = req.user.firstName;
        personalTrainer.lastName = req.user.lastName;
        await DbService.create(COLLECTIONS.PERSONAL_TRAINERS, personalTrainer);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        console.log(error.response.body.errors)
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    } finally {
        EmailService.send("office@uploy.app", "Coach request", `${req.user.firstName} ${req.user.lastName} with a personal trainer id ${personalTrainer._id} and user id ${req.user._id} requested to be a coach`);
    }
});

router.post('/relation', authenticate, async (req, res, next) => {
    const { error } = relationValidation(req.body, req.headers.lng);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, req.body.coachId);
        if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND, 17));
        if (coach.status != PERSONAL_TRAINER_STATUSES.ACTIVE) return next(new ResponseError("This coach is not accepting requests currently", HTTP_STATUS_CODES.CONFLICT, 27));
        if (coach.userId.toString() == req.user._id.toString()) return next(new ResponseError("You cannot be your own client", HTTP_STATUS_CODES.CONFLICT, 28));

        const existingRequests = await DbService.getMany(COLLECTIONS.RELATIONS, { clientId: mongoose.Types.ObjectId(req.user._id), personalTrainerId: mongoose.Types.ObjectId(req.body.coachId) });
        let hasConflict = false;
        for (let request of existingRequests) {
            if (request.status == RELATION_STATUSES.PENDING_APPROVAL || request.status == RELATION_STATUSES.ACTIVE) {
                hasConflict = true;
                break;
            }
        }

        if (hasConflict) return next(new ResponseError("You have already sent a request for coaching or have an active relation with this coach.", HTTP_STATUS_CODES.CONFLICT, 29));

        const relation = new Relation({
            clientId: mongoose.Types.ObjectId(req.user._id),
            personalTrainerId: mongoose.Types.ObjectId(req.body.coachId),
        });

        await DbService.create(COLLECTIONS.RELATIONS, relation);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.delete("/relation/:id", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid request id", HTTP_STATUS_CODES.BAD_REQUEST, 5));

    try {
        const request = await DbService.getById(COLLECTIONS.RELATIONS, req.params.id);
        if (!request) return next(new ResponseError("Request was not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (request.status != RELATION_STATUSES.PENDING_APPROVAL) return next(new ResponseError("Request was already answered", HTTP_STATUS_CODES.CONFLICT, 31));
        if (request.clientId.toString() != req.user._id.toString()) return next(new ResponseError("You are not allowed to delete this request", HTTP_STATUS_CODES.FORBIDDEN, 32));

        await DbService.delete(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.put('/relation/:id/status', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid relation id", HTTP_STATUS_CODES.BAD_REQUEST, 5))

    const { error } = relationStatusUpdateValidation(req.body, req.headers.lng);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const relation = await DbService.getById(COLLECTIONS.RELATIONS, req.params.id);
        if (!relation) return next(new ResponseError("Relation was not found", HTTP_STATUS_CODES.NOT_FOUND, 33));

        const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { _id: mongoose.Types.ObjectId(relation.personalTrainerId) });
        if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND, 17));

        if (relation.status != RELATION_STATUSES.ACTIVE && relation.status != RELATION_STATUSES.PENDING_APPROVAL)
            return next(new ResponseError("Relation status should be active or pending approval to update", HTTP_STATUS_CODES.CONFLICT, 34));

        if (!(relation.status == RELATION_STATUSES.PENDING_APPROVAL
            && req.body.status == RELATION_STATUSES.ACTIVE
            && req.user._id.toString() == coach.userId.toString())
            && !(relation.status == RELATION_STATUSES.PENDING_APPROVAL
                && req.body.status == RELATION_STATUSES.DECLINED
                && req.user._id.toString() == coach.userId.toString())
            && !(relation.status == RELATION_STATUSES.ACTIVE
                && req.body.status == RELATION_STATUSES.CANCELED
                && (req.user._id.toString() == coach.userId.toString() || req.user._id.toString() == relation.clientId.toString())))
            return next(new ResponseError("Cannot perform this status update", HTTP_STATUS_CODES.CONFLICT, 34));

        await DbService.update(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) }, req.body);

        if (req.body.status == RELATION_STATUSES.ACTIVE) {
            await DbService.update(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                from: new Date().getTime()
            });
            await MessagingService.createChat(relation.personalTrainerId, relation.clientId)
        } else if (req.body.status == RELATION_STATUSES.CANCELED) {
            await DbService.update(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                to: new Date().getTime()
            })
        } else if (req.body.status == RELATION_STATUSES.DECLINED) {
            await DbService.update(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                from: new Date().getTime(),
                to: new Date().getTime()
            })
        }

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/requests', authenticate, async (req, res, next) => {
    try {
        const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!coach) return res.status(HTTP_STATUS_CODES.OK).send({ relations: [] })

        const relations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(coach._id), status: RELATION_STATUSES.PENDING_APPROVAL });
        for (let relation of relations) {
            const client = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
            relation.client = client;
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            relations
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.post('/relation/:id/review', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid relation id", HTTP_STATUS_CODES.BAD_REQUEST, 30))

    const { error } = coachingReviewPostValidation(req.body, req.headers.lng);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const relation = await DbService.getById(COLLECTIONS.RELATIONS, req.params.id);
        if (!relation) return next(new ResponseError("Relation not found", HTTP_STATUS_CODES.NOT_FOUND, 33));
        if (relation.status != RELATION_STATUSES.CANCELED) return next(new ResponseError("Relation has not been ended or has been declined. You cannot leave a review", HTTP_STATUS_CODES.CONFLICT, 35));
        if (relation.clientId.toString() != req.user._id.toString()) return next(new ResponseError("Only clients may post reviews", HTTP_STATUS_CODES.CONFLICT, 36));

        const existingReview = await DbService.getOne(COLLECTIONS.REVIEWS, { relationId: mongoose.Types.ObjectId(req.params.id) });
        if (existingReview) return next(new ResponseError("Review already added", HTTP_STATUS_CODES.CONFLICT, 37));

        const review = new Review(req.body);
        review.relationId = req.params.id;
        await DbService.create(COLLECTIONS.REVIEWS, review);

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.get("/coach/search", authenticate, async (req, res, next) => {
    let names = req.query.name;
    let reviewsForPush = [];
    const reviews = await DbService.getMany(COLLECTIONS.REVIEWS, {});

    if (((req.query.lat == "null" || !req.query.lat) || (req.query.lng == "null" || !req.query.lng)) && !names) {
        const trainers = await DbService.getManyWithLimit(COLLECTIONS.PERSONAL_TRAINERS, {}, 50);
        for (let i = 0; i < trainers.length; i++) {
            const user = await DbService.getOne(COLLECTIONS.USERS, { "$or": [{ _id: trainers[i].userId }, { _id: mongoose.Types.ObjectId(trainers[i].userId) }] });
            trainers[i].user = user;

            let sumOfAllRatings = 0, counter = 0, overallRating = 0;
            for (let review of reviews) {
                const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { "$or": [{ _id: review.relationId }, { _id: mongoose.Types.ObjectId(review.relationId) }] });
                if (relation && relation.personalTrainerId.toString() == trainers[i]._id.toString()) {
                    sumOfAllRatings += review.rating;
                    counter++;
                    const clientInstance = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
                    review.clientInstance = clientInstance;
                    reviewsForPush.push(review);
                }
            }
            if (counter != 0) {
                overallRating = Number.parseFloat(sumOfAllRatings / counter).toFixed(1);
            } else {
                overallRating = 3.0;
            }

            const activeRelations = await DbService.getMany(COLLECTIONS.RELATIONS, { "$and": [{ personalTrainerId: mongoose.Types.ObjectId(trainers[i]._id.toString()) }, { clientId: mongoose.Types.ObjectId(req.user._id) }] })
            for (let relation of activeRelations) {
                if (relation && (relation.status == RELATION_STATUSES.ACTIVE || relation.status == RELATION_STATUSES.PENDING_APPROVAL)) {

                    if (trainers.length == 1) {
                        return res.status(HTTP_STATUS_CODES.OK).send({
                            results: []
                        })
                    }

                    trainers.splice(i, 1);
                    i--;
                    continue;
                }
            }
            if (trainers[i].userId.toString() == req.user._id.toString()) {

                if (trainers.length == 1) {
                    return res.status(HTTP_STATUS_CODES.OK).send({
                        results: []
                    })
                }

                trainers.splice(i, 1);
                i--;
                continue;
            }

            const clients = await DbService.getMany(COLLECTIONS.RELATIONS, { "$or": [{ personalTrainerId: trainers[i]._id }, { personalTrainerId: mongoose.Types.ObjectId(trainers[i]._id) }] });

            Object.assign(trainers[i], { rating: overallRating }, { reviews: reviewsForPush }, { clients: clients.length });
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            results: trainers
        })
    }

    if (req.query.maxDistance && (req.query.lat == "null" || req.query.lng == "null")) {
        return next(new ResponseError("We cannot search for max distance when we don't know your location", HTTP_STATUS_CODES.BAD_REQUEST, 38));
    }

    try {
        let distanceForCheck = 30;
        let trainers = [];

        if (req.query.maxDistance && req.query.maxDistance <= 120) {
            distanceForCheck = req.query.maxDistance / 4;
        }

        if (names && names != "") {
            names = names.split(" ");
            for (let name of names) {
                trainers = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, { "$and": [{ "$or": [{ firstName: { "$regex": name, "$options": "i" } }, { lastName: { "$regex": name, "$options": "i" } }] }, { status: PERSONAL_TRAINER_STATUSES.ACTIVE }] })

                for (let i = 0; i < trainers.length; i++) {
                    const clients = await DbService.getMany(COLLECTIONS.RELATIONS, { "$or": [{ personalTrainerId: trainers[i]._id }, { personalTrainerId: mongoose.Types.ObjectId(trainers[i]._id) }] });

                    const relations = await DbService.getMany(COLLECTIONS.RELATIONS, { "$and": [{ personalTrainerId: mongoose.Types.ObjectId(trainers[i]._id) }, { clientId: mongoose.Types.ObjectId(req.user._id) }] })
                    for (let relation of relations) {
                        if (relation && (relation.status == RELATION_STATUSES.ACTIVE || relation.status == RELATION_STATUSES.PENDING_APPROVAL)) {

                            if (trainers.length == 1) {
                                return res.status(HTTP_STATUS_CODES.OK).send({
                                    results: []
                                })
                            }

                            trainers.splice(i, 1);
                            i--;
                            continue;
                        }
                    }

                    if (trainers[i].userId.toString() == req.user._id.toString()) {

                        if (trainers.length == 1) {
                            return res.status(HTTP_STATUS_CODES.OK).send({
                                results: []
                            })
                        }

                        trainers.splice(i, 1);
                        i--;
                        continue;
                    }


                    Object.assign(trainers[i], { criteriasMet: 0 });

                    let check = false;
                    await checkForDistanceAndReviews(trainers[i], trainers[i].location, reviews, req.query.lat, req.query.lng, req.query.maxDistance, req.query.minRating, distanceForCheck).then(function (result) {
                        if (result == -1) {
                            check = true
                        }
                    })
                    if (check) {

                        if (trainers.length == 1) {
                            return res.status(HTTP_STATUS_CODES.OK).send({
                                results: []
                            })
                        }

                        trainers.splice(i, 1);
                        if (i > 0) i--;
                        continue;
                    }

                    const assignUser = await DbService.getOne(COLLECTIONS.USERS, { _id: trainers[i].userId })
                    Object.assign(trainers[i], { user: assignUser }, { clients: clients.length });

                }
            }
            quicksort(trainers, 0, trainers.length - 1)

        } else {
            trainers = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, { status: PERSONAL_TRAINER_STATUSES.ACTIVE })
            for (let i = 0; i < trainers.length; i++) {

                const clients = await DbService.getMany(COLLECTIONS.RELATIONS, { "$or": [{ personalTrainerId: trainers[i]._id }, { personalTrainerId: mongoose.Types.ObjectId(trainers[i]._id) }] });

                const relations = await DbService.getMany(COLLECTIONS.RELATIONS, { "$and": [{ personalTrainerId: mongoose.Types.ObjectId(trainers[i]._id) }, { clientId: mongoose.Types.ObjectId(req.user._id) }] })
                for (let relation of relations) {
                    if (relation && (relation.status == RELATION_STATUSES.ACTIVE || relation.status == RELATION_STATUSES.PENDING_APPROVAL)) {

                        if (trainers.length == 1) {
                            return res.status(HTTP_STATUS_CODES.OK).send({
                                results: []
                            })
                        }

                        trainers.splice(i, 1);
                        if (i > 0) i--;
                        continue;
                    }
                }

                if (trainers[i].userId.toString() == req.user._id.toString()) {

                    if (trainers.length == 1) {
                        return res.status(HTTP_STATUS_CODES.OK).send({
                            results: []
                        })
                    }

                    trainers.splice(i, 1);
                    i--;
                    continue;
                }

                Object.assign(trainers[i], { criteriasMet: 0 });

                let check = false;
                await checkForDistanceAndReviews(trainers[i], trainers[i].location, reviews, req.query.lat, req.query.lng, req.query.maxDistance, req.query.minRating, distanceForCheck).then(function (result) {
                    if (result == -1) {
                        check = true
                    }
                })
                if (check) {

                    if (trainers.length == 1) {
                        return res.status(HTTP_STATUS_CODES.OK).send({
                            results: []
                        })
                    }

                    trainers.splice(i, 1);
                    i--;
                    continue;
                }

                const assignUser = await DbService.getOne(COLLECTIONS.USERS, { _id: trainers[i].userId })
                Object.assign(trainers[i], { user: assignUser }, { clients: clients.length });
            }
            quicksort(trainers, 0, trainers.length - 1)

        }
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: trainers.slice(0, 50)
        })
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/client/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid client id", HTTP_STATUS_CODES.BAD_REQUEST, 15));

    try {
        const client = await DbService.getById(COLLECTIONS.USERS, req.params.id);
        if (!client) return next(new ResponseError("Client not found", HTTP_STATUS_CODES.NOT_FOUND, 16));

        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND, 17));

        const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id), clientId: mongoose.Types.ObjectId(client._id), status: RELATION_STATUSES.ACTIVE });
        if (!relation) return next(new ResponseError("Cannot get clients if you do not have an active relation with them", HTTP_STATUS_CODES.CONFLICT, 18));

        return res.status(HTTP_STATUS_CODES.OK).send({
            client
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.get('/client/:id/date', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid client id", HTTP_STATUS_CODES.BAD_REQUEST, 15));
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST, 4));
    }

    try {
        const client = await DbService.getById(COLLECTIONS.USERS, req.params.id);
        if (!client) return next(new ResponseError("Client not found", HTTP_STATUS_CODES.NOT_FOUND, 16));

        let cards = [];

        for (let card of CARD_COLLECTIONS) {
            const currentUserRecord = await DbService.getOne(card, {
                userId: mongoose.Types.ObjectId(req.params.id),
                date: +req.query.date,
                month: +req.query.month,
                year: +req.query.year,
            });

            if (currentUserRecord) {
                switch (card) {
                    case COLLECTIONS.DAILY_WEIGHTS:
                        const trend = await WeightTrackerService.getDailyTrend(currentUserRecord._id);
                        currentUserRecord.trend = trend ? trend : 0;
                        currentUserRecord.weight = parseFloat(currentUserRecord.weight).toFixed(2);
                        break;
                    case COLLECTIONS.WORKOUT_SESSIONS:
                        let exercises = [];
                        for (let exercise of currentUserRecord.exercises) {
                            exercises.push({ exerciseId: exercise.exerciseId });
                            const exerciseInstance = await DbService.getById(COLLECTIONS.EXERCISES, exercise.exerciseId);
                            exercise.exerciseName = exerciseInstance.title;
                            exercise.translations = exerciseInstance.translations;
                        }
                        const userTemplates = await DbService.getMany(COLLECTIONS.WORKOUTS, { userId: mongoose.Types.ObjectId(req.params.id) });
                        let hasWorkoutTemplateName = false;
                        for (let userTemplate of userTemplates) {
                            let match = true;
                            for (let exercise of userTemplate.exercises) {
                                let innerMatch = false;
                                for (let bodyExercise of exercises) {
                                    if (bodyExercise.exerciseId.toString() == exercise.toString()) {
                                        innerMatch = true;
                                        break;
                                    }
                                }
                                if (!innerMatch) {
                                    match = false;
                                    break;
                                }
                            }
                            if (match && exercises.length == userTemplate.exercises.length) {
                                hasWorkoutTemplateName = true;
                                currentUserRecord.hasWorkoutTemplateName = true;
                                currentUserRecord.workoutTemplateName = userTemplate.name;
                                break;
                            }
                        }
                        if (!hasWorkoutTemplateName) {
                            currentUserRecord.hasWorkoutTemplateName = false;
                        }
                        break;
                    case COLLECTIONS.CALORIES_COUNTER_DAYS:
                        for (let item of currentUserRecord.items) {
                            const itemInstance = await DbService.getById(COLLECTIONS.CALORIES_COUNTER_ITEMS, item.itemId);
                            item.itemInstance = itemInstance;
                        }
                        break;
                }
                cards.push({ card: card, data: currentUserRecord });
            }
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            cards
        });
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
})

router.get("/coach/profile/:id", async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid coach id", HTTP_STATUS_CODES.BAD_REQUEST, 5));

    try {
        const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, req.params.id);
        if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND, 17));

        const userInstance = await DbService.getById(COLLECTIONS.USERS, coach.userId);
        if (!userInstance) return next(new ResponseError("User was not found", HTTP_STATUS_CODES.NOT_FOUND, 39));

        coach.userInstance = userInstance;

        return res.status(HTTP_STATUS_CODES.OK).send({
            coach
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/coach/:id", async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid coach id", HTTP_STATUS_CODES.BAD_REQUEST, 5));

    try {
        const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, req.params.id);
        if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND, 17));

        const relations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(req.params.id) });
        let reviews = [];
        for (let relation of relations) {
            const review = await DbService.getOne(COLLECTIONS.REVIEWS, { relationId: mongoose.Types.ObjectId(relation._id) });
            if (review) reviews.push(review);
        }

        let rating = 3;
        if (reviews.length > 0) {
            rating = 0;
            for (let review of reviews) {
                rating += review.rating;
            }
            rating = rating / reviews.length;
        }

        coach.rating = rating;
        coach.clients = relations.length;

        let finalReviews = [];

        for (let review of reviews) {
            const relation = await DbService.getById(COLLECTIONS.RELATIONS, review.relationId);
            if (relation) {
                const client = await DbService.getById(COLLECTIONS.USERS, relation.clientId);
                if (client) {
                    review.clientInstance = client;
                    finalReviews.push(review);
                }
            }

        }

        coach.reviews = finalReviews;

        const user = await DbService.getOne(COLLECTIONS.USERS, { "$or": [{ _id: mongoose.Types.ObjectId(coach.userId) }, { _id: coach.userId }] });
        if (!user) return next(new ResponseError("User was not found", HTTP_STATUS_CODES.NOT_FOUND, 39));

        coach.user = user;

        return res.status(HTTP_STATUS_CODES.OK).send({
            coach
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.get('/applications', adminAuthenticate, async (req, res, next) => {
    try {
        const applications = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, { status: PERSONAL_TRAINER_STATUSES.PENDING });
        return res.status(HTTP_STATUS_CODES.OK).send({
            applications
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/coach/:id/status', adminAuthenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid coach id", HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = adminCoachStatusUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, req.params.id);
        if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND));
        await DbService.update(COLLECTIONS.PERSONAL_TRAINERS, { _id: mongoose.Types.ObjectId(req.params.id) }, { status: req.body.status })

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;