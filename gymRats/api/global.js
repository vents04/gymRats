const DATABASE_MODELS = {
    EXERCISE: "Exercise",
    MUSCLE: "Muscle",
    SPLIT: "Split",
    WORKOUT: "Workout",
    WORKOUT_SESSION: "WorkoutSession",
    USER: "User",
    CALORIES_COUNTER_ITEM: "CaloriesCounterItems",
    CALORIES_COUNTER_DAY: "CaloriesCounterDay",
    CALORIES_COUNTER_DAILY_GOAL: "CaloriesCounterDailyGoal",
    DAILY_WEIGHT: "DailyWeight",
    SUGGESTION: "Suggestion",
    SUPPLEMENTS: "Supplements",
    PERSONAL_TRAINER: "PersonalTrainer",
    RELATION: "Relation",
    DIET_PLAN: "DietPlan",
    REVIEW: "Review",
    CHAT: "Chat",
    MESSAGE: "Message",
    CONTENT: "Content",
    NAVIGATION: "Navigation",
    UNKNOWN_SOURCE_CALORIES: "UnknownSourceCalories",
    DEVICE: "Device",
    PASSWORD_RECOVERY_CODE: "PasswordRecoveryCode",
    EMAIL_VERIFICATION_CODE: "EmailVerificationCode",
}

const COLLECTIONS = {
    EXERCISES: "exercises",
    MUSCLES: "muscles",
    SPLITS: "splits",
    WORKOUTS: "workouts",
    WORKOUT_SESSIONS: "workoutSessions",
    USERS: "users",
    CALORIES_COUNTER_ITEMS: "caloriesCounterItems",
    CALORIES_COUNTER_DAYS: "caloriesCounterDays",
    CALORIES_COUNTER_DAILY_GOALS: "caloriesCounterDailyGoals",
    DAILY_WEIGHTS: "dailyWeights",
    SUGGESTIONS: "suggestions",
    PERSONAL_TRAINERS: "personalTrainers",
    RELATIONS: "relations",
    DIET_PLANS: "dietPlans",
    REVIEWS: "reviews",
    CHATS: "chats",
    MESSAGES: "messages",
    CONTENTS: "contents",
    NAVIGATIONS: "navigations",
    UNKNOWN_SOURCE_CALORIES: "unknownSourceCalories",
    DEVICES: "devices",
    PASSWORD_RECOVERY_CODES: "passwordRecoveryCodes",
    EMAIL_VERIFICATION_CODES: "emailVerificationCodes",
}

const PERSONAL_TRAINER_STATUSES = {
    ACTIVE: "ACTIVE",
    BLOCKED: "BLOCKED",
    PENDING: "PENDING",
}

const CHAT_STATUSES = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    BLOCKED: "BLOCKED",
}

const RELATION_STATUSES = {
    ACTIVE: "ACTIVE",
    DECLINED: "DECLINED",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    CANCELED: "CANCELED"
}

const PROFESSIONS = {
    NUTRITIONIST: "NUTRITIONIST",
    DIETITIAN: "DIETITIAN",
    PERSONAL_TRAINER: "PERSONAL_TRAINER",
    NOT_GIVEN: "NOT_GIVEN"
}

const CARD_COLLECTIONS = [
    COLLECTIONS.DAILY_WEIGHTS,
    COLLECTIONS.WORKOUT_SESSIONS,
    COLLECTIONS.CALORIES_COUNTER_DAYS,
]

const DB_URI = "mongodb://127.0.0.1:27017/GYM";

const JWT_SECRET = "lj1ds21idpk2]312d's[23123q";

const PORT = 4057;

const NODE_ENVIRONMENTS = {
    DEVELOPMENT: "DEVELOPMENT",
    PRODUCTION: "PRODUCTION",
}

const NODE_ENVIRONMENT = NODE_ENVIRONMENTS.PRODUCTION;

const HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}

const ROOT_URL_API = `https://api.gymrats.uploy.app`;

const UNITS = {
    1: ["sets", "reps", "kgs"],
    2: ["sets", "duration"],
    3: ["sets", "reps"],
}

const CALORIES_COUNTER_UNITS = {
    MILLILITERS: "MILLILITERS",
    GRAMS: "GRAMS"
}

const WEIGHT_UNITS = {
    POUNDS: "POUNDS",
    KILOGRAMS: "KILOGRAMS",
}

const CALORIES_COUNTER_MEALS = {
    BREAKFAST: "BREAKFAST",
    LUNCH: "LUNCH",
    DINNER: "DINNER",
    SNACKS: "SNACKS",
}

const SENDGRID_API_KEY = "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";

const APP_EMAIL = "noreply@uploy.app";

