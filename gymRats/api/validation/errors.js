const translations = require("./translations");

const HapiErrors = {
    stringBaseError: (lng, field, min) => {
        return `${translations[lng].fields[field]} ${translations[lng].errors.stringBaseError[0]} ${min} ${translations[lng].errors.stringBaseError[1]}`;
    },
    stringEmptyError: (lng, field) => {
        return `${translations[lng].fields[field]} ${translations[lng].errors.stringBaseError[0]}`;
    },
    anyRequiredError: (lng, field) => {
        return `${translations[lng].fields[field]} ${translations[lng].errors.anyRequiredError[0]}`;
    },
    stringMinError: (lng, field, min) => {
        return `${translations[lng].fields[field]} ${translations[lng].errors.stringMinError[0]} ${min} ${translations[lng].errors.stringMinError[1]}`;
    },
    stringMaxError: (lng, field, max) => {
        return `${translations[lng].fields[field]} ${translations[lng].errors.stringMaxError[0]} ${max} ${translations[lng].errors.stringMaxError[1]}`;
    },
    stringEmailError: (lng, field) => {
        return `${translations[lng].fields[field]} ${translations[lng].errors.stringEmailError[0]}`;
    },
    invalidIdError: (lng, field) => {
        return `${translations[lng].errors.invalidIdError[0]} ${translations[lng].fields[field]} ${translations[lng].errors.invalidIdError[1]}`;
    },
    numberMinError: (lng, field, min) => {
        return `${translations[lng].fields[field]} ${translations[lng].errors.numberMinError[0]} ${min}`;
    },
    numberMaxError: (lng, field, max) => {
        return `${translations[lng].fields[field]} ${translations[lng].errors.numberMaxError[0]} ${max}`;
    }
}

module.exports = HapiErrors;