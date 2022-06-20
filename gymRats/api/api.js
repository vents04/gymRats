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

/*(async function () {
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
        const stringifiedTree = JSON.stringify(tree);
        //fs.writeFileSync(path.join(__dirname, './foodTree.json'), stringifiedTree);
        const startDt = new Date().getTime();
        const query = "s";
        let subTree = {};
        if (tree[query.charAt(0)]) {
            subTree = tree;
            for (let char = 0; char < query.length; char++) {
                subTree = subTree[query.charAt(char)] || {};
            }
        }
        // recursively search for foods in subTree binary tree
        const subTreeFoods = {};
        let arrayLength = 0;
        Object.values(subTreeFoods).map((el) => arrayLength += el.length)
        console.log(arrayLength)
        let subFoodIndex = 0;
        const search = function (node, subFoodIndex) {
            let arrayLength = 0;
            Object.values(subTreeFoods).map((el) => arrayLength += el.length)
            if (arrayLength < 40) {
                if (node.foods) {
                    if (!subTreeFoods.hasOwnProperty(subFoodIndex)) subTreeFoods[subFoodIndex] = [];
                    subTreeFoods[subFoodIndex].push(...node.foods)
                }
                for (let key in node) {
                    if (key != "foods") {
                        search(node[key], subFoodIndex + 1);
                    }
                }
            }
        }
    }
    console.log("From last session:", await LogbookService.getProgressNotationForOneSession([88.8, 96]))
    console.log("From five sessions:", await LogbookService.getProgressNotationForFiveSessions(bulkOrms));
    console.log("Exercises progress:", await LogbookService.getExercisesProgress("622f8c4095e0bf7c3998ebc9"))
    await UserService.generateUnverifiedTimeouts();

})();*/



/*(async function () {
    const trainers = await DbService.getMany(COLLECTIONS.PERSONAL_TRAINERS, {});
    for (let trainer of trainers) {
        const user = await DbService.getOne(COLLECTIONS.USERS, { "$or": [{ _id: mongoose.Types.ObjectId(trainer.userId) }, { _id: trainer.userId }] });
        if (user) {
            await DbService.update(COLLECTIONS.PERSONAL_TRAINERS, { _id: mongoose.Types.ObjectId(trainer._id) }, { firstName: user.firstName, lastName: user.lastName });
        }
    }
})();*/

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