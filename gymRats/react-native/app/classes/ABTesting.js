const { default: AsyncStorage } = require('@react-native-async-storage/async-storage');

const campaigns = {
    "calendarActionButton": ["3buttons", "1button"]
}

const ABTesting = {
    assignBucketByCampaign: (campaign) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (!(campaign in campaigns)) reject("Campaign does not exist");
                const bucket = campaigns.calendarActionButton[Math.floor(Math.random() * campaigns.calendarActionButton.length)];
                await AsyncStorage.setItem(`@gymRats:${campaign}`, bucket);
            } catch (e) {
                reject(e);
            }
        })
    },

    getBucketByCampaign: (campaign) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(campaign);
                const bucket = await AsyncStorage.getItem(`@gymRats:${campaign}`);
                resolve(bucket)
            } catch (e) {
                reject(e);
            }
        })
    },

    removeBucketByCampaign: (campaign) => {
        return new Promise(async (resolve, reject) => {
            try {
                await AsyncStorage.removeItem(`@gymRats:${campaign}`);
                resolve();
            } catch (e) {
                reject(e);
            }
        })
    }
}

module.exports = { ABTesting, campaigns };