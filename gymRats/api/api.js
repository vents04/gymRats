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
    setTimeout(async function () {
        let tree = {};
        const foods = await DbService.getManyWithSortAndLimit(COLLECTIONS.CALORIES_COUNTER_ITEMS, {}, {}, 500);
        let index = 0;
        for (let food of foods) {
            index++;
            for (let keyword of food.keywords) {
                for (let char = 0; char < keyword.length; char++) {
                    if (tree[keyword[char]] == undefined) {
                        tree[keyword[char]] = {};
                    }
                    let currentNode = tree[keyword[char]];
                    for (let i = char + 1; i < keyword.length; i++) {
                        if (currentNode[keyword[i]] == undefined) {
                            currentNode[keyword[i]] = {};
                        }
                        currentNode = currentNode[keyword[i]];
                    }
                    currentNode.foods = currentNode.foods || [];
                    if (!currentNode.foods.includes(food)) currentNode.foods.push({
                        _id: food._id,
                        searchedTimes: food.searchedTimes,
                        usedTimes: food.usedTimes,
                        keywords: food.keywords
                    });
                }
            }
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
        search(subTree, subFoodIndex);
        const endDt = new Date().getTime();
        console.log(subTreeFoods)
        console.log(subTreeFoods.length, "za", endDt - startDt);
    }, 1500);
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