const { HTTP_STATUS_CODES, COLLECTIONS, CHAT_STATUSES } = require("../../global");
const DbService = require("../db.service");
const mongoose = require("mongoose");
const ResponseError = require("../../errors/responseError");
const Chat = require('../db/models/messaging/chat.model');
const { chatValidation, messageValidation } = require('../validation/hapi');

const MessagingService = {
    createChat: (personalTrainerId, clientId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const trainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {userId: mongoose.Types.ObjectId(personalTrainerId)});
                const client = await DbService.getOne(COLLECTIONS.USERS, {_id: mongoose.Types.ObjectId(clientId)});

                if((trainer && client)){
                    const chat = await DbService.getOne(COLLECTIONS.CHATS, { trainerId: mongoose.Types.ObjectId(trainerId), clientId: mongoose.Types.ObjectId(clientId) });
                    if(!chat){
                        const chat = new Chat({
                            trainerId: mongoose.Types.ObjectId(trainerId),
                            clientId: mongoose.Types.ObjectId(clientId)
                        });
                        await DbService.create(COLLECTIONS.CHATS, chat);
                        resolve();
                    }
                    reject(new ResponseError("There is already a chat between these people", HTTP_STATUS_CODES.BAD_REQUEST));
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
                const textMessage = {
                    senderId: senderId,
                    chatId: chatId,
                    message: {
                        text: message
                    }
                }

                const chat = await DbService.getById(COLLECTIONS.CHATS, chatId);

                if(chat && (chat.trainerId.toString() == senderId.toString() || chat.clientId.toString() == senderId.toString())){
                    await DbService.create(COLLECTIONS.MESSAGES, textMessage);
                    resolve();
                }
                reject(new ResponseError("Sender or client is not part of the chat or the chat does not exist", HTTP_STATUS_CODES.BAD_REQUEST));
            }catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    sendFileMessage: (chatId, senderId, base64) => {
        return new Promise(async (resolve, reject) => {
            try {
                const fileMessage = {
                    senderId: senderId,
                    chatId: chatId,
                    message: {
                        file: base64
                    }
                }

                const chat = await DbService.getById(COLLECTIONS.CHATS, chatId);

                if(chat && (chat.trainerId.toString() == senderId.toString() || chat.clientId.toString() == senderId.toString())){
                    await DbService.create(COLLECTIONS.MESSAGES, fileMessage);
                    resolve();
                }
                reject(new ResponseError("Sender or client is not part of the chat or the chat does not exist", HTTP_STATUS_CODES.BAD_REQUEST));
            }catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    }
}   

module.exports = MessagingService;