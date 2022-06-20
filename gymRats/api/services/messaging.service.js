const { HTTP_STATUS_CODES, COLLECTIONS, RELATION_STATUSES, NODE_ENVIRONMENT, NODE_ENVIRONMENTS } = require("../global");
const DbService = require('../services/db.service');
const mongoose = require("mongoose");
const ResponseError = require('../errors/responseError');
const Chat = require('../db/models/messaging/chat.model');
const Message = require('../db/models/messaging/message.model');
const fs = require('fs');
const { uuid } = require('uuidv4');
const mime = require('mime-types')

const MessagingService = {
    createChat: (personalTrainerId, clientId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const chat1 = await DbService.getOne(COLLECTIONS.CHATS, {personalTrainerId: mongoose.Types.ObjectId(personalTrainerId), clientId: mongoose.Types.ObjectId(clientId) });
                let chat2 = null
                if (!chat1) {
                    
                    const personalTrainer2 = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(clientId) })
                    const personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, personalTrainerId)
                    if(personalTrainer2){
                        chat2 = await DbService.getOne(COLLECTIONS.CHATS, {personalTrainerId: mongoose.Types.ObjectId(personalTrainer2._id), clientId: mongoose.Types.ObjectId(personalTrainer.userId)})
                    }

                    if(!chat2){
                        const chat = new Chat({
                            personalTrainerId: mongoose.Types.ObjectId(personalTrainerId),
                            clientId: mongoose.Types.ObjectId(clientId)
                        })
                        await DbService.create(COLLECTIONS.CHATS, chat);
                    }
                }
                resolve();
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
                resolve(textMessage);
            } catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    sendFileMessage: (chatId, senderId, base64, name, size, mimeType) => {
        return new Promise(async (resolve, reject) => {
            try {
                const fileName = uuid();
                const fileContents = new Buffer.from(base64, 'base64')
                const nameSplitted = name.split(".");
                const extension = mime.extension(mimeType);
                console.log(__dirname)
                console.log(NODE_ENVIRONMENT == NODE_ENVIRONMENTS.PRODUCTION
                    ? __dirname + "/../ugc/" + fileName + "." + extension
                    : __dirname + "\\..\\ugc\\" + fileName + "." + extension);


                fs.writeFileSync(NODE_ENVIRONMENT == NODE_ENVIRONMENTS.PRODUCTION
                    ? __dirname + "/../ugc/" + fileName + "." + extension
                    : __dirname + "\\..\\ugc\\" + fileName + "." + extension, fileContents);
                //fs.writeFileSync("/../ugc/" + fileName + "." + extension, fileContents);
                const fileMessage = new Message({
                    senderId: mongoose.Types.ObjectId(senderId),
                    chatId: mongoose.Types.ObjectId(chatId),
                    message: {
                        file: {
                            name: fileName,
                            mimeType,
                            size,
                            originalName: name,
                            extension
                        }
                    }
                })

                const chat = await DbService.getById(COLLECTIONS.CHATS, chatId);

                const personalTrainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(senderId) })

                if (chat && ((personalTrainer && (personalTrainer._id.toString() != chat.personalTrainerId.toString())) && senderId.toString() != chat.clientId.toString())) {
                    reject(new ResponseError("Trainer or client is not part of the chat or the chat does not exist", HTTP_STATUS_CODES.BAD_REQUEST));
                }
                await DbService.create(COLLECTIONS.MESSAGES, fileMessage);
                resolve(fileMessage);
            } catch (err) {
                console.log(err)
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    }
}

module.exports = MessagingService;