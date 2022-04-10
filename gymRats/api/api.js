const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const options = {};
const router = express.Router();
const cors = require('cors');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');

const { PORT, COLLECTIONS } = require('./global');
const DbService = require('./services/db.service');
const MessagingService = require('./services/messaging.service');
const mongoose = require('mongoose');
const { authenticate } = require('./middlewares/authenticate');
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

var now = new Date();
for (var d = new Date(1970, 0, 1); d <= now; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    if (date.getFullYear() * 1000 + date.getMonth() * 100 + date.getDate() * 10 == 202230) {
        console.log(date);
    }
}

(async function () {
    const users = await DbService.getMany(COLLECTIONS.USERS, {});
    for (let user of users) {
        await DbService.update(COLLECTIONS.USERS, { _id: mongoose.Types.ObjectId(user._id) }, {
            weightUnit: "KILOGRAMS",
            verifiedEmail: false
        });
    }
})();

io.on("connection", (socket) => {
    //console.log("connection established", socket.id);
    socket.on("join-chat", (payload) => {
        try{
            const chatId = payload.chatId;

            socket.join(chatId);
            //console.log(socket.id , " is now connected to the chat")

            socket.on("send-text-message", async (messageInfo) => {
                await MessagingService.sendTextMessage(chatId, messageInfo.messageInfo.senderId, messageInfo.messageInfo.message);
                socket.to(chatId).emit("receive-text-message", {});
            });

            socket.on("send-file-message", async (messageInfo) => {
                await MessagingService.sendFileMessage(chatId, messageInfo.senderId, messageInfo.base64);
                socket.to(chatId).emit("receive-file-message", {});
            });
        }catch (err) {
            reject(new ResponseError("Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            socket.disconnect();
        }
    })

    socket.on("update-last-message", () => {
        console.log("here")
        socket.emit("last-message-to-be-updated", {})  
    })

});

httpServer.listen(PORT, function () {
    console.log("API server listening on port " + PORT)
})