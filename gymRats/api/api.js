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

const { PORT, HTTP_STATUS_CODES, COLLECTIONS, FOOD_TYPES, PROGRESS_NOTATION, LOGBOOK_PROGRESS_NOTATIONS, CHAT_STATUSES, SUPPORTED_LANGUAGES } = require('./global');
const MessagingService = require('./services/messaging.service');
const ResponseError = require('./errors/responseError');
const DbService = require('./services/db.service');
const WeightTrackerService = require('./services/cards/weightTracker.service');
const LogbookService = require('./services/cards/logbook.service');
const oneRepMax = require('./helperFunctions/oneRepMax');
const { NotificationsService, Notification } = require('./services/notifications.service');
const UserService = require('./services/user.service');
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
    const cut = [
        [
            [74, 10],
            [70, 10],
            [64, 12]
        ],
        [
            [74, 9],
            [70, 10],
            [64, 11]
        ],
        [
            [74, 9],
            [70, 10],
            [64, 11]
        ],
        [
            [74, 10],
            [70, 10],
            [64, 11],
        ],
        [
            [74, 8],
            [70, 8],
            [64, 11]
        ],
        [
            [74, 5],
            [70, 8],
            [64, 12]
        ],
        [
            [74, 7],
            [70, 8],
            [64, 10]
        ],
        [
            [74, 8],
            [70, 10],
            [64, 12]
        ],
        [
            [74, 8],
            [70, 10],
            [64, 12]
        ],
        [
            [74, 8],
            [70, 9],
            [64, 10]
        ],
        [
            [74, 8],
            [70, 9],
            [64, 11]
        ],
        [
            [74, 8],
            [70, 9],
            [64, 11]
        ],
        [
            [80, 4],
            [74, 6],
            [64, 12]
        ],
        [
            [80, 4],
            [74, 6],
            [64, 12]
        ],
        [
            [80, 4],
            [74, 7],
            [64, 12]
        ],
        [
            [80, 4],
            [74, 7],
            [64, 12]
        ]
    ]
    const bulk = [
        [
            [72, 8],
            [72, 8],
            [70, 8],
            [70, 8]
        ],
        [
            [76, 7],
            [76, 7],
            [70, 8],
            [70, 8]
        ],
        [
            [74, 7],
            [74, 6],
            [70, 7],
            [70, 6]
        ],
        [
            [72, 9],
            [72, 9],
            [70, 9],
            [70, 9]
        ],
        [
            [72, 7],
            [72, 7],
            [70, 8],
            [70, 8]
        ],
        [
            [72, 10],
            [72, 9],
            [70, 9],
            [70, 9]
        ],
        [
            [76, 8],
            [76, 8],
            [70, 9],
        ],
        [
            [80, 6],
            [72, 9],
            [72, 7],
        ],
        [
            [70, 11],
            [70, 11],
            [70, 7]
        ]
    ]
    console.log("--------------------------------------------");
    let cutOrms = [];
    let bulkOrms = [];
    for (let session of cut) {
        let orm = 0;
        for (let set of session) {
            if (oneRepMax(set[0], set[1]) > orm) orm = parseFloat(parseFloat(oneRepMax(set[0], set[1])).toFixed(1));
        }
        cutOrms.push(orm);
    }
    for (let session of bulk) {
        let orm = 0;
        for (let set of session) {
            if (oneRepMax(set[0], set[1]) > orm) orm = parseFloat(parseFloat(oneRepMax(set[0], set[1])).toFixed(1));
        }
        bulkOrms.push(orm);
    }
    console.log("CUT ORMS:")
    console.log(cutOrms);
    for (let index = 0; index < cutOrms.length; index++) {
        if (index + 1 < cutOrms.length) {
            const percentageDifference = parseFloat(parseFloat((cutOrms[index + 1] - cutOrms[index]) / cutOrms[index] * 100).toFixed(2));
        }
    }
    console.log("BULK ORMS:")
    console.log(bulkOrms);
    for (let index = 0; index < bulkOrms.length; index++) {
        try {
            if (index + 1 < bulkOrms.length) {
                const percentageDifference = parseFloat(parseFloat((bulkOrms[index + 1] - bulkOrms[index]) / bulkOrms[index] * 100).toFixed(2));
            }
        } catch (err) {
            console.log(err);
        }
    }
    console.log("From last session:", await LogbookService.getProgressNotationForOneSession([88.8, 96]))
    console.log("From five sessions:", await LogbookService.getProgressNotationForFiveSessions(bulkOrms));
    console.log("Exercises progress:", await LogbookService.getExercisesProgress("622f8c4095e0bf7c3998ebc9"))
    await UserService.generateUnverifiedTimeouts();

})();

