const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const { uuid } = require('uuidv4');
const mime = require('mime-types')

const { authenticate } = require('../middlewares/authenticate');
const { contentPostValidation } = require('../validation/hapi');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE, COLLECTIONS, PERSONAL_TRAINER_STATUSES, CONTENT_STATUSES, CONTENT_VISIBILITY } = require('../global');
const DbService = require('../services/db.service');
const Content = require('../db/models/coaching/content.model');

router.post("/", authenticate, async (req, res, next) => {
    const { error } = contentPostValidation(req.body);
    if(error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {userId: mongoose.Types.ObjectId(req.user._id)});
        if(!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND, 17));
        if(personalTrainer.status != PERSONAL_TRAINER_STATUSES.ACTIVE) return next(new ResponseError("You are not allowed to post content if you are not an active personal trainer", HTTP_STATUS_CODES.FORBIDDEN, 60))
    
        const fileName = uuid();
        const fileContents = new Buffer.from(base64, 'base64')
        const extension = mime.extension(mimeType);

        fs.writeFileSync(NODE_ENVIRONMENT == NODE_ENVIRONMENTS.PRODUCTION
            ? __dirname + "/../ugc/" + fileName + "." + extension
            : __dirname + "\\..\\ugc\\" + fileName + "." + extension, fileContents);
            
        const file = {
            name: fileName,
            mimeType: req.body.mimeType,
            size: req.body.size,
            originalName: req.body.name,
            extension
        }

        const content = new Content({
            personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id),
            file,
            visibility: req.body.visibility
        })

        await DbService.create(COLLECTIONS.CONTENTS, content);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
    }
});

router.delete("/:id", authenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid content id", HTTP_STATUS_CODES.BAD_REQUEST, 5));

    try {
        const content = await DbService.getById(COLLECTIONS.CONTENTS, req.params.id);
        if(!content) return next(new ResponseError("Content not found", HTTP_STATUS_CODES.NOT_FOUND, 61));
        if(content.status == CONTENT_STATUSES.BLOCKED) return next(new ResponseError("Blocked content cannot be deleted", HTTP_STATUS_CODES.CONFLICT, 63))
 
        const personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, content.personalTrainerId);
        if(!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND, 17));
        if(personalTrainer.userId.toString() != req.user._id.toString()) return next(new ResponseError("You are not allowed to delete this content", 62))   
    
        await DbService.delete(COLLECTIONS.CONTENTS, { _id: mongoose.Types.ObjectId(req.params.id)});

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/:personalTrainerId", authenticate, async (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.personalTrainerId)) return next(new ResponseError("Invalid id parameter", HTTP_STATUS_CODES.BAD_REQUEST, 5));

    try {
        const personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, req.params.personalTrainerId);
        if(!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.BAD_REQUEST, 17));
        
        if(personalTrainer.userId.toString() == req.user._id.toString()) {
            const contents = await DbService.getMany(COLLECTIONS.CONTENTS, {personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id)})
            return res.status(HTTP_STATUS_CODES.OK).send({
                contents
            })
        }

        let clientIds = [];
        const relations = await DbService.getMany(COLLECTIONS.RELATIONS, {personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id)});
        for(let relation of relations) {
            clientIds.push(relation.clientId.toString());
        }

        if(clientIds.includes(req.user._id.toString())) {
            const contents = await DbService.getMany(COLLECTIONS.CONTENTS, {personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id), visibility: {"$ne": CONTENT_VISIBILITY.HIDDEN}})
            return res.status(HTTP_STATUS_CODES.OK).send({
                contents
            });
        }
    
        const contents = await DbService.getMany(COLLECTIONS.CONTENTS, {personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id), visibility: {"$and": [{"$ne": CONTENT_VISIBILITY.HIDDEN}, {"$ne": CONTENT_VISIBILITY.VISIBLE_FOR_CLIENTS}]}})
        return res.status(HTTP_STATUS_CODES.OK).send({
            contents
        });
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;