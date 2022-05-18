import { DataManager } from './DataManager';

const BackButtonHandler = {
    goToPage: (navigation, page) => {
        navigation.navigate(page);
        return;
    },

    goToPageWithParams: (navigation, page, params) => {
        navigation.navigate(page, params);
        return;
    },

    goToPageWithDataManagerCardUpdate: (navigation, page, date) => {
        DataManager.onDateCardChanged(date);
        navigation.navigate(page);
        return;
    },

    goToPageWithDataManagerCardUpdateAndParams: (navigation, page, date, params) => {
        DataManager.onDateCardChanged(date);
        navigation.navigate(page, params);
        return;
    }
}

module.exports.BackButtonHandler = BackButtonHandler;