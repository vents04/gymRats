const { HTTP_STATUS_CODES, COLLECTIONS, CHAT_STATUSES } = require("../../global");
const DbService = require("../db.service");
const mongoose = require("mongoose");
const ResponseError = require("../../errors/responseError");
const Chat = require('../db/models/messaging/chat.model');
const { chatValidation, messageValidation } = require('../validation/hapi');

const MessagingService = {
    createChat: (trainerId, clientId) => {
        return new Promise(async (resolve, reject) => {
            try {
                
                const trainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, {userId: mongoose.Types.ObjectId(trainerId)});
                const client = await DbService.getOne(COLLECTIONS.CLIENTS, {clientId: mongoose.Types.ObjectId(clientId)});

                if((trainer && client) && client.trainerId.toString() == trainer.userId.toString()){
                    const chat = await DbService.getOne(COLLECTIONS.CHATS, { "$and": [{ trainerId: mongoose.Types.ObjectId(trainerId) }, { clientId: mongoose.Types.ObjectId(clientId) }] });
                    if(!chat){
                        const chat = {
                            trainerId: mongoose.Types.ObjectId(trainerId),
                            clientId: mongoose.Types.ObjectId(clientId)
                        }
                        const { error } = chatValidation(chat);
                        if (error) reject(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

                        await DbService.create(COLLECTIONS.CHATS, chat);
                        resolve();
                    }
                    reject(new ResponseError("There is already a chat between theese people", HTTP_STATUS_CODES.BAD_REQUEST));
                }
                reject(new ResponseError("No relations found", HTTP_STATUS_CODES.NOT_FOUND));

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
                    typeOfMessage: {
                        text: message
                    }
                }
                const { error } = messageValidation(textMessage);
                if (error) reject(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

                const chat = await DbService.getById(COLLECTIONS.CHATS, chatId);

                if(chat && (chat.trainerId == senderId || chat.clientId == senderId)){
                    await DbService.create(COLLECTIONS.MESSAGES, textMessage);
                }
                reject(new ResponseError("Sender is not part of the chat or the chat does not exist", HTTP_STATUS_CODES.BAD_REQUEST));

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
                    typeOfMessage: {
                        file: base64
                    }
                }
                const { error } = messageValidation(textMessage);
                if (error) reject(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

                const chat = await DbService.getById(COLLECTIONS.CHATS, chatId);

                if(chat && (chat.trainerId == senderId || chat.clientId == senderId)){
                    await DbService.create(COLLECTIONS.MESSAGES, fileMessage);
                }
                reject(new ResponseError("Sender is not part of the chat or the chat does not exist", HTTP_STATUS_CODES.BAD_REQUEST));
            }catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    }
}   

module.exports = MessagingService;