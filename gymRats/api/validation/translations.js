module.exports = {
    en: {
        fields: {
            firstName: "First name",
            lastName: "Last name",
            email: "Email",
            password: "Password",
            weightUnit: "Weight unit",
            profilePicture: "ProfilePicture",
        },
        errors: {
            stringBaseError: ["must be a string with at least", "characters"],
            stringEmptyError: ["should not be empty"],
            anyRequiredError: ["is a required field"]
        }
    },
    bg: {
        fields: {
            firstName: "Името",
            lastName: "Фамилията",
            email: "Имейлът",
            password: "Паролата",
            weightUnit: "Мерната единица за тегло",
            profilePicture: "Профилната снимка",
        },
        errors: {
            stringBaseError: ["трябва да бъде текст с поне", "символа"],
            stringEmptyError: ["не трябва да е празно"],
            anyRequiredError: ["е задължително поле"]
        }
    }
}