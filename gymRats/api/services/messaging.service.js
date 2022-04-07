const { HTTP_STATUS_CODES, COLLECTIONS, RELATION_STATUSES } = require("../global");
const DbService = require('../services/db.service');
const mongoose = require("mongoose");
const ResponseError = require('../errors/responseError');
const Chat = require('../db/models/messaging/chat.model');
const Message = require('../db/models/messaging/message.model');
const { chatValidation, messageValidation } = require('../validation/hapi');

const MessagingService = {
    createChat: (personalTrainerId, clientId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const client = await DbService.getOne(COLLECTIONS.CLIENTS, {_id: mongoose.Types.ObjectId(clientId)});
                const trainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {userId: mongoose.Types.ObjectId(personalTrainerId)});

                if(trainer && client){
                    
                    const relation = await DbService.getOne(COLLECTIONS.RELATIONS, {personalTrainerId: mongoose.Types.ObjectId(trainer._id), clientId: mongoose.Types.ObjectId(client._id)});

                    if(relation || relation.status == RELATION_STATUSES.ACTIVE){
                        const chat = await DbService.getOne(COLLECTIONS.CHATS, { personalTrainerId: mongoose.Types.ObjectId(personalTrainerId), clientId: mongoose.Types.ObjectId(clientId) });
                        if(!chat){
                            const chat = new Chat({
                                personalTrainerId: mongoose.Types.ObjectId(personalTrainerId),
                                clientId: mongoose.Types.ObjectId(clientId)
                            })
                            const { error } = chatValidation(chat);
                            if (error) reject(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

                            await DbService.create(COLLECTIONS.CHATS, chat);
                            resolve();
                        }
                        reject(new ResponseError("There is already a chat between these people", HTTP_STATUS_CODES.BAD_REQUEST));
                    }
                    reject(new ResponseError("There is no active relation between these people", HTTP_STATUS_CODES.CONFLICT));
                }
                reject(new ResponseError("Client or trainer not found", HTTP_STATUS_CODES.NOT_FOUND));

            }catch (err) {
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
                const { error } = messageValidation(textMessage);
                if (error) reject(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

                const chat = await DbService.getById(COLLECTIONS.CHATS, chatId);

                if(chat && (chat.personalTrainerId.toString() == senderId.toString() || chat.clientId.toString() == senderId.toString())){
                    await DbService.create(COLLECTIONS.MESSAGES, textMessage);
                    resolve();
                }
                reject(new ResponseError("Trainer or client is not part of the chat or the chat does not exist", HTTP_STATUS_CODES.BAD_REQUEST));
            }catch (err) {
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
                const { error } = messageValidation(fileMessage);
                if (error) reject(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

                const chat = await DbService.getById(COLLECTIONS.CHATS, chatId);

                if(chat && (chat.personalTrainerId.toString() == senderId.toString() || chat.clientId.toString() == senderId.toString())){
                    await DbService.create(COLLECTIONS.MESSAGES, fileMessage);
                    resolve();
                }
                reject(new ResponseError("Trainer or client is not part of the chat or the chat does not exist", HTTP_STATUS_CODES.BAD_REQUEST));
            }catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    }
}   

module.exports = MessagingService;