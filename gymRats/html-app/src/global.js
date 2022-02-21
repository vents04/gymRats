const URLS = {
    PRODUCTION: {
        API: "https://api.gymrats.uploy.app",
        APP: "https://gymrats.uploy.app"
    },
    DEVELOPMENT: {
        API: "http://localhost:4056",
        APP: "http://localhost:3000"
    }
}

module.exports = {
    ROOT_URL_API: URLS.DEVELOPMENT.API,
    ROOT_URL_PORTAL: URLS.DEVELOPMENT.APP,
    AUTHENTICATION_TOKEN_KEY: "x-auth-token"
}