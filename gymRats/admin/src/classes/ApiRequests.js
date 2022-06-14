import axios from 'axios';

import { ROOT_URL_API, AUTHENTICATION_TOKEN_KEY } from '../global';
import Auth from './Auth';

const ApiRequests = {
    get: (path, headers, applyAuthToken) => {
        const finalHeaders = {
            ...headers,
        };
        if (applyAuthToken) {
            const token = Auth.getToken();
            finalHeaders[`${AUTHENTICATION_TOKEN_KEY}`] = token;
        }
        return axios.get(
            `${ROOT_URL_API}/${path}`,
            {
                headers: finalHeaders,
            }
        )
    },

    post: (path, headers, payload, applyAuthToken) => {
        const finalHeaders = {
            ...headers,
        };
        if (applyAuthToken) {
            const token = Auth.getToken();
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

    put: (path, headers, payload, applyAuthToken) => {
        const finalHeaders = {
            ...headers,
        };
        if (applyAuthToken) {
            const token = Auth.getToken();
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

    delete: (path, headers, applyAuthToken) => {
        const finalHeaders = {
            ...headers,
        };
        if (applyAuthToken) {
            const token = Auth.getToken();
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
        alert("Internal server error");
    },

    showNoResponseError: () => {
        alert("No response from server");
    },

    showRequestSettingError: () => {
        alert("Request settings are not correct");
    }
}

export default ApiRequests;
