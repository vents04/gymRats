const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const cors = require('cors');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');

const { PORT, HTTP_STATUS_CODES } = require('./global');
const MessagingService = require('./services/messaging.service');
const ResponseError = require('./errors/responseError');
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

io.on("connection", (socket) => {
    socket.on("join-chat", (payload) => {
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

    socket.on("update-last-message", () => {
        console.log("here")
        socket.emit("last-message-to-be-updated", {})
    })

});

httpServer.listen(PORT, function () {
    console.log("API server listening on port " + PORT)
});