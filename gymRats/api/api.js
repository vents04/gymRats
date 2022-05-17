const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const cors = require('cors');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');
const mongoose = require('mongoose');

const { PORT, HTTP_STATUS_CODES, COLLECTIONS, FOOD_TYPES, PROGRESS_NOTATION, LOGBOOK_PROGRESS_NOTATIONS } = require('./global');
const MessagingService = require('./services/messaging.service');
const ResponseError = require('./errors/responseError');
const DbService = require('./services/db.service');
const WeightTrackerService = require('./services/cards/weightTracker.service');
const LogbookService = require('./services/cards/logbook.service');
const oneRepMax = require('./helperFunctions/oneRepMax');
const io = require("socket.io")(httpServer, { cors: { origin: "*" } });

app
    .use(cors())
    .use(express.json({
        limit: '50mb'
    }))
    .use(express.urlencoded({ extended: true, limit: '50mb' }))
    .use("/", indexRoute)
    .use(errorHandler);

mongo.connect();

(async function () {
    /*
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
    let sessionOrms = [];
    const sessions = await DbService.getMany(COLLECTIONS.WORKOUT_SESSIONS, { userId: mongoose.Types.ObjectId("622f8c4095e0bf7c3998ebc9") });
    for(let session of sessions) {
        let orm = 0;
        for (let set of session) {
            if (oneRepMax(set[0], set[1]) > orm) orm = parseFloat(parseFloat(oneRepMax(set[0], set[1])).toFixed(1));
        }
        sessionOrms.push(orm);
    }
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
            console.log("Percentage difference between " + cutOrms[index] + " and " + cutOrms[index + 1] + " is: " + percentageDifference);
        }
    }
    console.log("BULK ORMS:")
    console.log(bulkOrms);
    for (let index = 0; index < bulkOrms.length; index++) {
        try {
            if (index + 1 < bulkOrms.length) {
                const percentageDifference = parseFloat(parseFloat((bulkOrms[index + 1] - bulkOrms[index]) / bulkOrms[index] * 100).toFixed(2));
                console.log("Percentage difference between " + bulkOrms[index] + " and " + bulkOrms[index + 1] + " is: " + percentageDifference);
            }
        } catch (err) {
            console.log(err);
        }
    }
    console.log(bulkOrms[3], bulkOrms[4], bulkOrms[5]);
    console.log(await LogbookService.getExerciseProgressNotation(bulkOrms.splice(3, 3)))
    */
    const weights = await DbService.getMany(COLLECTIONS.DAILY_WEIGHTS, { userId: mongoose.Types.ObjectId("622f8c4095e0bf7c3998ebc9") });
    for (let weight of weights) {

    }
})();

io.on("connection", (socket) => {
    socket.on("join-chat-room", (payload) => {

        try {
            const chatId = payload.chatId;

            socket.join(chatId);

            socket.on("send-text-message", async (messageInfo) => {
                await MessagingService.sendTextMessage(chatId, messageInfo.messageInfo.senderId, messageInfo.messageInfo.message);
                socket.to(chatId).emit("receive-text-message", {});
            });

            socket.on("send-file-message", async (messageInfo) => {
                await MessagingService.sendFileMessage(chatId, messageInfo.senderId, messageInfo.base64);
                socket.to(chatId).emit("receive-file-message", {});
            });
        } catch (err) {
            reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            socket.disconnect();
        }
    })

    socket.on("join-chats-room", () => {
        console.log("joined chats room")
    })

    socket.on("update-last-message", () => {
        console.log("here")
        socket.emit("last-message-to-be-updated", {})
    })

});

httpServer.listen(PORT, function () {
    console.log("API server listening on port " + PORT)
});