const WEIGHT_UNIT_RELATIONS = {
    KILOGRAMS: {
        POUNDS: 2.20462,
    },
    POUNDS: {
        KILOGRAMS: 0.453592
    }
}

const GOOGLE_API_KEY = "AIzaSyAYQnnCgQuzHGk6WMcbhtOPJHROn5vycE4";

const DEFAULT_ERROR_MESSAGE = "Internal server error";

const SUGGESTIONS_STATUSES = {
    PENDING_REVIEW: "PENDING_REVIEW",
    ANSWERED: "ANSWERED"
}

const FOOD_TYPES = {
    FOUNDATIONAL: "FOUNDATIONAL",
    BRANDED: "BRANDED",
    USER_ADDED: "USER_ADDED",
}

const PROGRESS_NOTATION = {
    INSUFFICIENT_WEIGHT_LOSS: "INSUFFICIENT_WEIGHT_LOSS",
    SUFFICIENT_WEIGHT_LOSS: "SUFFICIENT_WEIGHT_LOSS",
    RAPID_WEIGHT_LOSS: "RAPID_WEIGHT_LOSS",
    INSUFFICIENT_WEIGHT_GAIN: "INSUFFICIENT_WEIGHT_GAIN",
    SUFFICIENT_WEIGHT_GAIN: "SUFFICIENT_WEIGHT_GAIN",
    RAPID_WEIGHT_GAIN: "RAPID_WEIGHT_GAIN",
}

const WEEK_TO_MILLISECONDS = 604800000;

const LOGBOOK_PROGRESS_NOTATIONS = {
    RAPID_STRENGTH_LOSS: "RAPID_STRENGTH_LOSS",
    STRENGTH_LOSS: "STRENGTH_LOSS",
    SLIGHT_STRENGTH_LOSS: "SLIGHT_STRENGTH_LOSS",
    NO_CHANGE: "NO_CHANGE",
    SLIGHT_STRENGTH_GAIN: "SLIGHT_STRENGTH_GAIN",
    STRENGTH_GAIN: "STRENGTH_GAIN",
    RAPID_STRENGTH_GAIN: "RAPID_STRENGTH_GAIN",
}

const CALORIES_COUNTER_ITEM_TYPES = {
    FOOD: "FOOD",
    UNKNOWN_SOURCE_CALORIES: "UNKNOWN_SOURCE_CALORIES",
}

const SUPPORTED_LANGUAGES = {
    ENGLISH: "en",
    BULGARIAN: "bg"
}

module.exports = {
    DATABASE_MODELS: DATABASE_MODELS,
    DB_URI: DB_URI,
    COLLECTIONS: COLLECTIONS,
    PORT: PORT,
    NODE_ENVIRONMENT: NODE_ENVIRONMENT,
    NODE_ENVIRONMENTS: NODE_ENVIRONMENTS,
    HTTP_STATUS_CODES: HTTP_STATUS_CODES,
    JWT_SECRET: JWT_SECRET,
    ROOT_URL_API: ROOT_URL_API,
    UNITS: UNITS,
    CALORIES_COUNTER_UNITS: CALORIES_COUNTER_UNITS,
    WEIGHT_UNITS: WEIGHT_UNITS,
    SENDGRID_API_KEY: SENDGRID_API_KEY,
    CALORIES_COUNTER_MEALS: CALORIES_COUNTER_MEALS,
    CARD_COLLECTIONS: CARD_COLLECTIONS,
    APP_EMAIL: APP_EMAIL,
    PERSONAL_TRAINER_STATUSES: PERSONAL_TRAINER_STATUSES,
    RELATION_STATUSES: RELATION_STATUSES,
    PROFESSIONS: PROFESSIONS,
    WEIGHT_UNIT_RELATIONS: WEIGHT_UNIT_RELATIONS,
    GOOGLE_API_KEY: GOOGLE_API_KEY,
    CHAT_STATUSES: CHAT_STATUSES,
    DEFAULT_ERROR_MESSAGE: DEFAULT_ERROR_MESSAGE,
    SUGGESTIONS_STATUSES: SUGGESTIONS_STATUSES,
    FOOD_TYPES: FOOD_TYPES,
    PROGRESS_NOTATION: PROGRESS_NOTATION,
    WEEK_TO_MILLISECONDS: WEEK_TO_MILLISECONDS,
    LOGBOOK_PROGRESS_NOTATIONS: LOGBOOK_PROGRESS_NOTATIONS,
    CALORIES_COUNTER_ITEM_TYPES: CALORIES_COUNTER_ITEM_TYPES,
    SUPPORTED_LANGUAGES: SUPPORTED_LANGUAGES
}