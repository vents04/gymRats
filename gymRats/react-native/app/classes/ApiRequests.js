const axios = require('axios');
const Auth = require('./Auth');

const { ROOT_URL_API, AUTHENTICATION_TOKEN_KEY } = require('../../global');
const { Alert } = require('react-native');

const ApiRequests = {
    get: async (path, headers, applyAuthToken) => {
        const finalHeaders = {
            ...headers
        };
        if (applyAuthToken) {
            const token = await Auth.getToken();
            finalHeaders[`${AUTHENTICATION_TOKEN_KEY}`] = token;
        }
        return axios.get(
            `${ROOT_URL_API}/${path}`,
            {
                headers: finalHeaders,
            }
        )
    },

    post: async (path, headers, payload, applyAuthToken) => {
        const finalHeaders = {
            ...headers
        };
        if (applyAuthToken) {
            const token = await Auth.getToken();
            finalHeaders[`${AUTHENTICATION_TOKEN_KEY}`] = token;
        }
        return axios.post(
            `${ROOT_URL_API}/${path}`,
            payload,
            {
                headers: finalHeaders,
            }
        )
    },

    put: async (path, headers, payload, applyAuthToken) => {
        const finalHeaders = {
            ...headers
        };
        if (applyAuthToken) {
            const token = await Auth.getToken();
            finalHeaders[`${AUTHENTICATION_TOKEN_KEY}`] = token;
        }
        return axios.put(
            `${ROOT_URL_API}/${path}`,
            payload,
            {
                headers: finalHeaders
            }
        )
    },

    delete: async (path, headers, applyAuthToken) => {
        const finalHeaders = {
            ...headers
        };
        if (applyAuthToken) {
            const token = await Auth.getToken();
            finalHeaders[`${AUTHENTICATION_TOKEN_KEY}`] = token;
        }
        return axios.delete(
            `${ROOT_URL_API}/${path}`,
            {
                headers: finalHeaders
            }
        )
    },

    showInternalServerError: () => {
        Alert.alert(
            "Error",
            "An internal server error occurred while executing your request. Please try again or message our Support if the problem remains unresolved.",
            [
                { text: "OK" }
            ]
        );
    },

    showNoResponseError: () => {
        Alert.alert(
            "Error",
            "Our server did not send a response for your request. Please try again or message our Support if the problem remains unresolved.",
            [
                { text: "OK" }
            ]
        );
    },

    showRequestSettingError: () => {
        Alert.alert(
            "Error",
            "Something failed while sending your request. Please try again or message our Support if the problem remains unresolved.",
            [
                { text: "OK" }
            ]
        );
    }
}

module.exports = ApiRequests;