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
            suggestion: "Suggestion",
            description: "Description",
            muscle: "muscle",
            targetMuscles: "Target muscles",
            keyword: "Keyword",
            exercise: "exercise",
            reps: "Reps",
            duration: "Duration",
            code: "Code",
            identifier: "Identifier",
            workoutName: "Workout name",
            exercises: "Exercises",
            exercise: "Exercise",
            message: "Message object",
            messageText: "Message text",
            senderId: "The id of the sender",
            chatId: "The id of the chat",
            receiver: "Reciever",
            status: "Status",
            rating: "Rating",
            review: "Review",
            address: "Address",
            lat: "Latitude",
            lng: "Longitude",
            trainer: "Trainer",
            client: "Client",
            foodUnit: "Food unit",
            foodDt: "Food add date and time",
            muscles: "Muscles",
            keywords: "Keywords",
            sets: "Sets",
            prefersOfflineCoaching: "Preference for coaching offline",
            initiatorId: "The id of the initiator",
            recieverId: "The id of the receiver"
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
            stringAlphabeticalRegexError: ["should consist only of letters"],
            anyOnlyError: ["is with an invalid format"],
            numberPrecisionError: ["should have at most 2 digits past the decimal point"],
            invalidRepsValue: ["Invalid reps value"],
            booleanBaseError: ["has an invalid boolean value"],
            lettersOnlyError: ["should be only of letters"]
        }
    },
    bg: {
        fields: {
            firstName: "Име",
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
            suggestion: "Предложението",
            description: "Описанието",
            muscle: "мускол",
            targetMuscles: "Таргетираните мусколи",
            keyword: "Ключовата дума",
            exercise: "упражнение",
            reps: "Повторенията",
            duration: "Продължителността",
            code: "Кодът",
            identifier: "Идентификаторът",
            workoutName: "Заглавието на тренировката",
            exercises: "Упражненията",
            exercise: "Упражнение",
            message: "Обектът на съобщението",
            messageText: "Текстът на съобщението",
            senderId: "Идентификаторът на изпращащия",
            chatId: "Идентификаторът на чата",
            receiver: "Получател",
            status: "Статусa",
            rating: "Рейтингът",
            review: "Отзивът",
            address: "Адресът",
            lat: "Географската ширина",
            lng: "Географската дължина",
            trainer: "Треньор",
            client: "Клиент",
            foodUnit: "Мерната единица за храна",
            foodDt: "Времето на добавяне на храната",
            muscles: "Мускулите",
            keywords: "Ключовите думи",
            sets: "Сериите",
            prefersOfflineCoaching: "Предпочитанието за работа на живо",
            initiatorId: "Идентификаторът на инициатора",
            recieverId: "Идентификаторът на получателя"
        },
        errors: {
            stringBaseError: ["трябва да бъде текст с поне", "символа"],
            stringEmptyError: ["не трябва да е празно"],
            anyRequiredError: ["е задължително поле"],
            stringMinError: ["трябва да има поне", "символа"],
            stringMaxError: ["трябва да има най-много", "символа"],
            stringEmailError: ["трябва да бъде валиден имейл"],
            invalidIdError: ["е невалиден идентификатор", ""],
            numberMinError: ["трябва да е по-голямо от"],
            numberMaxError: ["трябва да е по-малко от"],
            numberPositiveError: ["трябва да е положително число"],
            numberIntegerError: ["трябва да е цяло число"],
            arrayIncludesError: ["Масивът с", "има невалидни стойности"],
            stringAlphabeticalRegexError: ["трябва да съдържа само букви"],
            anyOnlyError: ["не е в подходящ формат"],
            numberPrecisionError: ["трябва да има максимум", "цифри след десетичната запетая"],
            invalidRepsValue: ["Невалидна стойност за повторения"],
            booleanBaseError: ["има невалидна булева стойност"],
            lettersOnlyError: ["трябва да е само от букви"]
        }
    }
}