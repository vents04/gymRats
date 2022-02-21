const { ROOT_URL_PORTAL, AUTHENTICATION_TOKEN_KEY } = require('../global');

const Authentication = {
    getToken: () => {
        const token = localStorage.getItem(`${AUTHENTICATION_TOKEN_KEY}`) || " ";
        return token;
    },
    logout: function () {
        localStorage.removeItem(`${AUTHENTICATION_TOKEN_KEY}`);
        window.location.href = `${ROOT_URL_PORTAL}`;
    }
}

module.exports = Authentication;

