const express = require('express');
const mongoose = require('mongoose');
const ResponseError = require('../errors/responseError');
const { HTTP_STATUS_CODES, COLLECTIONS } = require('../global');
const DbService = require('../services/db.service');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');

router.get('/', authenticate, async function (req, res, next) {
    try {
        const chats = await DbService.getMany(COLLECTIONS.CHATS, {"$or": [{ trainerId: mongoose.Types.ObjectId(req.user._id) }, { clientId: mongoose.Types.ObjectId(req.user._id) }] });

        for(let chat of chats){
            let oppositeUser;
            if(chat.trainerId.toString() == req.user._id.toString()){
                oppositeUser = await DbService.getOne(COLLECTIONS.USERS, {_id: mongoose.Types.ObjectId(chat.clientId)});
            }
            if(chat.clientId.toString() == req.user._id.toString()){
                const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {_id: mongoose.Types.ObjectId(chat.trainerId)});
                oppositeUser = await DbService.getOne(COLLECTIONS.USERS, {_id: mongoose.Types.ObjectId(coach.userId)});
            }
            if(!oppositeUser) return next(new ResponseError("Opposite user not found", HTTP_STATUS_CODES.NOT_FOUND));
            Object.assign(chat, {user: req.user}, { oppositeUser: oppositeUser }, {lastMessage: ""});

            const messages = await DbService.getMany(COLLECTIONS.MESSAGES, {chatId: mongoose.Types.ObjectId(chat._id)});
            let minTime = 0;
            for(let message of messages){
                if(new Date(message.createdAt).getTime() > minTime){
                    chat.lastMessage = message.message;
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
        const chat = await DbService.getById(COLLECTIONS.CHATS, req.params.id);

        if (!chat) {
            return next(new ResponseError("Chat not found", HTTP_STATUS_CODES.NOT_FOUND));
        }

        if (req.user._id.toString() != chat.trainerId.toString() || req.user._id.toString() != chat.clientId.toString()) {
            return next(new ResponseError("You cannot access chats in which you are not a participant!", HTTP_STATUS_CODES.FORBIDDEN));
        }

        let oppositeUser;
        if(chat.trainerId.toString() == req.user._id.toString()){
            oppositeUser = await DbService.getOne(COLLECTIONS.USERS, {_id: mongoose.Types.ObjectId(chat.clientId)});
        }
        if(chat.clientId.toString() == req.user._id.toString()){
            const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {_id: mongoose.Types.ObjectId(chat.trainerId)});
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




module.exports = router;