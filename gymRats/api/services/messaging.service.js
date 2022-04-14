const { HTTP_STATUS_CODES, COLLECTIONS, RELATION_STATUSES } = require("../global");
const DbService = require('../services/db.service');
const mongoose = require("mongoose");
const ResponseError = require('../errors/responseError');
const Chat = require('../db/models/messaging/chat.model');
const Message = require('../db/models/messaging/message.model');

const MessagingService = {
    createChat: (personalTrainerId, clientId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await DbService.getById(COLLECTIONS.USERS, clientId);
                const trainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, personalTrainerId);

                if (trainer && client) {
                    const relation = await DbService.getOne(COLLECTIONS.RELATIONS, { personalTrainerId: mongoose.Types.ObjectId(trainer._id), clientId: mongoose.Types.ObjectId(client._id) });
                    if (relation && relation.status == RELATION_STATUSES.ACTIVE) {
                        const chat = await DbService.getOne(COLLECTIONS.CHATS, { personalTrainerId: mongoose.Types.ObjectId(trainer._id), clientId: mongoose.Types.ObjectId(client._id) });
                        if (!chat) {
                            const chat = new Chat({
                                personalTrainerId: mongoose.Types.ObjectId(trainer._id),
                                clientId: mongoose.Types.ObjectId(client._id)
                            })

                            await DbService.create(COLLECTIONS.CHATS, chat);
                            resolve();
                        }
                        reject(new ResponseError("There is already a chat between these people", HTTP_STATUS_CODES.BAD_REQUEST));
                    }
                    reject(new ResponseError("There is no active relation between these people", HTTP_STATUS_CODES.CONFLICT));
                }
                reject(new ResponseError("Client or trainer not found", HTTP_STATUS_CODES.NOT_FOUND));

            } catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    sendTextMessage: (chatId, senderId, message) => {
        return new Promise(async (resolve, reject) => {
            try {
                const textMessage = new Message({
                    senderId: mongoose.Types.ObjectId(senderId),
                    chatId: mongoose.Types.ObjectId(chatId),
                    message: {
                        text: message
                    }
                })

                const chat = await DbService.getById(COLLECTIONS.CHATS, chatId);

                const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(senderId) })

                if (chat && ((personalTrainer && (personalTrainer._id.toString() != chat.personalTrainerId.toString())) && senderId.toString() != chat.clientId.toString())) {
                    reject(new ResponseError("Trainer or client is not part of the chat or the chat does not exist", HTTP_STATUS_CODES.BAD_REQUEST));
                }
                await DbService.create(COLLECTIONS.MESSAGES, textMessage);
                resolve();

            } catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    sendFileMessage: (chatId, senderId, base64) => {
        return new Promise(async (resolve, reject) => {
            try {
                const fileMessage = new Message({
                    senderId: mongoose.Types.ObjectId(senderId),
                    chatId: mongoose.Types.ObjectId(chatId),
                    message: {
                        file: base64
                    }
                })

                const chat = await DbService.getById(COLLECTIONS.CHATS, chatId);

                const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(senderId) })

                if (chat && ((personalTrainer && (personalTrainer._id.toString() != chat.personalTrainerId.toString())) && senderId.toString() != chat.clientId.toString())) {
                    reject(new ResponseError("Trainer or client is not part of the chat or the chat does not exist", HTTP_STATUS_CODES.BAD_REQUEST));
                }
                await DbService.create(COLLECTIONS.MESSAGES, fileMessage);
                resolve();

            } catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    }
}

module.exports = MessagingService;