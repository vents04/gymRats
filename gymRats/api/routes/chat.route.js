const express = require('express');
const mongoose = require('mongoose');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, COLLECTIONS } = require('../global');
const DbService = require('../services/db.service');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');

router.get('/', authenticate, async function (req, res, next) {
    try {
        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {userId:  mongoose.Types.ObjectId(req.user._id)})
        let chats
        if(personalTrainer){
            chats = await DbService.getMany(COLLECTIONS.CHATS, {personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id) });
        }else{
            chats = await DbService.getMany(COLLECTIONS.CHATS, {clientId: mongoose.Types.ObjectId(req.user._id) });
        }
        for(let chat of chats){
            let oppositeUser;
            if(personalTrainer && (chat.personalTrainerId.toString() == personalTrainer._id.toString())){
                oppositeUser = await DbService.getOne(COLLECTIONS.USERS, {_id: mongoose.Types.ObjectId(chat.clientId)});
            }
            if(chat.clientId.toString() == req.user._id.toString()){
                const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {_id: mongoose.Types.ObjectId(chat.personalTrainerId)});
                oppositeUser = await DbService.getOne(COLLECTIONS.USERS, {_id: mongoose.Types.ObjectId(coach.userId)});
            }
            if(!oppositeUser) return next(new ResponseError("Opposite user not found", HTTP_STATUS_CODES.NOT_FOUND));
            Object.assign(chat, {user: req.user}, { oppositeUser: oppositeUser }, {lastMessage: ""});

            const messages = await DbService.getMany(COLLECTIONS.MESSAGES, {chatId: mongoose.Types.ObjectId(chat._id)});
            let minTime = 0;
            for(let message of messages){
                if(new Date(message.createdAt).getTime() > minTime){
                    chat.lastMessage = message.message;
                    if(message.message.text){
                        chat.lastMessage = message.message.text
                    }else{
                        chat.lastMessage = "File"
                    }
                    minTime = new Date(message.createdAt).getTime();
                }
            }
        }

        res.status(HTTP_STATUS_CODES.OK).send({
            chats: chats
        })
    } catch (err) {
        return next(new ResponseError(err.message, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.get('/:id', authenticate, async function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ResponseError("Invalid chat id", HTTP_STATUS_CODES.BAD_REQUEST));
    }
    try {
        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {userId:  mongoose.Types.ObjectId(req.user._id)})

        const chat = await DbService.getById(COLLECTIONS.CHATS, req.params.id);

        if (!chat) {
            return next(new ResponseError("Chat not found", HTTP_STATUS_CODES.NOT_FOUND));
        }

        if ((personalTrainer && (personalTrainer._id.toString() != chat.personalTrainerId.toString())) && req.user._id.toString() != chat.clientId.toString()) {
            return next(new ResponseError("You cannot access chats in which you are not a participant!", HTTP_STATUS_CODES.FORBIDDEN));
        }

        let oppositeUser;
        if(personalTrainer && (chat.personalTrainerId.toString() == personalTrainer._id.toString())){
            oppositeUser = await DbService.getOne(COLLECTIONS.USERS, {_id: mongoose.Types.ObjectId(chat.clientId)});
        }
        if(chat.clientId.toString() == req.user._id.toString()){
            const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {_id: mongoose.Types.ObjectId(chat.personalTrainerId)});
            oppositeUser = await DbService.getOne(COLLECTIONS.USERS, {_id: mongoose.Types.ObjectId(coach.userId)});
        }
        if(!oppositeUser) return next(new ResponseError("Opposite user not found", HTTP_STATUS_CODES.NOT_FOUND));
        
        const messages = await DbService.getMany(COLLECTIONS.MESSAGES, {chatId: mongoose.Types.ObjectId(req.params.id)});

        Object.assign(chat, { user: req.user }, { oppositeUser: oppositeUser }, { messages: messages });

        res.status(HTTP_STATUS_CODES.OK).send({
            chat: chat
        })
    } catch (err) {
        return next(new ResponseError(err.message, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

router.put('/:id/seen', authenticate, async function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ResponseError("Invalid chat id", HTTP_STATUS_CODES.BAD_REQUEST));
    }
    try {
        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {userId:  mongoose.Types.ObjectId(req.user._id)})

        const chat = await DbService.getById(COLLECTIONS.CHATS, req.params.id);

        if (!chat) {
            return next(new ResponseError("Chat not found", HTTP_STATUS_CODES.NOT_FOUND));
        }
        
        if ((personalTrainer && (personalTrainer._id.toString() != chat.personalTrainerId.toString())) && req.user._id.toString() != chat.clientId.toString()) {
            return next(new ResponseError("You cannot access chats in which you are not a participant!", HTTP_STATUS_CODES.FORBIDDEN));
        }

        let messages;
        if(personalTrainer && (chat.personalTrainerId.toString() == personalTrainer._id.toString())){
            messages = await DbService.getMany(COLLECTIONS.MESSAGES, {senderId: mongoose.Types.ObjectId(chat.clientId)});
        }
        if(chat.clientId.toString() == req.user._id.toString()){
            messages = await DbService.getMany(COLLECTIONS.MESSAGES, {senderId: mongoose.Types.ObjectId(chat.personalTrainerId)});
        }
        
        for(let message of messages){
            await DbService.update(COLLECTIONS.MESSAGES, { _id: mongoose.Types.ObjectId(message._id) }, { seen: true });
        }

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})




module.exports = router;