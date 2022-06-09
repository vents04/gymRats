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
    }
}

module.exports = HapiErrors;