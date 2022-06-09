const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const { CALORIES_COUNTER_UNITS, WEIGHT_UNITS, CALORIES_COUNTER_MEALS, REQUEST_STATUSES, CHAT_STATUSES, RELATION_STATUSES, CONTENT_VISIBILITY_SCOPES } = require('../global');
const { stringBaseError, stringEmptyError, anyRequiredError } = require('./errors');

const firstNameValidation = (lng) => {
    if (!lng) lng = "en";
    return Joi.string().min(1).max(32).required().messages({
        "string.base": stringBaseError(lng, "firstName", 1),
        "string.empty": stringEmptyError(lng, "firstName"),
        "string.min": `First name should have at least 1 character`,
        "string.max": `First name should have at most 32 characters`,
        "any.required": anyRequiredError(lng, "firstName")
    }).regex(/^[A-Za-z]+$/)
}

const lastNameValidation = () => {
    return Joi.string().min(1).max(32).required().messages({
        "string.base": `Last name should have at least 1 character`,
        "string.empty": `Last name should not be empty`,
        "string.min": `Last name should have at least 1 character`,
        "string.max": `Last name should have at most 32 characters`,
        "any.required": `Last name is a required field`
    }).regex(/^[A-Za-z]+$/)
}

const emailValidation = () => {
    return Joi.string().email().min(3).max(320).required().messages({
        "string.base": `Email should have at least 3 characters`,
        "string.empty": `Email should not be empty`,
        "string.min": `Email should have at least 3 characters`,
        "string.email": `Email should be a valid email address`,
        "string.max": `Email should have at most 320 characters`,
        "any.required": `Email is a required field`
    })
}

const passwordValidation = () => {
    return Joi.string().min(8).max(100).required().messages({
        "string.base": `Password should have at least 8 characters`,
        "string.empty": `Password should not be empty`,
        "string.min": `Password should have at least 8 characters`,
        "string.max": `Password should have at most 100 characters`,
        "any.required": `Password is a required field`
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

const loginValidation = (data) => {
    const schema = Joi.object({
        email: emailValidation(),
        password: passwordValidation(),
    })
    return schema.validate(data);
}

const userUpdateValidation = (data) => {
    const schema = Joi.object({
        firstName: firstNameValidation(),
        lastName: lastNameValidation(),
        weightUnit: Joi.string().valid(...Object.values(WEIGHT_UNITS)).messages({
            "string.base": `Weight unit should have at least 1 character`,
            "string.empty": `Weight unit should not be empty`,
            "any.required": `Weight unit is a required field`
        }),
        profilePicture: Joi.string().optional().allow(null).allow("")
    });
    return schema.validate(data);
}

const itemPostValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(300).required().messages({
            "string.base": `Title should have at least 1 characters`,
            "string.empty": `Title should not be empty`,
            "string.min": `Title should have at least 1 characters`,
            "string.max": `Title should have at most 300 characters`,
            "any.required": `Title is a required field`
        }),
        brand: Joi.string().min(1).max(300).optional(),
        barcode: Joi.string().optional(),
        unit: Joi.string().valid(...Object.values(CALORIES_COUNTER_UNITS)).required(),
        calories: Joi.number().required().positive().allow(0),
        protein: Joi.number().required().positive().allow(0),
        carbs: Joi.number().required().positive().allow(0),
        fats: Joi.number().required().positive().allow(0),
    })
    return schema.validate(data);
}

const dailyItemPostValidation = (data) => {
    const schema = Joi.object({
        date: Joi.number().required(),
        month: Joi.number().required(),
        year: Joi.number().required(),
        itemId: Joi.string().required().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid item id");
            }
            return true;
        }),
        amount: Joi.number().required().positive(),
        dt: Joi.date().required(),
        meal: Joi.string().valid(...Object.values(CALORIES_COUNTER_MEALS)).required()
    })
    return schema.validate(data);
}

const dailyItemUpdateValidation = (data) => {
    const schema = Joi.object({
        amount: Joi.number().optional().positive(),
        meal: Joi.string().valid(...Object.values(CALORIES_COUNTER_MEALS)).optional()
    })
    return schema.validate(data);
}

const dailyWeightPostValidation = (data) => {
    const schema = Joi.object({
        weight: Joi.number().required().positive().min(2.1).max(635),
        unit: Joi.string().valid(...Object.values(WEIGHT_UNITS)).required(),
    })
    return schema.validate(data);
}

const supplementsReminderValidation = (data) => {
    const schema = Joi.object({
        dt: Joi.date().required(),
        supplements: Joi.array().items(Joi.object({
            name: Joi.string().min(1).max(200).required(),
            intake: Joi.array().items(Joi.object({
                hours: Joi.number().required(),
                minutes: Joi.number().required()
            })),
            until: Joi.date.required()
        })).required(),
    })
    return schema.validate(data);
}

const suggestionPostValidation = (data) => {
    const schema = Joi.object({
        suggestion: Joi.string().required()
    })
    return schema.validate(data);
}

const exercisePostValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(150).required(),
        description: Joi.string().min(1).max(300).optional(),
        targetMuscles: Joi.array().items(Joi.string().required().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid muscle id");
            }
            return true;
        })).optional(),
        keywords: Joi.array().items(Joi.string().required()).optional(),
    });
    return schema.validate(data);
}

const workoutPostValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(1).max(150).required(),
        exercises: Joi.array().items(Joi.string().required().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid exercise id");
            }
            return true;
        })).required()
    })
    return schema.validate(data);
}

const workoutSessionValidation = (data) => {
    const schema = Joi.object({
        exercises: Joi.array().items(Joi.object({
            _id: Joi.string().optional(),
            exerciseId: Joi.string().required().custom((value, helper) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helper.message("Invalid exercise id");
                }
                return true;
            }).required(),
            sets: Joi.array().items(Joi.object({
                reps: Joi.alternatives().try(Joi.string().custom((value, helper) => {
                    if (value != "AMRAP") {
                        return helper.message("Invalid reps value");
                    }
                    return true;
                }).required(), Joi.number().positive()).optional(),
                duration: Joi.number().optional().positive().max(10000),
                weight: Joi.object({
                    amount: Joi.number().required().positive().max(3000),
                    unit: Joi.string().valid(...Object.values(WEIGHT_UNITS)).required()
                }).optional(),
                _id: Joi.string().optional(),
            }).required()),
            note: Joi.string().optional().allow(null).allow("")
        }).required()).required(),
    })
    return schema.validate(data);
}

const workoutTemplateCheckValidation = (data) => {
    const schema = Joi.object({
        exercises: Joi.array().items(Joi.object({
            exerciseId: Joi.string().required().custom((value, helper) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helper.message("Invalid exercise id");
                }
                return true;
            })
        }))
    });
    return schema.validate(data);
}

const relationValidation = (data) => {
    const schema = Joi.object({
        coachId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid receiver id");
            }
            return true;
        }).required(),
    });
    return schema.validate(data);
}

const relationStatusUpdateValidation = (data) => {
    const schema = Joi.object({
        status: Joi.string().valid(...Object.values(RELATION_STATUSES)).required()
    });
    return schema.validate(data);
}

const coachingReviewPostValidation = (data) => {
    const schema = Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        review: Joi.string().min(1).max(1000).optional()
    });
    return schema.validate(data);
}

const googlePlacesSearchValidation = (data) => {
    const schema = Joi.object({
        query: Joi.string().required().allow(null).allow("")
    });
    return schema.validate(data);
}

const coachApplicationPostValidation = (data) => {
    const schema = Joi.object({
        location: Joi.object({
            address: Joi.string().required(),
            lat: Joi.number().required(),
            lng: Joi.number().required(),
        }),
        prefersOfflineCoaching: Joi.boolean().required()
    });
    return schema.validate(data);
}

const chatValidation = (data) => {
    const schema = Joi.object({
        personalTrainerId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid triner id");
            }
            return true;
        }).required(),
        clientId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid client id");
            }
            return true;
        }).required()
    });
    return schema.validate(data);
}

const messageValidation = (data) => {
    const schema = Joi.object({
        senderId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid sender id");
            }
            return true;
        }).required(),
        chatId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid chat id");
            }
            return true;
        }).required(),
        message: Joi.object({
            text: Joi.string().min(0).max(1000).optional(),
            file: Joi.string().optional()
        }).required()
    });
    return schema.validate(data);
}

const contentPostValidation = (data) => {
    const schema = Joi.object({
        file: Joi.string().required(),
        visibilityScope: Joi.string().valid(...Object.values(CONTENT_VISIBILITY_SCOPES)).required(),
        isVisible: Joi.boolean().optional(),
        section: Joi.string().min(1).max(40).required(),
        title: Joi.string().min(1).max(40).required()
    });
    return schema.validate(data);
}

const contentUpdateValidation = (data) => {
    const schema = Joi.object({
        visibilityScope: Joi.string().valid(...Object.values(CONTENT_VISIBILITY_SCOPES)).required(),
        isVisible: Joi.boolean().optional(),
        section: Joi.string().min(1).max(40).required(),
        title: Joi.string().min(1).max(40).required()
    });
    return schema.validate(data);
}

const navigationAnalyticsValidation = (data) => {
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

const unknownSourceCaloriesPostValidation = (data) => {
    const schema = Joi.object({
        date: Joi.number().required(),
        month: Joi.number().required(),
        year: Joi.number().required(),
        calories: Joi.number().required().positive(),
    })
    return schema.validate(data);
}

const workoutUpdateValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(1).max(40).required(),
        exercises: Joi.array().items(Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value))
                return helper.message("Invalid exercise id");
            return true;
        })).required(),
    })
    return schema.validate(data);
}

const devicePostValidation = (data) => {
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

const forgottenPasswordPostValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    return schema.validate(data);
}

const emailVerificationPostValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    return schema.validate(data);
}

const passwordPutValidation = (data) => {
    const schema = Joi.object({
        identifier: Joi.string().required(),
        code: Joi.string().required(),
        password: Joi.string().min(8).max(100).required(),
    });
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
    supplementsReminderValidation,
    workoutTemplateCheckValidation,
    relationValidation,
    relationStatusUpdateValidation,
    coachingReviewPostValidation,
    googlePlacesSearchValidation,
    coachApplicationPostValidation,
    chatValidation,
    messageValidation,
    contentPostValidation,
    contentUpdateValidation,
    dailyItemUpdateValidation,
    navigationAnalyticsValidation,
    unknownSourceCaloriesPostValidation,
    workoutUpdateValidation,
    devicePostValidation,
    forgottenPasswordPostValidation,
    passwordPutValidation,
    emailVerificationPostValidation
}