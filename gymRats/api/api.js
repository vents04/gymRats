const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const cors = require('cors');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');
const path = require("path");

const { PORT, COLLECTIONS, PERSONAL_TRAINER_STATUSES, CALORIES_COUNTER_UNITS } = require('./global');
const DbService = require('./services/db.service');
const MessagingService = require('./services/messaging.service');
const mongoose = require('mongoose');
const Exercise = require('./db/models/logbook/exercise.model');
const CaloriesCounterItem = require('./db/models/caloriesCounter/caloriesCounterItem.model');
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
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.dcode.fr/missing-vowels")

    await page.evaluate(async () => {
        let el = document.querySelector(".css-143z3ww");
        if (el) {
            await el.click();
        }
    })

    const foods = await DbService.getMany(COLLECTIONS.CALORIES_COUNTER_ITEMS, {});
    let counter = 0;
    for await (let food of foods) {
        console.log(parseFloat((counter / 8790) * 100).toFixed(2) + "% passed");
        if (!food.hasPassed) {
            const keywords = food.title.split(/\s|,/);
            keywords.forEach((keyword, index) => {
                if (keyword == "") {
                    keywords.splice(index, 1);
                }
            })
            console.log(keywords);
            for (let index = 0; index < keywords.length; index++) {
                await page.evaluate((keyword) => {
                    let input = document.querySelector("#missing_vowels_solver_word");
                    input.setAttribute("value", keyword)
                }, keywords[index]);

                await page.select('#missing_vowels_solver_dico', 'DICO_EN2')

                await page.click("#body > #center > #forms > #missing_vowels_solver > button");

                let result = null;

                try {
                    await page.waitForSelector("td.result", { visible: true, timeout: 8000 });

                    result = await page.evaluate(() => {
                        let tdResult = document.querySelector("td.result");
                        return tdResult ? tdResult.textContent : null;
                    });
                } catch (e) {
                    console.log(e.message)
                }

                console.log("tukaaa1")
                if (result) {
                    console.log("tukaaaa");
                    result = result.toLowerCase();
                    if (result.toLowerCase() == keywords[index].toLowerCase()) {
                        result = result.charAt(0).toUpperCase() + result.slice(1);
                        if (!result.includes(food.keywords[index])) keywords[index] = result;
                    }
                }
                keywords[index] = keywords[index].toLowerCase();
                food.keywords = keywords;
            }
            await DbService.update(COLLECTIONS.CALORIES_COUNTER_ITEMS, { _id: mongoose.Types.ObjectId(food._id) }, { keywords: food.keywords, hasPassed: true });
        } else {
            console.log("food named " + food.title + " has been passed")
        }
        counter++;
    }
})();

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