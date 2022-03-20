const { HTTP_STATUS_CODES, COLLECTIONS, CHAT_STATUSES } = require("../../global");
const DbService = require("../db.service");
const mongoose = require("mongoose");
const ResponseError = require("../../errors/responseError");
const Chat = require('../db/models/messaging/chat.model');

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
                            clientId: mongoose.Types.ObjectId(clientId),
                            status: CHAT_STATUSES.ACTIVE
                        }
                        await DbService.create(COLLECTIONS.REQUESTS, chat);
                        resolve();
                    }
                    reject(new ResponseError("There is already a chat between theese people", HTTP_STATUS_CODES.BAD_REQUEST));
                }
                reject(new ResponseError("No relations found", HTTP_STATUS_CODES.BAD_REQUEST));

            }catch (err) {
                reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
            

        })
    }
}   

module.exports = MessagingService;