io.on("connection", (socket) => {
    socket.on("join-chats-room", async (payload) => {
        try {
            const chats = await DbService.getMany(COLLECTIONS.CHATS, { "$or": [{ personalTrainerId: mongoose.Types.ObjectId(payload.userId) }, { clientId: mongoose.Types.ObjectId(payload.userId) }] })
            for (let chat of chats) {
                socket.join(chat._id.toString())
            }
        } catch (err) {
            reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            socket.disconnect();
        }
    })

    socket.on("send-text-message", async (messageInfo) => {
        try {
            await MessagingService.sendTextMessage(messageInfo.messageInfo.chatId, messageInfo.messageInfo.senderId, messageInfo.messageInfo.message);
            socket.to(messageInfo.chatId).emit("receive-message", { messageInfo, fileType: "text" });
            /*(async function () {
                const chat = await DbService.getById(COLLECTIONS.CHATS, chatId);
                if (chat.status == CHAT_STATUSES.ACTIVE) {
                    let oppositeUser = null;
                    let senderUser = null;
                    if (chat.clientId.toString() == messageInfo.messageInfo.senderId.toString()) {
                        let personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId);
                        if (personalTrainer) oppositeUser = await DbService.getById(COLLECTIONS.USERS, personalTrainer.userId);
                    } else {
                        oppositeUser = await DbService.getById(COLLECTIONS.USERS, chat.clientId);
                    }
                    if (chat.clientId.toString() == messageInfo.messageInfo.senderId.toString()) {
                        senderUser = await DbService.getById(COLLECTIONS.USERS, chat.clientId);
                    } else {
                        let personalTrainer = await DbService.getById(COLLECTIONS.PERSONAL_TRAINERS, chat.personalTrainerId);
                        if (personalTrainer) senderUser = await DbService.getById(COLLECTIONS.USERS, personalTrainer.userId);
                    }
                    if (oppositeUser) {
                        const expoPushTokens = await NotificationsService.getExpoPushTokensByUserId(senderUser._id);
                        console.log("eto gi", expoPushTokens, senderUser.firstName);
                        for (let expoPushToken of expoPushTokens) {
                            await NotificationsService.sendChatNotification(expoPushToken, {
                                title: "Message from " + senderUser.firstName,
                                body: messageInfo.messageInfo.message,
                                data: { chatId }
                            });
                        }
                    }
                }
            })();*/
        } catch (err) {
            console.log(err);
        }
    });

    socket.on("send-file-message", async (messageInfo) => {
        try {
            console.log(messageInfo.messageInfo.senderId, messageInfo.messageInfo.base64.length)
            await MessagingService.sendFileMessage(messageInfo.chatId, messageInfo.messageInfo.senderId, messageInfo.messageInfo.base64, messageInfo.messageInfo.name, messageInfo.messageInfo.size, messageInfo.messageInfo.mimeType);
            socket.to(messageInfo.chatId).emit("receive-message", { messageInfo, fileType: "file" });
            console.log("izpratih receive message")
        } catch (err) {
            console.log(err);
        }
    });

    socket.on("update-last-message", (payload) => {
        socket.to(payload.chatId).emit("last-message-to-be-updated", {})
    })
});

httpServer.listen(PORT, function () {
    console.log("API server listening on port " + PORT)
});