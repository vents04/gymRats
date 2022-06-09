const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const { CALORIES_COUNTER_UNITS, WEIGHT_UNITS, CALORIES_COUNTER_MEALS, REQUEST_STATUSES, CHAT_STATUSES, RELATION_STATUSES, CONTENT_VISIBILITY_SCOPES } = require('../global');
const { stringBaseError, stringEmptyError, anyRequiredError, stringMinError, stringMaxError, stringEmailError, invalidIdError, numberMinError, numberMaxError } = require('./errors');

const firstNameValidation = (lng) => {
    if (!lng) lng = "en";
    return Joi.string().min(1).max(32).required().messages({
        "string.base": stringBaseError(lng, "firstName", 1),
        "string.empty": stringEmptyError(lng, "firstName"),
        "string.min": stringMinError(lng, "firstName", 1),
        "string.max": stringMaxError(lng, "firstName", 32),
        "any.required": anyRequiredError(lng, "firstName")
    }).regex(/^[A-Za-z]+$/)
}

const lastNameValidation = (lng) => {
    if (!lng) lng = "en";
    return Joi.string().min(1).max(32).required().messages({
        "string.base": stringBaseError(lng, "lastName", 1),
        "string.empty": stringEmptyError(lng, "lastName"),
        "string.min": stringMinError(lng, "lastName", 1),
        "string.max": stringMaxError(lng, "lastName", 32),
        "any.required": anyRequiredError(lng, "lastName")
    }).regex(/^[A-Za-z]+$/)
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
    })
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
        firstName: firstNameValidation(lng),
        lastName: lastNameValidation(lng),
        weightUnit: Joi.string().valid(...Object.values(WEIGHT_UNITS)).messages({
            "string.base": stringBaseError(lng, "weightUnit", 1),
            "string.empty": stringEmptyError(lng, "weightUnit"),
            "any.required": anyRequiredError(lng, "weightUnit")
        }),
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
        brand: Joi.string().min(1).max(300).required().messages({
            "string.base": stringBaseError(lng, "brand", 1),
            "string.empty": stringEmptyError(lng, "brand"),
            "string.min": stringMinError(lng, "brand", 1),
            "string.max": stringMaxError(lng, "brand", 300),
            "any.required": anyRequiredError(lng, "brand")
        }),
        barcode: Joi.string().optional(),
        unit: Joi.string().valid(...Object.values(CALORIES_COUNTER_UNITS)).required(),
        calories: Joi.number().required().positive().allow(0).messages({
            "number.min": numberMinError(lng, "calories", 0),
            "any.required": anyRequiredError(lng, "calories"),
        }),
        protein: Joi.number().required().positive().allow(0).min(0).messages({
            "number.min": numberMinError(lng, "protein", 0),
            "any.required": anyRequiredError(lng, "protein"),
        }),
        carbs: Joi.number().required().positive().allow(0).min(0).messages({
            "number.min": numberMinError(lng, "carbs", 0),
            "any.required": anyRequiredError(lng, "carbs"),
        }),
        fats: Joi.number().required().positive().allow(0).min(0).messages({
            "number.min": numberMinError(lng, "fats", 0),
            "any.required": anyRequiredError(lng, "fats"),
        }),
    })
    return schema.validate(data);
}

const dailyItemPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        date: Joi.number().required().messages({
            "any.required": anyRequiredError(lng, "date")
        }),
        month: Joi.number().required().messages({
            "any.required": anyRequiredError(lng, "month")
        }),
        year: Joi.number().required().messages({
            "any.required": anyRequiredError(lng, "year")
        }),
        itemId: Joi.string().required().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message(invalidIdError(lng, "item"));
            }
            return true;
        }),
        amount: Joi.number().required().positive().min(0).messages({
            "number.min": numberMinError(lng, "amount", 0),
            "any.required": anyRequiredError(lng, "amount"),
        }),
        dt: Joi.date().required().messages({
            "any.required": anyRequiredError(lng, "date")
        }),
        meal: Joi.string().valid(...Object.values(CALORIES_COUNTER_MEALS)).required().messages({
            "string.base": stringBaseError(lng, "meal", 1),
            "string.empty": stringEmptyError(lng, "meal"),
            "any.required": anyRequiredError(lng, "meal")
        })
    })
    return schema.validate(data);
}

const dailyItemUpdateValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        amount: Joi.number().optional().positive().min(0).messages({
            "number.min": numberMinError(lng, "amount", 0),
            "any.required": anyRequiredError(lng, "amount"),
        }),
        meal: Joi.string().valid(...Object.values(CALORIES_COUNTER_MEALS)).optional().messages({
            "string.base": stringBaseError(lng, "meal", 1),
            "string.empty": stringEmptyError(lng, "meal"),
            "any.required": anyRequiredError(lng, "meal")
        })
    })
    return schema.validate(data);
}

const dailyWeightPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        weight: Joi.number().required().positive().min(2.1).max(635).messages({
            "number.min": numberMinError(lng, "weight", 2.1),
            "number.max": numberMaxError(lng, "weight", 635),
            "any.required": anyRequiredError(lng, "weight"),
        }),
        unit: Joi.string().valid(...Object.values(WEIGHT_UNITS)).required().messages({
            "string.base": stringBaseError(lng, "weightUnit", 1),
            "string.empty": stringEmptyError(lng, "weightUnit"),
            "any.required": anyRequiredError(lng, "weightUnit")
        }),
    })
    return schema.validate(data);
}

const supplementsReminderValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        dt: Joi.date().required().messages({
            "any.required": anyRequiredError(lng, "date")
        }),
        supplements: Joi.array().items(Joi.object({
            name: Joi.string().min(1).max(200).required().messages({
                "string.min": numberMinError(lng, "name", 1),
                "string.max": numberMaxError(lng, "name", 200),
                "any.required": anyRequiredError(lng, "name")
            }),
            intake: Joi.array().items(Joi.object({
                hours: Joi.number().required().messages({
                    "any.required": anyRequiredError(lng, "hours")
                }),
                minutes: Joi.number().required().messages({
                    "any.required": anyRequiredError(lng, "minutes")
                })
            })),
            until: Joi.date.required()
        })).required(),
    })
    return schema.validate(data);
}

const suggestionPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        suggestion: Joi.string().required()
    })
    return schema.validate(data);
}

const exercisePostValidation = (data, lng) => {
    if (!lng) lng = "en";
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

const workoutPostValidation = (data, lng) => {
    if (!lng) lng = "en";
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

const workoutSessionValidation = (data, lng) => {
    if (!lng) lng = "en";
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

const workoutTemplateCheckValidation = (data, lng) => {
    if (!lng) lng = "en";
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

const relationValidation = (data, lng) => {
    if (!lng) lng = "en";
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

const relationStatusUpdateValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        status: Joi.string().valid(...Object.values(RELATION_STATUSES)).required()
    });
    return schema.validate(data);
}

const coachingReviewPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        review: Joi.string().min(1).max(1000).optional()
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
            address: Joi.string().required(),
            lat: Joi.number().required(),
            lng: Joi.number().required(),
        }),
        prefersOfflineCoaching: Joi.boolean().required()
    });
    return schema.validate(data);
}

const chatValidation = (data, lng) => {
    if (!lng) lng = "en";
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

const messageValidation = (data, lng) => {
    if (!lng) lng = "en";
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

const contentPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        file: Joi.string().required(),
        visibilityScope: Joi.string().valid(...Object.values(CONTENT_VISIBILITY_SCOPES)).required(),
        isVisible: Joi.boolean().optional(),
        section: Joi.string().min(1).max(40).required(),
        title: Joi.string().min(1).max(40).required()
    });
    return schema.validate(data);
}

const contentUpdateValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        visibilityScope: Joi.string().valid(...Object.values(CONTENT_VISIBILITY_SCOPES)).required(),
        isVisible: Joi.boolean().optional(),
        section: Joi.string().min(1).max(40).required(),
        title: Joi.string().min(1).max(40).required()
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
        date: Joi.number().required(),
        month: Joi.number().required(),
        year: Joi.number().required(),
        calories: Joi.number().required().positive(),
    })
    return schema.validate(data);
}

const workoutUpdateValidation = (data, lng) => {
    if (!lng) lng = "en";
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
        email: Joi.string().email().required()
    });
    return schema.validate(data);
}

const emailVerificationPostValidation = (data, lng) => {
    if (!lng) lng = "en";
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    return schema.validate(data);
}

const passwordPutValidation = (data, lng) => {
    if (!lng) lng = "en";
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