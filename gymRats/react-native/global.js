const AUTHENTICATION_TOKEN_KEY = "x-auth-token";

const ROOT_URL_API = "http://192.168.0.184:4056";

const HTTP_STATUS_CODES = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}

const CALORIES_COUNTER_MEALS = {
    BREAKFAST: "BREAKFAST",
    LUNCH: "LUNCH",
    DINNER: "DINNER",
    SNACKS: "SNACKS",
}

const CALORIES_COUNTER_SCREEN_INTENTS = {
    ADD: "ADD",
    UPDATE: "UPDATE",
}

module.exports = {
    AUTHENTICATION_TOKEN_KEY,
    ROOT_URL_API,
    HTTP_STATUS_CODES,
    CALORIES_COUNTER_MEALS,
    CALORIES_COUNTER_SCREEN_INTENTS
}