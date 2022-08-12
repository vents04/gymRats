const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const cors = require('cors');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const { PORT, HTTP_STATUS_CODES, COLLECTIONS, FOOD_TYPES, PROGRESS_NOTATION, LOGBOOK_PROGRESS_NOTATIONS, CHAT_STATUSES, SUPPORTED_LANGUAGES, WEIGHT_UNITS } = require('./global');
const MessagingService = require('./services/messaging.service');
const ResponseError = require('./errors/responseError');
const DbService = require('./services/db.service');
const WeightTrackerService = require('./services/cards/weightTracker.service');
const LogbookService = require('./services/cards/logbook.service');
const oneRepMax = require('./helperFunctions/oneRepMax');
const { NotificationsService, Notification } = require('./services/notifications.service');
const UserService = require('./services/user.service');
const StatsService = require('./services/stats.service');
const ProgressService = require('./services/cards/progress.service');
const io = require("socket.io")(httpServer, { cors: { origin: "*" }, maxHttpBufferSize: 5e+7 });

app
    .use(cors())
    .use(express.json({
        limit: '100mb'
    }))
    .use((req, res, next) => {
        if (!Object.values(SUPPORTED_LANGUAGES).includes(req.header("lng"))) req.headers.lng = SUPPORTED_LANGUAGES.ENGLISH;
        next();
    })
    .use(express.urlencoded({ extended: true, limit: '50mb' }))
    .use("/", indexRoute)
    .use(errorHandler)
    .use('/ugc', express.static(path.join(__dirname, '/ugc')))

mongo.connect();

(async function () {
    const id = mongoose.Types.ObjectId();
    console.log("sdsd2", ProgressService.returnPercentage(null, null))
})();

const notificationMessages = {
    en: {
        fileMessage: "File message"
    },
    bg: {
        fileMessage: "Файлово съобщение"
    }
}

io.on("connection", (socket) => {
    console.log("connected", socket.id)
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });
    socket.on("join-chats-room", async (payload) => {
        let chats;
        try {
            const trainer = await DbService.getOne(COLLECTIONS.PERSONAL_TRAINERS, { userId: mongoose.Types.ObjectId(payload.userId) })
            if (trainer) {
                chats = await DbService.getMany(COLLECTIONS.CHATS, { "$or": [{ personalTrainerId: mongoose.Types.ObjectId(trainer._id) }, { clientId: mongoose.Types.ObjectId(payload.userId) }] })
            } else {
                chats = await DbService.getMany(COLLECTIONS.CHATS, { clientId: mongoose.Types.ObjectId(payload.userId) })
            }

            for (let chat of chats) {
                let shouldJoin = true;
                socket.rooms.forEach(room => {
                    if (room.toString() === chat._id.toString()) {
                        shouldJoin = false;
                    }
                });

                if (shouldJoin) {
                    socket.join(chat._id.toString());
                }
            }
        } catch (err) {
            reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            socket.disconnect();
        }
    })

    socket.on("send-text-message", async (messageInfo) => {
        try {
            const message = await MessagingService.sendTextMessage(messageInfo.messageInfo.chatId, messageInfo.messageInfo.senderId, messageInfo.messageInfo.message);
            console.log(io.sockets.adapter.rooms)
            io.to(messageInfo.messageInfo.chatId).emit("receive-message", { message });
            console.log("mina")
            io.to(messageInfo.messageInfo.chatId).emit("update-last-message", { message });
            (async function () {
                const chat = await DbService.getById(COLLECTIONS.CHATS, messageInfo.messageInfo.chatId);
                if (chat.status == CHAT_STATUSES.ACTIVE) {
                    let oppositeUser = null;
                    let senderUser = null;
                    if (chat.clientId.toString() == messageInfo.messageInfo.senderId.toString()) {
                        let personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId);
                        if (personalTrainer) {
                            oppositeUser = await DbService.getById(COLLECTIONS.USERS, personalTrainer.userId);
                            senderUser = await DbService.getById(COLLECTIONS.USERS, chat.clientId);
                        }
                    } else {
                        oppositeUser = await DbService.getById(COLLECTIONS.USERS, chat.clientId);
                        let personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId);
                        if (personalTrainer) {
                            senderUser = await DbService.getById(COLLECTIONS.USERS, personalTrainer.userId);
                        }
                    }
                    if (oppositeUser && senderUser) {
                        const expoPushTokens = await NotificationsService.getExpoPushTokensByUserId(oppositeUser._id);
                        console.log("eto gi", expoPushTokens, oppositeUser.firstName);
                        for (let expoPushToken of expoPushTokens) {
                            if (expoPushToken) {
                                await NotificationsService.sendChatNotification(expoPushToken, {
                                    title: senderUser.firstName,
                                    body: messageInfo.messageInfo.message,
                                    data: { chatId: messageInfo.messageInfo.chatId }
                                });
                            }
                        }
                    }
                }
            })();
        } catch (err) {
            console.log(err);
        }
    });

    socket.on("send-file-message", async (messageInfo) => {
        try {
            const message = await MessagingService.sendFileMessage(messageInfo.messageInfo.chatId, messageInfo.messageInfo.senderId, messageInfo.messageInfo.base64, messageInfo.messageInfo.name, messageInfo.messageInfo.size, messageInfo.messageInfo.mimeType);
            io.to(messageInfo.messageInfo.chatId).emit("receive-message", { message });
            io.to(messageInfo.messageInfo.chatId).emit("update-last-message", { message });
            (async function () {
                const chat = await DbService.getById(COLLECTIONS.CHATS, messageInfo.messageInfo.chatId);
                if (chat.status == CHAT_STATUSES.ACTIVE) {
                    let oppositeUser = null;
                    let senderUser = null;
                    if (chat.clientId.toString() == messageInfo.messageInfo.senderId.toString()) {
                        let personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId);
                        if (personalTrainer) {
                            oppositeUser = await DbService.getById(COLLECTIONS.USERS, personalTrainer.userId);
                            senderUser = await DbService.getById(COLLECTIONS.USERS, chat.clientId);
                        }
                    } else {
                        oppositeUser = await DbService.getById(COLLECTIONS.USERS, chat.clientId);
                        let personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId);
                        if (personalTrainer) {
                            senderUser = await DbService.getById(COLLECTIONS.USERS, personalTrainer.userId);
                        }
                    }
                    if (oppositeUser && senderUser) {
                        const expoPushTokens = await NotificationsService.getExpoPushTokensByUserId(oppositeUser._id);
                        console.log("eto gi", expoPushTokens, oppositeUser.firstName);
                        for (let expoPushToken of expoPushTokens) {
                            if (expoPushToken) {
                                await NotificationsService.sendChatNotification(expoPushToken, {
                                    title: senderUser.firstName,
                                    body: oppositeUser.language && Object.values(SUPPORTED_LANGUAGES).includes(oppositeUser.language)
                                        ? notificationMessages[oppositeUser.language].fileMessage
                                        : notificationMessages[SUPPORTED_LANGUAGES.ENGLISH].fileMessage,
                                    data: { chatId: messageInfo.messageInfo.chatId }
                                });
                            }
                        }
                    }
                }
            })();
        } catch (err) {
            console.log(err);
        }
    });

    socket.on('disconnectUser', function () {
        console.log("disconnected", socket.id)
        socket.disconnect();

    });
});

httpServer.listen(PORT, function () {
    console.log("API server listening on port " + PORT)
});