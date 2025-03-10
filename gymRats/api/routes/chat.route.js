const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');

const fs = require('fs');
const path = require('path');

router.get('/', authenticate, async (req, res, next) => {
    try {
        let errors = [];
        let chats = [];

        chats.push(...await DbService.getMany(COLLECTIONS.CHATS, { clientId: mongoose.Types.ObjectId(req.user._id) }));

        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) })
        if (personalTrainer)
            chats.push(...await DbService.getMany(COLLECTIONS.CHATS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainer._id) }))


        for (let chat of chats) {
            let oppositeUser = null;
            if (chat.clientId.toString() == req.user._id.toString()) {
                const coach = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { _id: mongoose.Types.ObjectId(chat.personalTrainerId) });
                oppositeUser = await DbService.getOne(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(coach.userId) });
            } else {
                oppositeUser = await DbService.getById(COLLECTIONS.USERS, chat.clientId);
            }

            if (!oppositeUser) {
                errors.push({ message: `Cannot find opposite user for chat ${chat._id}`, dt: new Date().getTime() });
                continue;
            }

            Object.assign(chat, { user: req.user }, { oppositeUser: oppositeUser }, { lastMessage: null });

            const messages = await DbService.getMany(COLLECTIONS.MESSAGES, { chatId: mongoose.Types.ObjectId(chat._id) });
            let minTime = 0;
            for (let message of messages) {
                if (new Date(message.createdDt).getTime() > minTime) {
                    chat.lastMessage = message.message;
                    chat.lastMessage.seen = message.seen;
                    chat.lastMessage.senderId = message.senderId;
                    chat.lastMessage.createdDt = message.createdDt;
                    minTime = new Date(message.createdDt).getTime();
                }
            }
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            chats,
            errors
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid chat id", HTTP_STATUS_CODES.BAD_REQUEST, 5)); let lastMessageId = req.query.lastMessageId;
    if (lastMessageId)
        if (!mongoose.Types.ObjectId(lastMessageId)) return next(new ResponseError("Invalid message id", HTTP_STATUS_CODES.BAD_REQUEST, 5));

    try {
        const chat = await DbService.getById(COLLECTIONS.CHATS, req.params.id);
        if (!chat) return next(new ResponseError("Chat not found", HTTP_STATUS_CODES.NOT_FOUND, 22));

        const personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId)
        if (!personalTrainer || personalTrainer.userId.toString() != req.user._id.toString()) {
            if (chat.clientId.toString() != req.user._id.toString()) {
                return next(new ResponseError("You cannot access chats in which you are not a participant!", HTTP_STATUS_CODES.FORBIDDEN, 23));
            }
        }

        let oppositeUser = null;
        if (personalTrainer && (chat.personalTrainerId.toString() == personalTrainer._id.toString())) oppositeUser = await DbService.getOne(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(chat.clientId) });
        if (chat.clientId.toString() == req.user._id.toString()) {
            const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId);
            if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND, 17));
            oppositeUser = await DbService.getById(COLLECTIONS.USERS, coach.userId);
        }
        if (!oppositeUser) return next(new ResponseError("Opposite user not found", HTTP_STATUS_CODES.NOT_FOUND, 24));

        let messages = [];
        if (!lastMessageId) {
            messages = await DbService.getManyWithSortAndLimit(COLLECTIONS.MESSAGES, { chatId: mongoose.Types.ObjectId(req.params.id) }, { createdDt: -1 }, 25);
            if (messages.length > 0) {
                messages.reverse()
            }
        } else {
            const lastMessage = await DbService.getOne(COLLECTIONS.MESSAGES, { _id: mongoose.Types.ObjectId(req.query.lastMessageId) });
            if (!lastMessage) return next(new ResponseError("Message not found", HTTP_STATUS_CODES.NOT_FOUND, 59));
            messages = await DbService.getManyWithSortAndLimit(COLLECTIONS.MESSAGES, { chatId: mongoose.Types.ObjectId(req.params.id), createdDt: { "$lt": lastMessage.createdDt } }, { createdDt: -1 }, 25);
            if (messages.length > 0) {
                messages.reverse()
            }
        }

        Object.assign(chat, { user: req.user }, { oppositeUser: oppositeUser }, { messages: messages });

        return res.status(HTTP_STATUS_CODES.OK).send({
            chat
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id/seen', authenticate, async function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid chat id", HTTP_STATUS_CODES.BAD_REQUEST, 5));

    try {
        const chat = await DbService.getById(COLLECTIONS.CHATS, req.params.id);
        if (!chat) return next(new ResponseError("Chat not found", HTTP_STATUS_CODES.NOT_FOUND, 22));

        const userIsClientInChat = (chat.clientId.toString() == req.user._id.toString());

        let messages = [];

        if (userIsClientInChat) {
            const personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId);
            if (!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND, 17));

            const personalTrainerUserInstance = await DbService.getById(COLLECTIONS.USERS, personalTrainer.userId);
            if (!personalTrainerUserInstance) return next(new ResponseError("Personal trainer user not found", HTTP_STATUS_CODES.NOT_FOUND, 17));

            messages = await DbService.getMany(COLLECTIONS.MESSAGES, { chatId: mongoose.Types.ObjectId(req.params.id), senderId: mongoose.Types.ObjectId(personalTrainerUserInstance._id) });
        } else {
            const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) });
            if (!personalTrainer) return next(new ResponseError("Personal trainer not found", HTTP_STATUS_CODES.NOT_FOUND, 17));

            if (personalTrainer._id.toString() != chat.personalTrainerId.toString()) return next(new ResponseError("You cannot access chats in which you are not a participant!", HTTP_STATUS_CODES.FORBIDDEN, 23));

            messages = await DbService.getMany(COLLECTIONS.MESSAGES, { chatId: mongoose.Types.ObjectId(req.params.id), senderId: mongoose.Types.ObjectId(chat.clientId) });
        }

        for (let message of messages) {
            await DbService.update(COLLECTIONS.MESSAGES, { _id: mongoose.Types.ObjectId(message._id) }, { seen: true });
        }

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;