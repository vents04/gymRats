const URLS = {
    PRODUCTION: {
        API: "",
        APP: ""
    },
    DEVELOPMENT: {
        API: "http://localhost:4056",
        APP: "http://localhost:12000"
    }
}

module.exports = {
    ROOT_URL_API: URLS.DEVELOPMENT.API,
    ROOT_URL_PORTAL: URLS.DEVELOPMENT.APP,
}