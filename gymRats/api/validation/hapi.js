const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const { CALORIES_COUNTER_UNITS, WEIGHT_UNITS, CALORIES_COUNTER_MEALS, RELATION_STATUSES, PERSONAL_TRAINER_STATUSES, CONNECTION_STATUSES } = require('../global');
const translations = require("./translations");
const { booleanBaseError, numberPrecisionError, anyOnlyError, stringBaseError, stringEmptyError, anyRequiredError, stringMinError, stringMaxError, stringEmailError, invalidIdError, numberMinError, numberMaxError, numberIntegerError, numberPositiveError, stringAlphabeticalRegexError, arrayIncludesError, lettersOnlyError } = require('./errors');

const INVALID_INPUT_FIELD_VALUES_FOR_LETTER_ONLY_FIELDS = ["!", "\"", "#", "$", "%", "&", "\'", "(", ")", "*", "+", ",", "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|", "}", "~", "\"", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

const firstNameValidation = (lng) => {
    if (!lng) lng = "en";
    return Joi.string().min(1).max(32).required().messages({
        "string.base": stringBaseError(lng, "firstName", 1),
        "string.empty": stringEmptyError(lng, "firstName"),
        "string.min": stringMinError(lng, "firstName", 1),
        "string.max": stringMaxError(lng, "firstName", 32),
        "any.invalid": lettersOnlyError(lng, "firstName"),
        "any.required": anyRequiredError(lng, "firstName")
    }).custom((value, helper) => {
        for(let char of value) {
            if(INVALID_INPUT_FIELD_VALUES_FOR_LETTER_ONLY_FIELDS.includes(char)) {
                return helper.message(lettersOnlyError(lng, "firstName"));
            }
        }
        return true;
    })
}

const lastNameValidation = (lng) => {
    if (!lng) lng = "en";
    return Joi.string().min(1).max(32).required().messages({
        "string.base": stringBaseError(lng, "lastName", 1),
        "string.empty": stringEmptyError(lng, "lastName"),
        "string.min": stringMinError(lng, "lastName", 1),
        "string.max": stringMaxError(lng, "lastName", 32),
        "any.invalid": lettersOnlyError(lng, "lastName"),
        "any.required": anyRequiredError(lng, "lastName")
    }).custom((value, helper) => {
        for(let char of value) {
            if(INVALID_INPUT_FIELD_VALUES_FOR_LETTER_ONLY_FIELDS.includes(char)) {
                return helper.message(lettersOnlyError(lng, "firstName"));
            }
        }
        return true;
    })
}

const emailValidation = (lng) => {
    if (!lng) lng = "en";
    return Joi.string().email().min(3).max(320).required().messages({
        "string.base": stringBaseError(lng, "email", 1),
        "string.empty": stringEmptyError(lng, "email"),
        "string.min": stringMinError(lng, "email", 3),
        "string.email": stringEmailError(lng, "email"),
        "string.max": stringMaxError(lng, "email", 320),
        "any.required": anyRequiredError(lng, "email")
    }).trim().lowercase()
}

const passwordValidation = (lng) => {
    if (!lng) lng = "en";
    return Joi.string().min(8).max(100).required().messages({
        "string.base": stringBaseError(lng, "password", 8),
        "string.empty": stringEmptyError(lng, "password"),
        "string.min": stringMinError(lng, "password", 8),
        "string.max": stringMaxError(lng, "password", 100),
        "any.required": anyRequiredError(lng, "password")
    })
}
const signupValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        firstName: firstNameValidation(lng),
        lastName: lastNameValidation(lng),
        email: emailValidation(lng),
        password: passwordValidation(lng),
    })
    return schema.validate(data);
}

const loginValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        email: emailValidation(lng),
        password: passwordValidation(lng),
    })
    return schema.validate(data);
}

const userUpdateValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        firstName: firstNameValidation(lng).optional(),
        lastName: lastNameValidation(lng).optional(),
        weightUnit: Joi.string().valid(...Object.values(WEIGHT_UNITS)).messages({
            "string.base": stringBaseError(lng, "weightUnit", 1),
            "string.empty": stringEmptyError(lng, "weightUnit"),
            "any.only": anyOnlyError(lng, "weightUnit")
        }).optional(),
        profilePicture: Joi.string().optional().allow(null).allow("")
    });
    return schema.validate(data);
}

const itemPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        title: Joi.string().min(1).max(300).required().messages({
            "string.base": stringBaseError(lng, "title", 1),
            "string.empty": stringEmptyError(lng, "title"),
            "string.min": stringMinError(lng, "title", 1),
            "string.max": stringMaxError(lng, "title", 300),
            "any.required": anyRequiredError(lng, "title")
        }),
        brand: Joi.string().min(1).max(300).optional().messages({
            "string.base": stringBaseError(lng, "brand", 1),
            "string.empty": stringEmptyError(lng, "brand"),
            "string.min": stringMinError(lng, "brand", 1),
            "string.max": stringMaxError(lng, "brand", 300),
            "any.required": anyRequiredError(lng, "brand")
        }),
        barcode: Joi.string().optional(),
        unit: Joi.string().valid(...Object.values(CALORIES_COUNTER_UNITS)).required().messages({
            "any.only": anyOnlyError(lng, "foodUnit"),
            "any.required": anyRequiredError(lng, "foodUnit")
        }),
        calories: Joi.number().integer().required().positive().allow(0).min(0).messages({
            "number.integer": numberIntegerError(lng, "calories"),
            "number.positive": numberPositiveError(lng, "calories"),
            "number.min": numberMinError(lng, "calories", 0),
            "any.required": anyRequiredError(lng, "calories"),
        }),
        protein: Joi.number().required().positive().allow(0).min(0).messages({
            "number.integer": numberIntegerError(lng, "protein"),
            "number.positive": numberPositiveError(lng, "protein"),
            "number.min": numberMinError(lng, "protein", 0),
            "any.required": anyRequiredError(lng, "protein"),
        }),
        carbs: Joi.number().required().positive().allow(0).min(0).messages({
            "number.integer": numberIntegerError(lng, "carbs"),
            "number.positive": numberPositiveError(lng, "carbs"),
            "number.min": numberMinError(lng, "carbs", 0),
            "any.required": anyRequiredError(lng, "carbs"),
        }),
        fats: Joi.number().required().positive().allow(0).min(0).messages({
            "number.integer": numberIntegerError(lng, "fats"),
            "number.positive": numberPositiveError(lng, "fats"),
            "number.min": numberMinError(lng, "fats", 0),
            "any.required": anyRequiredError(lng, "fats"),
        }),
    })
    return schema.validate(data);
}

const dailyItemPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        date: Joi.number().integer().positive().min(1).max(31).required().messages({
            "number.integer": numberIntegerError(lng, "date"),
            "number.positive": numberPositiveError(lng, "date"),
            "number.min": numberMinError(lng, "month", 1),
            "number.max": numberMaxError(lng, "month", 31),
            "any.required": anyRequiredError(lng, "date")
        }),
        month: Joi.number().integer().positive().min(1).max(12).required().messages({
            "number.integer": numberIntegerError(lng, "month"),
            "number.positive": numberPositiveError(lng, "month"),
            "number.min": numberMinError(lng, "month", 1),
            "number.max": numberMaxError(lng, "month", 12),
            "any.required": anyRequiredError(lng, "month")
        }),
        year: Joi.number().integer().positive().required().messages({
            "number.integer": numberIntegerError(lng, "year"),
            "number.positive": numberPositiveError(lng, "year"),
            "any.required": anyRequiredError(lng, "year")
        }),
        itemId: Joi.string().required().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "item"));
            return true;
        }).messages({
            "any.required": anyRequiredError(lng, "item")
        }),
        amount: Joi.number().integer().required().positive().min(0).messages({
            "number.min": numberMinError(lng, "amount", 0),
            "number.integer": numberIntegerError(lng, "year"),
            "number.positive": numberPositiveError(lng, "year"),
            "any.required": anyRequiredError(lng, "amount"),
        }),
        dt: Joi.date().required().messages({
            "any.required": anyRequiredError(lng, "foodDt")
        }),
        meal: Joi.string().valid(...Object.values(CALORIES_COUNTER_MEALS)).required().messages({
            "string.base": stringBaseError(lng, "meal", 1),
            "string.empty": stringEmptyError(lng, "meal"),
            "any.only": anyOnlyError(lng, "meal"),
            "any.required": anyRequiredError(lng, "meal")
        })
    })
    return schema.validate(data);
}

const dailyItemUpdateValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        amount: Joi.number().integer().optional().positive().min(0).messages({
            "number.integer": numberIntegerError(lng, "year"),
            "number.positive": numberPositiveError(lng, "year"),
            "number.min": numberMinError(lng, "amount", 0)
        }),
        meal: Joi.string().valid(...Object.values(CALORIES_COUNTER_MEALS)).optional().messages({
            "string.base": stringBaseError(lng, "meal", 1),
            "string.empty": stringEmptyError(lng, "meal"),
            "any.only": anyOnlyError(lng, "meal"),
            "any.required": anyRequiredError(lng, "meal")
        })
    })
    return schema.validate(data);
}

const dailyWeightPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        weight: Joi.number().precision(2).required().positive().min(2.1).max(10000).messages({
            "number.precision": numberPrecisionError(lng, "weight", 2),
            "number.positive": numberPositiveError(lng, "weight"),
            "number.min": numberMinError(lng, "weight", 2.1),
            "number.max": numberMaxError(lng, "weight", 10000),
            "any.required": anyRequiredError(lng, "weight"),
        }),
        unit: Joi.string().valid(...Object.values(WEIGHT_UNITS)).required().messages({
            "string.base": stringBaseError(lng, "weightUnit", 1),
            "string.empty": stringEmptyError(lng, "weightUnit"),
            "any.only": anyOnlyError(lng, "weightUnit"),
            "any.required": anyRequiredError(lng, "weightUnit")
        }),
    })
    return schema.validate(data);
}

const suggestionPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        suggestion: Joi.string().min(1).max(1000).required().messages({
            "string.base": stringBaseError(lng, "suggestion", 1),
            "string.min": stringMinError(lng, "suggestion", 1),
            "string.max": stringMaxError(lng, "suggestion", 1000),
            "any.required": anyRequiredError(lng, "suggestion")
        }),
    })
    return schema.validate(data);
}

const exercisePostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        title: Joi.string().min(1).max(150).required().messages({
            "string.base": stringBaseError(lng, "title", 1),
            "string.min": stringMinError(lng, "title", 1),
            "string.max": stringMaxError(lng, "title", 150),
            "any.required": anyRequiredError(lng, "title")
        }),
        description: Joi.string().min(1).max(300).optional().messages({
            "string.base": stringBaseError(lng, "description", 1),
            "string.min": stringMinError(lng, "description", 1),
            "string.max": stringMaxError(lng, "description", 300),
            "any.required": anyRequiredError(lng, "description")
        }),
        targetMuscles: Joi.array().items(Joi.string().required().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "muscle"));
            return true;
        })).optional().messages({
            "array.includes": arrayIncludesError(lng, "muscles"),
        }),
        keywords: Joi.array().items(Joi.string().required().messages({
            "string.base": stringBaseError(lng, "keyword", 1),
            "string.empty": stringEmptyError(lng, "keyword"),
            "any.required": anyRequiredError(lng, "keyword")
        })).optional().messages({
            "array.includes": arrayIncludesError(lng, "keywords"),
        }),
    });
    return schema.validate(data);
}

const workoutPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        name: Joi.string().min(1).max(150).required().messages({
            "string.base": stringBaseError(lng, "name", 1),
            "string.min": stringMinError(lng, "name", 1),
            "string.max": stringMaxError(lng, "name", 150),
            "any.required": anyRequiredError(lng, "name")
        }),
        exercises: Joi.array().items(Joi.string().required().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "exercise"));
            return true;
        })).required()
    })
    return schema.validate(data);
}

const workoutSessionValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        exercises: Joi.array().items(Joi.object({
            _id: Joi.string().optional(),
            exerciseId: Joi.string().custom((value, helper) => {
                if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "exercise"));
                return true;
            }).required().messages({
                "string.base": stringBaseError(lng, "exercise", 1),
                "string.empty": stringEmptyError(lng, "exercise"),
                "any.required": anyRequiredError(lng, "exercise")
            }),
            sets: Joi.array().items(Joi.object({
                reps: Joi.alternatives().try(Joi.string().custom((value, helper) => {
                    if (value != "AMRAP") return helper.message(translations[lng].errors.invalidRepsValue);
                    return true;
                }).required(), Joi.number().positive().required().min(1).messages({
                    "number.positive": numberPositiveError(lng, "reps"),
                    "number.min": numberMinError(lng, "reps", 1),
                    "any.required": anyRequiredError(lng, "reps")
                })).optional(),
                duration: Joi.number().integer().optional().positive().max(10000).messages({
                    "number.positive": numberPositiveError(lng, "duration"),
                    "number.integer": numberIntegerError(lng, "year"),
                    "number.max": numberMaxError(lng, "duration", 10000),
                }).allow(null).allow(0),
                weight: Joi.object({
                    amount: Joi.number().precision(2).required().positive().max(3000).messages({
                        "number.precision": numberPrecisionError(lng, "weight", 2),
                        "number.max": numberMaxError(lng, "weight", 3000),
                        "any.required": anyRequiredError(lng, "weight")
                    }),
                    unit: Joi.string().valid(...Object.values(WEIGHT_UNITS)).required().messages({
                        "string.base": stringBaseError(lng, "weightUnit", 1),
                        "string.empty": stringEmptyError(lng, "weightUnit"),
                        "any.only": anyOnlyError(lng, "weightUnit"),
                        "any.required": anyRequiredError(lng, "weightUnit")
                    })
                }).optional(),
                _id: Joi.string().optional(),
            }).required()).messages({
                "array.includes": arrayIncludesError(lng, "sets"),
                "any.required": anyRequiredError(lng, "sets")
            }),
            note: Joi.string().optional().allow(null).allow("")
        }).required()).messages({
            "array.includes": arrayIncludesError(lng, "exercises"),
            "any.required": anyRequiredError(lng, "exercises")
        }),
    })
    return schema.validate(data);
}

const workoutTemplateCheckValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        exercises: Joi.array().items(Joi.object({
            exerciseId: Joi.string().required().custom((value, helper) => {
                if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "exercise"));
                return true;
            })
        })).required().messages({
            "array.includes": arrayIncludesError(lng, "exercises"),
            "any.required": anyRequiredError(lng, "exercises")
        }),
    });
    return schema.validate(data);
}

const relationValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        coachId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "receiver"));
            return true;
        }).required().messages({
            "string.base": stringBaseError(lng, "receiver", 1),
            "string.empty": stringEmptyError(lng, "receiver"),
            "any.required": anyRequiredError(lng, "receiver")
        }),
    });
    return schema.validate(data);
}

const relationStatusUpdateValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        status: Joi.string().valid(...Object.values(RELATION_STATUSES)).required().messages({
            "string.base": stringBaseError(lng, "status", 1),
            "string.empty": stringEmptyError(lng, "status"),
            "any.only": anyOnlyError(lng, "status"),
            "any.required": anyRequiredError(lng, "status")
        }),
    });
    return schema.validate(data);
}

const coachingReviewPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        rating: Joi.number().min(1).max(5).required().messages({
            "number.min": numberMinError(lng, "rating", 1),
            "number.max": numberMaxError(lng, "rating", 5),
            "any.required": anyRequiredError(lng, "rating")
        }),
        review: Joi.string().min(1).max(1000).optional().messages({
            "string.min": stringMinError(lng, "review", 1),
            "string.max": stringMaxError(lng, "review", 1000),
        }),

    });
    return schema.validate(data);
}

const googlePlacesSearchValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        query: Joi.string().required().allow(null).allow("")
    });
    return schema.validate(data);
}

const coachApplicationPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        location: Joi.object({
            address: Joi.string().required().messages({
                "string.base": stringBaseError(lng, "address", 1),
                "string.empty": stringEmptyError(lng, "address"),
                "any.required": anyRequiredError(lng, "address")
            }),
            lat: Joi.number().required().min(-90).max(90).messages({
                "number.min": numberMinError(lng, "lat", -90),
                "number.max": numberMaxError(lng, "lat", 90),
                "any.required": anyRequiredError(lng, "lat")
            }),
            lng: Joi.number().min(-180).max(180).required().messages({
                "number.min": numberMinError(lng, "lng", -180),
                "number.max": numberMaxError(lng, "lng", 180),
                "any.required": anyRequiredError(lng, "lng")
            })
        }),
        prefersOfflineCoaching: Joi.boolean().required().messages({
            "boolean.base": booleanBaseError(lng, "prefersOfflineCoaching"),
        })
    });
    return schema.validate(data);
}

const chatValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        personalTrainerId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "trainer"));
            return true;
        }).required().messages({
            "any.required": anyRequiredError(lng, "trainer")
        }),
        clientId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "client"));
            return true;
        }).required().messages({
            "any.required": anyRequiredError(lng, "client")
        })
    });
    return schema.validate(data);
}

const messageValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        senderId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "senderId"));
            return true;
        }).required().messages({
            "any.required": anyRequiredError(lng, "message")
        }),
        chatId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "chatId"));
            return true;
        }).required().messages({
            "any.required": anyRequiredError(lng, "message")
        }),
        message: Joi.object({
            text: Joi.string().min(0).max(1000).optional().messages({
                "string.min": stringMinError(lng, "messageText", 0),
                "string.max": stringMaxError(lng, "messageText", 1000)
            }),
            file: Joi.string().optional()
        }).required().messages({
            "any.required": anyRequiredError(lng, "message")
        })
    });
    return schema.validate(data);
}

const navigationAnalyticsValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        navigationAnalytics: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            time: Joi.number().required(),
            toDt: Joi.number().required(),
            token: Joi.string().optional().allow(null),
        })).required()
    })
    return schema.validate(data);
}

const unknownSourceCaloriesPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        date: Joi.number().integer().positive().min(1).max(31).required().messages({
            "number.integer": numberIntegerError(lng, "date"),
            "number.positive": numberPositiveError(lng, "date"),
            "number.min": numberMinError(lng, "month", 1),
            "number.max": numberMaxError(lng, "month", 31),
            "any.required": anyRequiredError(lng, "date")
        }),
        month: Joi.number().integer().positive().min(1).max(12).required().messages({
            "number.integer": numberIntegerError(lng, "month"),
            "number.positive": numberPositiveError(lng, "month"),
            "number.min": numberMinError(lng, "month", 1),
            "number.max": numberMaxError(lng, "month", 12),
            "any.required": anyRequiredError(lng, "month")
        }),
        year: Joi.number().integer().positive().required().messages({
            "number.integer": numberIntegerError(lng, "year"),
            "number.positive": numberPositiveError(lng, "year"),
            "any.required": anyRequiredError(lng, "year")
        }),
        calories: Joi.number().positive().integer().required().messages({
            "number.integer": numberIntegerError(lng, "calories"),
            "number.positive": numberPositiveError(lng, "calories"),
            "any.required": anyRequiredError(lng, "calories")
        }),
    })
    return schema.validate(data);
}

const workoutUpdateValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        name: Joi.string().min(1).max(40).required().messages({
            "string.base": stringBaseError(lng, "workoutName", 1),
            "string.empty": stringEmptyError(lng, "workoutName"),
            "string.min": stringMinError(lng, "workoutName", 1),
            "string.max": stringMaxError(lng, "workoutName", 40),
            "any.required": anyRequiredError(lng, "workoutName")
        }),
        exercises: Joi.array().items(Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "exercise"));
            return true;
        })).required().messages({
            "array.includes": arrayIncludesError(lng, "exercises"),
            "any.required": anyRequiredError(lng, "exercises")
        }),
    })
    return schema.validate(data);
}

const devicePostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        deviceType: Joi.string().required(),
        osName: Joi.string().required(),
        brand: Joi.string().optional().allow(null).allow(""),
        manufacturer: Joi.string().optional().allow(null).allow(""),
        modelName: Joi.string().optional().allow(null).allow(""),
        modelId: Joi.string().optional().allow(null).allow(""),
        designName: Joi.string().optional().allow(null).allow(""),
        productName: Joi.string().optional().allow(null).allow(""),
        deviceYearClass: Joi.number().optional().allow(null).allow(""),
        totalMemory: Joi.number().optional().allow(null).allow(""),
        osBuildId: Joi.string().optional().allow(null).allow(""),
        osInternalBuildId: Joi.string().optional().allow(null).allow(""),
        osBuildFingerprint: Joi.string().optional().allow(null).allow(""),
        platformApiLevel: Joi.number().optional().allow(null).allow(""),
        deviceName: Joi.string().optional().allow(null).allow(""),
        expoPushNotificationsToken: Joi.string().optional().allow(null).allow(""),
        deviceId: Joi.string().optional().allow(null).allow("")
    })
    return schema.validate(data);
}

const forgottenPasswordPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        email: emailValidation(lng)
    });
    return schema.validate(data);
}

const emailVerificationPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        email: emailValidation(lng)
    });
    return schema.validate(data);
}

const passwordPutValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        identifier: Joi.string().max(1000).required().messages({
            "string.base": stringBaseError(lng, "identifier", 1),
            "string.empty": stringEmptyError(lng, "identifier"),
            "string.max": stringMaxError(lng, "identifier", 1000),
            "any.required": anyRequiredError(lng, "identifier")
        }),
        code: Joi.string().max(1000).required().messages({
            "string.base": stringBaseError(lng, "code", 1),
            "string.empty": stringEmptyError(lng, "code"),
            "string.max": stringMaxError(lng, "code", 1000),
            "any.required": anyRequiredError(lng, "code")
        }),
        password: passwordValidation(lng),
    });
    return schema.validate(data);
}

const adminCoachStatusUpdateValidation = (data) => {
    const schema = Joi.object({
        status: Joi.string().valid(...Object.values(PERSONAL_TRAINER_STATUSES)).required()
    });
    return schema.validate(data);
}

const connectionPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        receiverId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helper.message(invalidIdError(lng, "receiverId"));
            return true;
        }).required().messages({
            "any.required": anyRequiredError(lng, "message")
        })
    })
    return schema.validate(data);
}

module.exports = {
    signupValidation,
    loginValidation,
    userUpdateValidation,
    itemPostValidation,
    dailyItemPostValidation,
    dailyWeightPostValidation,
    suggestionPostValidation,
    exercisePostValidation,
    workoutPostValidation,
    workoutSessionValidation,
    workoutTemplateCheckValidation,
    relationValidation,
    relationStatusUpdateValidation,
    coachingReviewPostValidation,
    googlePlacesSearchValidation,
    coachApplicationPostValidation,
    chatValidation,
    messageValidation,
    dailyItemUpdateValidation,
    navigationAnalyticsValidation,
    unknownSourceCaloriesPostValidation,
    workoutUpdateValidation,
    devicePostValidation,
    forgottenPasswordPostValidation,
    passwordPutValidation,
    emailVerificationPostValidation,
    adminCoachStatusUpdateValidation,
    connectionPostValidation
}