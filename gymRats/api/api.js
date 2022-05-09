const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const cors = require('cors');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');
const path = require("path");

const { PORT, COLLECTIONS, PERSONAL_TRAINER_STATUSES, CALORIES_COUNTER_UNITS, HTTP_STATUS_CODES, FOOD_TYPES } = require('./global');
const DbService = require('./services/db.service');
const MessagingService = require('./services/messaging.service');
const mongoose = require('mongoose');
const Exercise = require('./db/models/logbook/exercise.model');
const CaloriesCounterItem = require('./db/models/caloriesCounter/caloriesCounterItem.model');
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

(async function () {
    const puppeteer = require('puppeteer-extra');
    const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
    puppeteer.use(
        RecaptchaPlugin({
            provider: {
                id: '2captcha',
                token: 'XXXXXXX' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
            },
            visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
        })
    )


    /*
const foods = await DbService.getMany(COLLECTIONS.NEW_FOODS, { title: { "$regex": "null" } });
console.log(foods.length);
for (let food of foods) {
    const foodTitle = food.title.replace(", null", "");
    console.log(food.title);
    console.log(foodTitle);
    await DbService.update(COLLECTIONS.NEW_FOODS, { _id: mongoose.Types.ObjectId(food._id) }, {
        title: foodTitle
    })
}
const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();
await page.goto("https://www.dcode.fr/missing-vowels")

page.on('dialog', async dialog => {
    await dialog.dismiss();
});

await page.evaluate(async () => {
    let el = document.querySelector(".css-143z3ww");
    if (el) {
        await el.click();
    }
})

let valuesMap = {};
const valuesMaps = await DbService.getMany(COLLECTIONS.VALUES_MAPS, {});
for (let value of valuesMaps) {
    valuesMap[value.keyword.toString()] = value.value;
}

let newFoods = [];
const foods = await DbService.getMany(COLLECTIONS.CALORIES_COUNTER_ITEMS, {});
for await (let food of foods) {
    let keywords = food.title.split(/\s|,/).filter(word => word.length > 0);
    let newKeywords = []
    for (let keyword of keywords) {
        newKeywords.push(valuesMap[keyword.toLowerCase()]);
    }
    food._id = mongoose.Types.ObjectId();
    food.title = newKeywords.join(", ");
    food.title = food.title.charAt(0).toUpperCase() + food.title.slice(1);
    food.keywords = newKeywords;
    newFoods.push(food)
}

for (let newFood of newFoods) {
    await DbService.create("newFoods", newFood);
}
    */
})();

app.get("/:itemN", async (req, res, next) => {
    const foods = await DbService.getMany(COLLECTIONS.NEW_FOODS, {});
    if (req.params.itemN > foods.length - 1) {
        return res.status(HTTP_STATUS_CODES.OK).send({ food: null, length: foods.length });
    }
    return res.status(HTTP_STATUS_CODES.OK).send({ food: foods[req.params.itemN - 1], length: foods.length });
})

app.post("/:itemId", async (req, res, next) => {
    let word = await DbService.getById(COLLECTIONS.NEW_FOODS, req.params.itemId);
    if (!word) return next(new ResponseError("Word not found", HTTP_STATUS_CODES.NOT_FOUND));
    await DbService.update(COLLECTIONS.NEW_FOODS, { _id: mongoose.Types.ObjectId(word._id) }, { hasBeenSubmitted: true, title: req.body.title, keywords: req.body.keywords });
    return res.sendStatus(HTTP_STATUS_CODES.OK);
})

app.delete("/:itemId", async (req, res, next) => {
    const word = await DbService.getById(COLLECTIONS.NEW_FOODS, req.params.itemId);
    if (!word) return next(new ResponseError("Word not found", HTTP_STATUS_CODES.NOT_FOUND));
    await DbService.delete(COLLECTIONS.NEW_FOODS, { _id: mongoose.Types.ObjectId(word._id) })
    return res.sendStatus(HTTP_STATUS_CODES.OK);
})

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