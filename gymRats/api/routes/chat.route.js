const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');

const ResponseError = require('../errors/responseError');

const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');
const AuthenticationService = require('../services/authentication.service');

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
                if (new Date(message.createdDt).getTime() > minTime && message.message.text) {
                    chat.lastMessage = message.message;
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid chat id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const chat = await DbService.getById(COLLECTIONS.CHATS, req.params.id);
        if (!chat) return next(new ResponseError("Chat not found", HTTP_STATUS_CODES.NOT_FOUND));

        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) })
        if (personalTrainer && (personalTrainer._id.toString() != chat.personalTrainerId.toString()) && (req.user._id.toString() != chat.clientId.toString()))
            return next(new ResponseError("You cannot access chats in which you are not a participant!", HTTP_STATUS_CODES.FORBIDDEN));

        let oppositeUser = null;
        if (personalTrainer && (chat.personalTrainerId.toString() == personalTrainer._id.toString())) oppositeUser = await DbService.getOne(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(chat.clientId) });
        if (chat.clientId.toString() == req.user._id.toString()) {
            const coach = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId);
            if (!coach) return next(new ResponseError("Coach was not found", HTTP_STATUS_CODES.NOT_FOUND));
            oppositeUser = await DbService.getById(COLLECTIONS.USERS, coach.userId);
        }
        if (!oppositeUser) return next(new ResponseError("Opposite user not found", HTTP_STATUS_CODES.NOT_FOUND));

        const messages = await DbService.getMany(COLLECTIONS.MESSAGES, { chatId: mongoose.Types.ObjectId(req.params.id) });
        Object.assign(chat, { user: req.user }, { oppositeUser: oppositeUser }, { messages: messages });

        return res.status(HTTP_STATUS_CODES.OK).send({
            chat
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id/seen', authenticate, async function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid chat id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const chat = await DbService.getById(COLLECTIONS.CHATS, req.params.id);
        if (!chat) return next(new ResponseError("Chat not found", HTTP_STATUS_CODES.NOT_FOUND));

        const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(req.user._id) })
        if (personalTrainer && (personalTrainer._id.toString() != chat.personalTrainerId.toString()) && (req.user._id.toString() != chat.clientId.toString()))
            return next(new ResponseError("You cannot access chats in which you are not a participant!", HTTP_STATUS_CODES.FORBIDDEN));

        let messages = (personalTrainer && (chat.personalTrainerId.toString() == personalTrainer._id.toString()))
            ? await DbService.getMany(COLLECTIONS.MESSAGES, { senderId: mongoose.Types.ObjectId(chat.clientId) })
            : await DbService.getMany(COLLECTIONS.MESSAGES, { senderId: mongoose.Types.ObjectId(chat.personalTrainerId) });

        for (let message of messages) {
            await DbService.update(COLLECTIONS.MESSAGES, { _id: mongoose.Types.ObjectId(message._id) }, { seen: true });
        }

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/:id/file/:messageId", async (req, res, next) => {
    if (!req.params.id) return next(new ResponseError("Invalid chat id", HTTP_STATUS_CODES.BAD_REQUEST));
    if (!req.params.messageId) return next(new ResponseError("Invalid message id", HTTP_STATUS_CODES.BAD_REQUEST));
    if (!req.query.token) return next(new ResponseError("Token not provided", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        let user = null;
        const verified = AuthenticationService.verifyToken(req.query.token);
        if (!verified) valid = false;
        else {
            user = await DbService.getById(COLLECTIONS.USERS, verified._id);
            if (!user) valid = false;
            else {
                if (verified.iat <= new Date(user.lastPasswordReset).getTime() / 1000) valid = false;
            }
        }
        if (!valid) return next(new ResponseError("Invalid token", HTTP_STATUS_CODES.BAD_REQUEST));

        const chat = await DbService.getById(COLLECTIONS.CHATS, req.params.id);
        if (!chat) return next(new ResponseError("Chat not found", HTTP_STATUS_CODES.NOT_FOUND));

        let isParticipant = false;
        if (chat.clientId.toString() == user._id.toString()) isParticipant = true;
        else {
            const personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId);
            if (personalTrainer.userId.toString() == user._id.toString()) isParticipant = true;
        }

        if (!isParticipant) {
            return next(new ResponseError("You are not a participant of this chat", HTTP_STATUS_CODES.FORBIDDEN));
        }

        const message = await DbService.getById(COLLECTIONS.MESSAGES, req.params.messageId);
        if (message.chatId.toString() != req.params.id) {
            return next(new ResponseError("Message not in this chat", HTTP_STATUS_CODES.NOT_FOUND));
        }

        const filePath = __dirname + "\\..\\ugc\\" + message.file.name + "." + message.file.extension;
        var stat = fileSystem.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': file.mimeType,
            'Content-Length': stat.size
        });

        var readStream = fileSystem.createReadStream(filePath);
        readStream.pipe(response);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;