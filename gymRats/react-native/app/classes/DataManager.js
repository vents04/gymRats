import ApiRequests from './ApiRequests';

const dateCardsSubscriptions = {};

const DataManager = {
    subscribeForDateCards: function (date, onData, onError) {
        const time = date.getTime();
        let info = dateCardsSubscriptions[time];
        if (!info) {
            info = {
                date: date,
                data: undefined,
                list: []
            };
            dateCardsSubscriptions[time] = info;
        }
        const subscription = {
            onData: onData,
            onError: onError
        };
        info.list.push(subscription);
        if (info.data) {
            if (subscription.onData) subscription.onData(info.data);
        }
        else {
            DataManager.loadDateCards(date);
        }
    },
    unsubscribeForDateCards: function (subscription) {
        const time = subscription.date.getTime();
        let info = dateCardsSubscriptions[time];
        if (info) {
            const i = info.list.indexOf(subscription);
            if (i >= 0) info.list.splice(i, 1);
            if (info.list.length === 0) {
                delete dateCardsSubscriptions[time];
            }
        }
    },
    onDateCardChanged: function (date) {
        console.log("DATATA 2", date);
        const time = date.getTime();
        let info = dateCardsSubscriptions[time];
        console.log("DATATA 3", info);
        console.log(info);
        if (info) {
            DataManager.loadDateCards(date);
        }
    },
    loadDateCards: function (selectedDate) {
        ApiRequests.get(`date?date=${selectedDate.getDate()}&month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}`, false, true).then((response) => {
            console.log(response.data)
            const time = selectedDate.getTime();
            let info = dateCardsSubscriptions[time];
            if (info) {
                info.data = response.data;
                let list = [...info.list];
                for (const item of list) {
                    if (item.onData) {
                        try {
                            item.onData(info.data);
                        } catch (e) {
                        }
                    }
                }
            }
        }).catch((error) => {
            const time = selectedDate.getTime();
            let info = dateCardsSubscriptions[time];
            if (info) {
                info.data = undefined;
                let list = [...info.list];
                for (const item of list) {
                    if (item.onError) {
                        try {
                            item.onError(error);
                        } catch (e) {
                        }
                    }
                }
            }
        });
    }
}

module.exports.DataManager = DataManager;