import { AUTHENTICATION_TOKEN_KEY } from '../global';

const Auth = {
    setToken: (token) => {
        localStorage.setItem(AUTHENTICATION_TOKEN_KEY, token);
    },

    getToken: () => {
        return localStorage.getItem(AUTHENTICATION_TOKEN_KEY);
    },

    removeToken: () => {
        return localStorage.removeItem(AUTHENTICATION_TOKEN_KEY);
    }
}

export default Auth;