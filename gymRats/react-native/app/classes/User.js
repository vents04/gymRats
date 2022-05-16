const { HTTP_STATUS_CODES } = require("../../global");
const ApiRequests = require("./ApiRequests");

const User = {
    validateToken: (token) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await ApiRequests.post('user/validate-token', {}, {}, true);
                resolve(response.data);
            } catch (error) {
                if (error.response) {
                    if (error.response.status == HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                        ApiRequests.showInternalServerError();
                    }
                } else if (error.request) {
                    ApiRequests.showNoResponseError();
                } else {
                    ApiRequests.showRequestSettingError();
                }
                reject();
            }
        })
    }
}

module.exports = User;