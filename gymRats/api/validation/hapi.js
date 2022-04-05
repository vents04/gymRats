const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const { CALORIES_COUNTER_UNITS, WEIGHT_UNITS, WATER_INTAKE_UNITS, CALORIES_COUNTER_MEALS, REQUEST_STATUSES , CHAT_STATUSES, RELATION_STATUSES} = require('../global');

const signupValidation = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().min(1).max(200).required().messages({
            "string.base": `First name should have at least 1 character`,
            "string.empty": `First name should not be empty`,
            "string.min": `First name should have at least 1 character`,
            "string.max": `First name should have at most 200 characters`,
            "any.required": `First name is a required field`
        }),
        lastName: Joi.string().min(1).max(200).required().messages({
            "string.base": `Last name should have at least 1 character`,
            "string.empty": `Last name should not be empty`,
            "string.min": `Last name should have at least 1 character`,
            "string.max": `Last name should have at most 200 characters`,
            "any.required": `Last name is a required field`
        }),
        email: Joi.string().email().min(3).max(320).required().messages({
            "string.base": `Email should have at least 3 characters`,
            "string.empty": `Email should not be empty`,
            "string.min": `Email should have at least 3 characters`,
            "string.email": `Email should be a valid email address`,
            "string.max": `Email should have at most 320 characters`,
            "any.required": `Email is a required field`
        }),
        password: Joi.string().min(8).max(100).required().messages({
            "string.base": `Password should have at least 8 characters`,
            "string.empty": `Password should not be empty`,
            "string.min": `Password should have at least 8 characters`,
            "string.max": `Password should have at most 100 characters`,
            "any.required": `Password is a required field`
        })
    })
    return schema.validate(data);
}

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().max(320).required().messages({
            "string.base": `Email should have at least 1 characters`,
            "string.empty": `Email should not be empty`,
            "string.email": `Email should be a valid email address`,
            "string.max": `Email should have at most 320 characters`,
            "any.required": `Email is a required field`
        }),
        password: Joi.string().max(100).required().messages({
            "string.base": `Password should have at least 1 character`,
            "string.empty": `Password should not be empty`,
            "string.max": `Password should have at most 100 characters`,
            "any.required": `Password is a required field`
        })
    })
    return schema.validate(data);
}

const userUpdateValidation = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().min(1).max(200).messages({
            "string.base": `First name should have at least 1 character`,
            "string.empty": `First name should not be empty`,
            "string.min": `First name should have at least 1 character`,
            "string.max": `First name should have at most 200 characters`,
            "any.required": `First name is a required field`
        }),
        lastName: Joi.string().min(1).max(200).messages({
            "string.base": `Last name should have at least 1 character`,
            "string.empty": `Last name should not be empty`,
            "string.min": `Last name should have at least 1 character`,
            "string.max": `Last name should have at most 200 characters`,
        }),
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
        title: Joi.string().min(1).max(300).required(),
        barcode: Joi.string().optional(),
        img: Joi.string().optional(),
        userId: Joi.string().optional().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid user id");
            }
            return true;
        }),
        unit: Joi.string().valid(...Object.values(CALORIES_COUNTER_UNITS)).required(),
        calories: Joi.number().required(),
        protein: Joi.number().required(),
        carbs: Joi.number().required(),
        fats: Joi.number().required(),
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
        amount: Joi.number().required(),
        dt: Joi.date().required(),
        meal: Joi.string().valid(...Object.values(CALORIES_COUNTER_MEALS)).required()
    })
    return schema.validate(data);
}

const dailyGoalPostValidation = (data) => {
    const schema = Joi.object({
        calories: Joi.number().required(),
        protein: Joi.number().required(),
        carbs: Joi.number().required(),
        fats: Joi.number().required()
    })
    return schema.validate(data);
}

const dailyWeightPostValidation = (data) => {
    const schema = Joi.object({
        weight: Joi.number().required(),
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

const dailyWaterIntakeGoalPostValidation = (data) => {
    const schema = Joi.object({
        amount: Jou.number().required(),
        unit: Joi.string().valid(...Object.values(WATER_INTAKE_UNITS)).required()
    })
    return schema.validate(data);
}

const dailyWaterIntakePutValidation = (data) => {
    const schema = Joi.object({
        amount: Joi.number().required(),
        date: Joi.number().required(),
        month: Joi.number().required(),
        year: Joi.number().required()
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
                }).required(), Joi.number()).optional(),
                duration: Joi.number().optional(),
                weight: Joi.object({
                    amount: Joi.number().required(),
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
                return helper.message("Invalid reciever id");
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
        rating: Joi.number().min(0).max(5).required(),
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
        trainerId: Joi.string().custom((value, helper) => {
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

module.exports = {
    signupValidation,
    loginValidation,
    userUpdateValidation,
    itemPostValidation,
    dailyItemPostValidation,
    dailyGoalPostValidation,
    dailyWeightPostValidation,
    dailyWaterIntakeGoalPostValidation,
    dailyWaterIntakePutValidation,
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
    messageValidation
}