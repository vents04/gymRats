const { Expo } = require('expo-server-sdk');
const mongoose = require('mongoose')
const { COLLECTIONS } = require('../global');
const DbService = require('./db.service');

let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

let chatTimeouts = [];

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
                }, 5000)
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
            }, 5000)
        })
    },

    getExpoPushTokensByUserId: async (userId) => {
        const user = await DbService.getById(COLLECTIONS.USERS, userId);
        if (!user) throw new Error("User not found");

        let expoPushTokens = [];

        const devices = await DbService.getMany(COLLECTIONS.DEVICES, { userId: mongoose.Types.ObjectId(userId), isActive: true });
        for (let device of devices) expoPushTokens.push(device.expoPushNotificationsToken);

        return expoPushTokens;
    }
}

module.exports = NotificationsService;