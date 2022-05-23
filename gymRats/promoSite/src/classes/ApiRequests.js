const axios = require('axios');

const { ROOT_URL_API } = require('../global');

const ApiRequests = {
    get: (path, headers) => {
        const finalHeaders = {
            ...headers
        };
        return axios.get(
            `${ROOT_URL_API}/${path}`,
            {
                headers: finalHeaders,
            }
        )
    },

    post: (path, headers, payload) => {
        const finalHeaders = {
            ...headers
        };
        return axios.post(
            `${ROOT_URL_API}/${path}`,
            payload,
            {
                headers: finalHeaders,
            }
        )
    },

    put: (path, headers, payload) => {
        const finalHeaders = {
            ...headers
        };
        return axios.put(
            `${ROOT_URL_API}/${path}`,
            payload,
            {
                headers: finalHeaders
            }
        )
    },

    delete: (path, headers) => {
        const finalHeaders = {
            ...headers
        };
        return axios.delete(
            `${ROOT_URL_API}/${path}`,
            {
                headers: finalHeaders
            }
        )
    }
}

module.exports = ApiRequests;