const { Expo } = require('expo-server-sdk');
const mongoose = require('mongoose')
const { COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');
const DbService = require('./db.service');

let expo = new Expo();

let chatTimeouts = [];

const MAX_NOTIFICATION_DATA_SIZE_IN_BYTES = 4096;

const NOTIFICATION_PRIORITIES = {
    "DEFAULT": 'default',
    "NORMAL": 'normal',
    "HIGH": 'high'
}

class Notification {
    constructor(to, data, title, body, ttl, expiration, priority, subtitle, sound, badge, channelId, categoryId, mutableContent) {
        if (typeof to !== "string" && !Array.isArray(to)) throw new Error("Notification to should be a string<ExpoPushToken> or an array of strings<ExpoPushToken>]");
        if (typeof to === "string" && !Expo.isExpoPushToken(to)) throw new Error("Notification to should be a string<ExpoPushToken>");
        if (Array.isArray(to) && !this.checkIfArrayOfStringsIsArrayOfValidExpoPushTokens(to)) throw new Error("Notification to[" + i + "] should be a string<ExpoPushToken>");
        if (Object.prototype.toString.call(data) !== '[object Object]') throw new Error("Notification data should be a valid JSON object");
        if (this.getDataByteSize(data) >= MAX_NOTIFICATION_DATA_SIZE_IN_BYTES) throw new Error("Notification data should be less than " + MAX_NOTIFICATION_DATA_SIZE_IN_BYTES + " bytes");
        if (typeof title !== "string") throw new Error("Notification title should be a string");
        if (typeof body !== "string") throw new Error("Notification body should be a string");
        if (typeof ttl !== "undefined" && typeof ttl !== "number") throw new Error("Notification ttl should be a number or undefined");
        if (typeof expiration !== "undefined" && typeof expiration !== "number") throw new Error("Notification expiration should be a number or undefined");
        if (typeof priority !== "string" || !Object.values(NOTIFICATION_PRIORITIES).includes(priority)) throw new Error("Notification priority should be a string<" + Object.values(NOTIFICATION_PRIORITIES) + ">");
        if (typeof subtitle !== "string") throw new Error("Notification subtitle should be a string");
        if (typeof sound !== "string" && sound !== null) throw new Error("Notification sound should be a string<default> or null");
        if (typeof sound === "string" && sound != "default") throw new Error("Notification sound should be a string<default> or null")
        if (typeof badge !== "number") throw new Error("Notification badge should be a number");
        if (typeof channelId !== "string") throw new Error("Notification channelId should be a string");
        if (typeof categoryId !== "string") throw new Error("Notification categoryId should be a string");
        if (typeof mutableContent !== "boolean") throw new Error("Notification mutableContent should be a boolean");

        this.to = to;
        this.data = data;
        this.title = title;
        this.body = body;
        this.ttl = ttl;
        this.expiration = expiration;
        this.priority = priority;
        this.subtitle = subtitle;
        this.sound = sound;
        this.badge = badge;
        this.channelId = channelId;
        this.categoryId = categoryId;
        this.mutableContent = mutableContent;
    }

    getDataByteSize(data) {
        const size = new TextEncoder().encode(JSON.stringify(data)).length
        return size;
    }

    checkIfArrayOfStringsIsArrayOfValidExpoPushTokens(tokens) {
        for (let i = 0; i < tokens.length; i++) {
            if (!Expo.isExpoPushToken(tokens[i])) return false;
        }
        return true;
    }
}

const NotificationsService = {
    sendChatNotification: async (to, notificationObject) => {
        if (!Expo.isExpoPushToken(to)) throw new Error("Invalid expo push token");
        for (let chatTimeout of chatTimeouts) {
            if (chatTimeout.to == to) {
                chatTimeout.messages = [{
                    to,
                    ...notificationObject
                }];
                clearTimeout(chatTimeout.timeout);
                chatTimeout.timeout = setTimeout(async () => {
                    for (let chatTimeout of chatTimeouts) {
                        if (chatTimeout.to == to) {
                            let chunks = expo.chunkPushNotifications(chatTimeout.messages);
                            let tickets = [];
                            for (let chunk of chunks) {
                                try {
                                    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                                    console.log(ticketChunk);
                                    tickets.push(...ticketChunk);
                                } catch (error) {
                                    throw new Error(error);
                                }
                            }
                        }
                    }
                }, 60000)
                return;
            }
        }
        chatTimeouts.push({
            to,
            messages: [{
                to,
                ...notificationObject
            }],
            timeout: setTimeout(async () => {
                for (let chatTimeout of chatTimeouts) {
                    if (chatTimeout.to == to) {
                        let chunks = expo.chunkPushNotifications(chatTimeout.messages);
                        let tickets = [];
                        for (let chunk of chunks) {
                            try {
                                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                                console.log(ticketChunk);
                                tickets.push(...ticketChunk);
                            } catch (error) {
                                throw new Error(error);
                            }
                        }
                    }
                }
            }, 60000)
        })
    },

    getExpoPushTokensByUserId: async (userId) => {
        const user = await DbService.getById(COLLECTIONS.USERS, userId);
        if (!user) throw new Error("User not found");

        let expoPushTokens = [];

        const devices = await DbService.getMany(COLLECTIONS.DEVICES, { userId: mongoose.Types.ObjectId(userId), isActive: true });
        for (let device of devices) expoPushTokens.push(device.expoPushNotificationsToken);

        return expoPushTokens;
    },

    constructNotification: (data) => {
        try {
            console.log(...data)
            const notification = new Notification(...data);
            if (!notification) throw new Error("Notification object could not be constructed");
            return notification;
        } catch (err) {
            console.log(err);
            throw new Error(err.message);
        }
    },

    sendNotification: (notification) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (!notification instanceof Notification) throw new Error("Notification object is not an instance of Notification");
                const ticket = await expo.sendPushNotificationsAsync([notification]);
                resolve(ticket);
            } catch (err) {
                throw new Error(err.message || DEFAULT_ERROR_MESSAGE);
            }
        })
    }
}

module.exports = { NotificationsService, Notification };