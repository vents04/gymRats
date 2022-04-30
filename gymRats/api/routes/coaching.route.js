const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');
const MessagingService = require('../services/messaging.service');

const PersonalTrainer = require('../db/models/coaching/personalTrainer.model');
const Relation = require('../db/models/coaching/relation.model');
const Content = require('../db/models/coaching/content.model');
const Review = require('../db/models/coaching/review.model');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, PERSONAL_TRAINER_STATUSES, RELATION_STATUSES, CONTENT_VISIBILITY_SCOPES, DEFAULT_ERROR_MESSAGE, CARD_COLLECTIONS } = require('../global');
const { relationValidation, relationStatusUpdateValidation, coachApplicationPostValidation, contentPostValidation, contentUpdateValidation, coachingReviewPostValidation } = require('../validation/hapi');
const WeightTrackerService = require('../services/cards/weightTracker.service');
const { func } = require('@hapi/joi');
const { quicksort } = require('../helperFunctions/quickSortForCoaches')
const { checkForDistanceAndReviews } = require('../helperFunctions/checkDistanceAndReviews')

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
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.get('/me-as-coach', authenticate, async (req, res, next) => {
    try {
        const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND));

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
    const { error } = coachApplicationPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingPersonalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (existingPersonalTrainer) return next(new ResponseError("You are already a personal trainer", HTTP_STATUS_CODES.CONFLICT));

        const personalTrainer = new PersonalTrainer(req.body);
        personalTrainer.userId = req.user._id;
        await DbService.create(COLLECTIONS.PERSONAL_TRAINERS, personalTrainer);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.post('/relation', authenticate, async (req, res, next) => {
    const { error } = relationValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, req.body.coachId);
        if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (coach.status != PERSONAL_TRAINER_STATUSES.ACTIVE) return next(new ResponseError("This coach is not accepting requests currently", HTTP_STATUS_CODES.CONFLICT));
        if (coach.userId.toString() == req.user._id.toString()) return next(new ResponseError("You cannot be your own client", HTTP_STATUS_CODES.CONFLICT));

        const existingRequests = await DbService.getMany(COLLECTIONS.RELATIONS, { clientId: mongoose.Types.ObjectId(req.user._id), personalTrainerId: mongoose.Types.ObjectId(req.body.coachId) });
        let hasConflict = false;
        for (let request of existingRequests) {
            if (request.status == RELATION_STATUSES.PENDING_APPROVAL || request.status == RELATION_STATUSES.ACTIVE) {
                hasConflict = true;
                break;
            }
        }

        if (hasConflict) return next(new ResponseError("You have already sent a request for coaching or have an active relation with this coach.", HTTP_STATUS_CODES.CONFLICT));

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid request id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const request = await DbService.getById(COLLECTIONS.RELATIONS, req.params.id);
        if (!request) return next(new ResponseError("Request was not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (request.status != RELATION_STATUSES.PENDING_APPROVAL) return next(new ResponseError("Request was already answered", HTTP_STATUS_CODES.CONFLICT));
        if (request.clientId.toString() != req.user._id.toString()) return next(new ResponseError("You are not allowed to delete this request", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.delete(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
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
        if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND));

        if (relation.status != RELATION_STATUSES.ACTIVE && relation.status != RELATION_STATUSES.PENDING_APPROVAL)
            return next(new ResponseError("Relation status should be active or pending approval to update", HTTP_STATUS_CODES.CONFLICT));

        if (!(relation.status == RELATION_STATUSES.PENDING_APPROVAL
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

        if (req.body.status == RELATION_STATUSES.ACTIVE) {
            await DbService.update(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                from: new Date().getTime()
            });
            await MessagingService.createChat(relation.personalTrainerId, relation.clientId)
        } else if (req.body.status == RELATION_STATUSES.CANCELED) {
            await DbService.update(COLLECTIONS.RELATIONS, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                to: new Date().getTime()
            })
        }

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid relation id", HTTP_STATUS_CODES.BAD_REQUEST))

    const { error } = coachingReviewPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const relation = await DbService.getById(COLLECTIONS.RELATIONS, req.params.id);
        if (!relation) return next(new ResponseError("Relation not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (relation.status != RELATION_STATUSES.CANCELED) return next(new ResponseError("Relation has not been ended or has been declined. You cannot leave a review", HTTP_STATUS_CODES.CONFLICT));
        if (relation.clientId.toString() != req.user._id.toString()) return next(new ResponseError("Only clients may post reviews", HTTP_STATUS_CODES.CONFLICT));

        const existingReview = await DbService.getOne(COLLECTIONS.REVIEWS, { relationId: mongoose.Types.ObjectId(req.params.id) });
        if (existingReview) return next(new ResponseError("Review already added", HTTP_STATUS_CODES.CONFLICT));

        const review = new Review(req.body);
        review.relationId = req.params.id;
        await DbService.create(COLLECTIONS.REVIEWS, review);

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    } catch (error) {
        return next(new ResponseError(error.message || DEFAULT_ERROR_MESSAGE, error.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.get("/coach/search", authenticate, async (req, res, next) => {
    const dt = new Date().getTime();
    let names = req.query.name;

    if (((req.query.lat && !req.query.lng) || (!req.query.lat && req.query.lng)) && !names) {
        const trainers = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, {});
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: trainers
        })
    }

    if ((req.query.lat && req.query.lng) && req.query.maxDistance) {
        return next(new ResponseError("We cannot search for max distance when we don't know your location", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try {
        let distanceForCheck = 30;
        let users = [];
        const reviews = await DbService.getMany(COLLECTIONS.REVIEWS, {});

        if (req.query.maxDistance && req.query.maxDistance <= 120) {
            distanceForCheck = req.query.maxDistance / 4;
        }

        if (names && names != "") {
            names = names.split(" ");
            for (let name of names) {
                users = await DbService.lookUpAndMergeCoachesNames(COLLECTIONS.USERS, COLLECTIONS.PERSONAL_TRAINERS, "_id", "userId", "trainer", name);

                /* Code if the trainer model had names in it
                 users = await DbService.getMany(COLLECTIONS.TRAINERS, {{$or: 
                        [{ firstName: { $regex: name, $options: "i" } }, 
                        { lastName: { $regex: name, $options: "i" } }] 
                    }})
                
                */

                for (let i = 0; i < users.length; i++) {

                    const clients = await DbService.getMany(COLLECTIONS.RELATIONS, { "$or": [{ personalTrainerId: users[i].trainer._id }, { personalTrainerId: mongoose.Types.ObjectId(users[i].trainer._id) }] });

                    if (users[i]._id.toString() == req.user._id.toString()) {
                        users.splice(i, 1);
                        i--;
                        continue;
                    }

                    const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { personalTrainerId: users[i].trainer._id, clientId: req.user._id, status: RELATION_STATUSES.PENDING_APPROVAL })
                    if (relation) continue;

                    Object.assign(users[i], { criteriasMet: 0 }, { clients: clients.length });
                    if (!checkForDistanceAndReviews(users[i], users[i].trainer.location, reviews, req.query.lat, req.query.lng, req.query.maxDistance, req.query.minRating, distanceForCheck, users[i].trainer._id)) {
                        users.splice(i, 1);
                        i--;
                        continue;
                    }
                }
            }
            quicksort(users, 0, users.length - 1)

        } else {
            users = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, { status: PERSONAL_TRAINER_STATUSES.ACTIVE })
            for (let i = 0; i < users.length; i++) {

                const clients = await DbService.getMany(COLLECTIONS.RELATIONS, { "$or": [{ personalTrainerId: users[i]._id }, { personalTrainerId: mongoose.Types.ObjectId(users[i]._id) }] });

                if (users[i].userId.toString() == req.user._id.toString()) {
                    users.splice(i, 1);
                    i--;
                    continue;
                }

                const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { personalTrainerId: users[i]._id, clientId: req.user._id, status: RELATION_STATUSES.PENDING_APPROVAL })
                if (relation) continue;

                Object.assign(users[i], { criteriasMet: 0 }, { clients: clients.length });
                if (!checkForDistanceAndReviews(users[i], users[i].location, reviews, req.query.lat, req.query.lng, req.query.maxDistance, req.query.minRating, distanceForCheck, users[i]._id)) {
                    users.splice(i, 1);
                    i--;
                    continue;
                }

                const assignUser = await DbService.getOne(COLLECTIONS.USERS, { _id: users[i].userId })
                Object.assign(users[i], { user: assignUser });
            }
            quicksort(users, 0, users.length - 1)

        }
        const dt2 = new Date().getTime();
        console.log(dt - dt2)
        return res.status(HTTP_STATUS_CODES.OK).send({
            results: users.slice(0, 50)
        })
    } catch (error) {
        return next(new ResponseError(error.message || "leternal server error", error.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.post('/content', authenticate, async (req, res, next) => {
    const { error } = contentPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND));

        const content = new Content(req.body);
        content.personalTrainerId = personalTrainer._id;

        await DbService.create(COLLECTIONS.CONTENTS, content);

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.put('/content/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid content id", HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = contentUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const content = await DbService.getById(COLLECTIONS.CONTENTS, req.params.id);
        if (!content) return next(new ResponseError("Content not found", HTTP_STATUS_CODES.NOT_FOUND));

        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (personalTrainer.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot update this content", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.update(COLLECTIONS.CONTENTS, { _id: mongoose.Types.ObjectId(req.params.id) }, req.body);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.delete('/content/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid content id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const content = await DbService.getById(COLLECTIONS.CONTENTS, req.params.id);
        if (!content) return next(new ResponseError("Content not found", HTTP_STATUS_CODES.NOT_FOUND));

        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (personalTrainer.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot delete this content", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.delete(COLLECTIONS.CONTENTS, { _id: mongoose.Types.ObjectId(req.params.id) });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.get('/content/:personalTrainerId', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.personalTrainerId)) return next(new ResponseError("Invalid personal trainer id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, req.params.personalTrainerId);
        if (!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND));

        const relations = await DbService.getMany(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(coach._id), status: RELATION_STATUSES.ACTIVE });
        let contents = [];
        for (let relation of relations) {
            if (relation.clientId.toString() == req.user._id.toString()) {
                const clientsContents = await DbService.getMany(COLLECTIONS.CONTENTS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id), isVisible: true, visibilityScope: CONTENT_VISIBILITY_SCOPES.CLIENTS })
                contents.push(...clientsContents);
                break;
            }
        }
        if (personalTrainer.userId.toString() == req.user._id.toString()) {
            const allContents = await DbService.getMany(COLLECTIONS.CONTENTS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id) });
            contents.push(...allContents);
        } else {
            const publicContents = await DbService.getMany(COLLECTIONS.CONTENTS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id), isVisible: true, visibilityScope: CONTENT_VISIBILITY_SCOPES.PUBLIC })
            contents.push(...publicContents);
        }


        let finalContents = {}
        for (let content of contents) {
            if (!finalContents[content.section]) {
                finalContents[content.section] = [].push(content);
                continue;
            }
            finalContents[content.section].push(content);
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            finalContents
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.get('/client/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid client id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const client = await DbService.getById(COLLECTIONS.USERS, req.params.id);
        if (!client) return next(new ResponseError("Client not found", HTTP_STATUS_CODES.NOT_FOUND));

        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND));

        const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id), clientId: mongoose.Types.ObjectId(client._id), status: RELATION_STATUSES.ACTIVE });
        if (!relation) return next(new ResponseError("Cannot get clients if you do not have an active relation with them", HTTP_STATUS_CODES.CONFLICT));

        return res.status(HTTP_STATUS_CODES.OK).send({
            client
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.letERNAL_SERVER_ERROR));
    }
});

router.get('/client/:id/date', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid client id", HTTP_STATUS_CODES.BAD_REQUEST));
    if (!req.query.date || !req.query.month || !req.query.year
        || !Date.parse(req.query.year + "-" + req.query.month + "-" + req.query.date)) {
        return next(new ResponseError("Invalid date parameters", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try {
        const client = await DbService.getById(COLLECTIONS.USERS, req.params.id);
        if (!client) return next(new ResponseError("Client not found", HTTP_STATUS_CODES.NOT_FOUND));

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

module.exports = router;