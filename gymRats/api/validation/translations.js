module.exports = {
    en: {
        fields: {
            firstName: "First name",
            lastName: "Last name",
            email: "Email",
            password: "Password",
            weightUnit: "Weight unit",
            profilePicture: "ProfilePicture",
            title: "Title",
            brand: "Brand",
            item: "item",
            calories: "Calories",
            protein: "Protein",
            carbs: "Carbs",
            fat: "Fat",
            date: "Date",
            month: "Month",
            year: "Year",
            amount: "Amount",
            meals: "Meals",
            weight: "Weight",
            name: "Name",
            code: "Code",
            identifier: "Identifier",
            workoutName: "Workout name",
            exercises: "Exercises",
            exercise: "Exercise",
        },
        errors: {
            stringBaseError: ["must be a string with at least", "characters"],
            stringEmptyError: ["should not be empty"],
            anyRequiredError: ["is a required field"],
            stringMinError: ["should have at least", "characters"],
            stringMaxError: ["should have at most", "characters"],
            stringEmailError: ["should be a valid email address"],
            invalidIdError: ["is an invalid id", ""],
            numberMinError: ["should be greater than"],
            numberMaxError: ["should be less than"],
            numberPositiveError: ["should be a positive number"],
            numberIntegerError: ["should be an integer"],
            arrayIncludesError: ["The array of", "includes an invalid value"],
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
            title: "Заглавието",
            brand: "Марката",
            item: "продукт",
            calories: "Калориите",
            protein: "Протеина",
            carbs: "Въглехидратите",
            fat: "Мазнините",
            date: "Датата",
            month: "Месеца",
            year: "Годината",
            amount: "Количеството",
            meals: "Типът ядене",
            weight: "Теглото",
            name: "Името",
            code: "Кодът",
            identifier: "Идентификаторът",
            workoutName: "Заглавието на тренировката",
            exercises: "Упражненията",
            exercise: "Упражнение"
        },
        errors: {
            stringBaseError: ["трябва да бъде текст с поне", "символа"],
            stringEmptyError: ["не трябва да е празно"],
            anyRequiredError: ["е задължително поле"],
            stringMinError: ["трябва да има поне", "символа"],
            stringMaxError: ["трябва да има най-много", "символа"],
            stringEmailError: ["трябва да бъде валиден имейл"],
            invalidIdError: ["е невалиден идентификатор", ""],
            numberPositiveError: ["трябва да е положително число"],
            numberIntegerError: ["трябва да е цяло число"],
            arrayIncludesError: ["Масивът с", "има невалидни стойности"],
        }
    }
}