const AUTHENTICATION_TOKEN_KEY = "x-auth-token";

const ROOT_URL_API = "http://192.168.1.8:4057";

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

const SHOW_MAIN_TAB_NAVIGATION_ON_SCREENS = {
    CALENDAR: "Calendar",
    PROGRESS: "Progress",
    COACHING: "Coaching",
    CHATS: "Chats",
    PROFILE: "Profile",
}

const ACTIVE_CARDS = {
    WEIGHT_TRACKER: "WEIGHT_TRACKER",
    CALORIES_COUNTER: "CALORIES_COUNTER",
    LOGBOOK: "LOGBOOK",
}

const MEAL_TITLES = {
    BREAKFAST: "Breakfast",
    LUNCH: "Lunch",
    DINNER: "Dinner",
    SNACKS: "Snacks",
}

const RELATION_STATUSES = {
    ACTIVE: "ACTIVE",
    DECLINED: "DECLINED",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    CANCELED: "CANCELED"
}

const WEIGHT_UNITS_LABELS = {
    KILOGRAMS: "kgs",
    POUNDS: "lbs"
}

const WEIGHT_UNITS = {
    KILOGRAMS: "KILOGRAMS",
    POUNDS: "POUNDS"
}

const CALORIES_COUNTER_UNITS = {
    MILLILITERS: "MILLILITERS",
    GRAMS: "GRAMS"
}

const PROGRESS_NOTATION = {
    INSUFFICIENT_WEIGHT_LOSS: "INSUFFICIENT_WEIGHT_LOSS",
    SUFFICIENT_WEIGHT_LOSS: "SUFFICIENT_WEIGHT_LOSS",
    RAPID_WEIGHT_LOSS: "RAPID_WEIGHT_LOSS",
    INSUFFICIENT_WEIGHT_GAIN: "INSUFFICIENT_WEIGHT_GAIN",
    SUFFICIENT_WEIGHT_GAIN: "SUFFICIENT_WEIGHT_GAIN",
    RAPID_WEIGHT_GAIN: "RAPID_WEIGHT_GAIN",
}

const LOGBOOK_PROGRESS_NOTATIONS = {
    RAPID_STRENGTH_LOSS: "RAPID_STRENGTH_LOSS",
    STRENGTH_LOSS: "STRENGTH_LOSS",
    SLIGHT_STRENGTH_LOSS: "SLIGHT_STRENGTH_LOSS",
    NO_CHANGE: "NO_CHANGE",
    SLIGHT_STRENGTH_GAIN: "SLIGHT_STRENGTH_GAIN",
    STRENGTH_GAIN: "STRENGTH_GAIN",
    RAPID_STRENGTH_GAIN: "RAPID_STRENGTH_GAIN",
}

const SUPPORTED_MIME_TYPES = [
    "audio/aac",
    "image/avif",
    "video/x-msvideo",
    "image/bmp",
    "application/x-bzip",
    "application/x-bzip2",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/epub+zip",
    "application/gzip",
    "image/gif",
    "image/vnd.microsoft.icon",
    "image/jpeg",
    "application/json",
    "audio/mpeg",
    "video/mp4",
    "video/mpeg",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.text",
    "audio/ogg",
    "video/ogg",
    "application/ogg",
    "image/png",
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.rar",
    "application/rtf",
    "image/svg+xml",
    "application/x-tar",
    "image/tiff",
    "text/plain",
    "audio/wav",
    "audio/webm",
    "video/webm",
    "image/webp",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "video/3gpp",
    "audio/3gpp",
    "video/3gpp2",
    "audio/3gpp2",
    "application/x-7z-compressed"
]

const IMAGE_VISUALIZATION_MIME_TYPES = [
    "image/avif",
    "image/bmp",
    "image/gif",
    "image/vnd.microsoft.icon",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/webp",
]

const VIDEO_VISUALIZATION_MIME_TYPES = [
    "video/x-msvideo",
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
    "video/3gpp",
    "video/3gpp2",
]

const AUDIO_PLAY_MIME_TYPES = [
    "audio/aac",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    "audio/3gpp",
    "audio/3gpp2"
]

module.exports = {
    AUTHENTICATION_TOKEN_KEY,
    ROOT_URL_API,
    HTTP_STATUS_CODES,
    CALORIES_COUNTER_MEALS,
    CALORIES_COUNTER_SCREEN_INTENTS,
    SHOW_MAIN_TAB_NAVIGATION_ON_SCREENS,
    ACTIVE_CARDS,
    MEAL_TITLES,
    RELATION_STATUSES,
    WEIGHT_UNITS_LABELS,
    WEIGHT_UNITS,
    CALORIES_COUNTER_UNITS,
    PROGRESS_NOTATION,
    LOGBOOK_PROGRESS_NOTATIONS,
    SUPPORTED_MIME_TYPES,
    IMAGE_VISUALIZATION_MIME_TYPES,
    VIDEO_VISUALIZATION_MIME_TYPES,
    AUDIO_PLAY_MIME_TYPES
}