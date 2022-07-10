module.exports.errorCodes = {
    0: {
        en: ["Authentication token is not provided"],
        bg: ["Автентификационен ключ не е предоставен"]
    },
    1: {
        en: ["Authentication token verification failed"],
        bg: ["Валидирането на автентификационния ключ е неуспешно"]
    },
    2: {
        en: ["The user for the provided authentication token was not found"],
        bg: ["Потребителят, асоцииран с този автентификационен ключ не е намерен"]
    },
    3: {
        en: ["The authentication token has expired"],
        bg: ["Автентикационният ключ е изтекъл"]
    },
    4: {
        en: ["Invalid date parameter"],
        bg: ["Невалиден date параметър"]
    },
    5: {
        en: ["Invalid id parameter/s"],
        bg: ["Невалиден id параметър/ри"]
    },
    6: {
        en: ["Unknown source calories record was not found"],
        bg: ["Няма съществуващ запис на калориите от незнаен източник"]
    },
    7: {
        en: ["You are not allowed to delete this unknown source calories record"],
        bg: ["Нямате право да изтриете този запис на калориите от незнаен източник"]
    },
    8: {
        en: ["Food with the provided title, calories and macros already exists"],
        bg: ["Храна с дадените имена, калории и макронутриенти вече съществува"]
    },
    9: {
        en: ["There is a mismatch between the calories and macros in the provided food"],
        bg: ["Има несъответствие между калориите и макронутриентите на дадената храна"]
    },
    10: {
        en: ["Food for the provided id was not found"],
        bg: ["Храна по дадения идентификатор не е намерена"]
    },
    11: {
        en: ["You are not allowed to delete this calories counter day"],
        bg: ["Нямате право да изтриете този запис на дневен прием на калории"]
    },
    12: {
        en: ["Calories counter day was not found"],
        bg: ["Няма съществуващ запис на дневен прием на калории"]
    },
    13: {
        en: ["You are not allowed to delete this food from the calories counter day"],
        bg: ["Нямате право да изтриете този запис на храна на дневен прием на калории"]
    },
    14: {
        en: ["You are not allowed to update this calories counter day"],
        bg: ["Нямате право да обновите този запис на дневен прием на калории"]
    },
    15: {
        en: ["Invalid clientId parameter"],
        bg: ["Невалиден clientId параметър"]
    },
    16: {
        en: ["Client record not found"],
        bg: ["Няма съществуващ запис на клиента"]
    },
    17: {
        en: ["Personal trainer record not found"],
        bg: ["Няма съществуващ запис на личен треньор"]
    },
    18: {
        en: ["You are not allowed to access users' data without being one of their active coaches"],
        bg: ["Нямате право да преглеждате данните на потребителите, когато не сте техен активен личен треньор"]
    },
    19: {
        en: ["Barcode parameter is missing"],
        bg: ["Barcode параметър липсва"]
    },
    20: {
        en: ["Invalid barcode parameter"],
        bg: ["Невалиден barcode параметър"]
    },
    21: {
        en: ["Invalid chatId parameter"],
        bg: ["Невалиден chatId параметър"]
    },
    22: {
        en: ["Chat record was not found"],
        bg: ["Няма съществуващ запис на чата"]
    },
    23: {
        en: ["You are not allowed to access chats in which you are not a client or a personal trainer"],
        bg: ["Нямате право да преглеждате чатове, в което не сте нито клиент, нито личен треньор"]
    },
    24: {
        en: ["The record for the opposite user in the chat was not found"],
        bg: ["Записът на другия потребител в чата не беше намерен"]
    },
    25: {
        en: ["Invalid messageId parameter"],
        bg: ["Невалиден messageId параметър"]
    },
    26: {
        en: ["You have already submitted a personal trainer application"],
        bg: ["Вече сте изпратили заявка за личен треньор"]
    },
    27: {
        en: ["The personal trainer is not accepting requests, currently"],
        bg: ["Личният треньор не приема заявки към този момент"]
    },
    28: {
        en: ["You are not allowed to be your own personal trainer"],
        bg: ["Нямате право да бъдете свой собствен личен треньор"]
    },
    29: {
        en: ["You have already sent a coaching request to this personal trainer or you are already their client"],
        bg: ["Вече сте изпратили заявка да бъдете тренирани до този личен треньор или вече сте негов/неин клиент"]
    },
    30: {
        en: ["Invalid relationId parameter"],
        bg: ["Невалиден relationId параметър"]
    },
    31: {
        en: ["The coaching relation is not in a pending status and thus cannot be deleted"],
        bg: ["Заявката за трениране не очаква отговор от личния треньор и следователно не може да бъде изтрита"]
    },
    32: {
        en: ["You are not allowed to delete this coaching relation"],
        bg: ["Нямате право да изтриете тази връзка между личен треньор и клиент"]
    },
    33: {
        en: ["Relation record was not found"],
        bg: ["Връзката между личен треньор и клиент не беше намерена"]
    },
    34: {
        en: ["The relation status cannot be updated in such a way"],
        bg: ["Статусът на връзката между личен треньор и клиент не може да бъде актуализиран по такъв начин"]
    },
    35: {
        en: ["You are not allowed to leave a review on a non-canceled or non-declined relation"],
        bg: ["Нямате право да публикувате отзив за връзка между личен треньор и клиент, която не е отказана или завършена"]
    },
    36: {
        en: ["Only clients are allowed to leave reviews"],
        bg: ["Само клиенти могат да публикуват отзиви"]
    },
    37: {
        en: ["Review for this relation has already been posted"],
        bg: ["Отзив за тази връзка между личен треньор и клиент вече е публикуван"]
    },
    38: {
        en: ["Latitude and longitude parameters must be provided when maxDistance parameter is provided"],
        bg: ["Latitude и longitude параметри трябва да бъдат подадени, когато maxDistance параметърът е подаден"]
    },
    39: {
        en: ["User record was not found"],
        bg: ["Запис на потребителят не беше намерен"]
    },
    40: {
        en: ["Exercise record was not found"],
        bg: ["Запис на упражнението не беше намерен"]
    },
    41: {
        en: ["Invalid workoutId parameter"],
        bg: ["Невалиден workoutId параметър"]
    },
    42: {
        en: ["Workout record was not found"],
        bg: ["Запис на тренировката не беше намерен"]
    },
    43: {
        en: ["You are not allowed to delete this workout"],
        bg: ["Нямате право да изтриете тази тренировка"]
    },
    44: {
        en: ["You are not allowed to update this workout"],
        bg: ["Нямате право да обновите тази тренировка"]
    },
    45: {
        en: ["You are not allowed to delete this daily weight"],
        bg: ["Нямате право да изтриете този запис на тегло"]
    },
    46: {
        en: ["User record with this email address already exists"],
        bg: ["Запис на потребител с този имейл вече съществува"]
    },
    47: {
        en: ["User record with this email was not found"],
        bg: ["Запис на потребител с този имейл не беше намерен"]
    },
    48: {
        en: ["Invalid password"],
        bg: ["Невалидна парола"]
    },
    49: {
        en: ["Password recovery is available only for users with verified email addresses"],
        bg: ["Възтановяването на парола е възможна само за потребители с потвърдени имейли"]
    },
    50: {
        en: ["Code and identifier parameters must be provided"],
        bg: ["Code и identifier параметри трябва да бъдат подадени"]
    },
    51: {
        en: ["Invalid password recovery code"],
        bg: ["Невалиден код за възстановяване на парола"]
    },
    52: {
        en: ["Password recovery code has already been used"],
        bg: ["Кодът за възстановяване на паролата вече е използван"]
    },
    53: {
        en: ["Password recovery code has expired"],
        bg: ["Кодът за възстановяване на паролата е изтекъл"]
    },
    54: {
        en: ["Password recovery code record was not found"],
        bg: ["Записът на код за възстановяване на парола не беше намерен"]
    },
    55: {
        en: ["User email is already verified"],
        bg: ["Потребителският имейл вече е потвърден"]
    },
    56: {
        en: ["Invalid email verification code"],
        bg: ["Невалиден код за потвърждение на имейл"]
    },
    57: {
        en: ["Email verification code has expired"],
        bg: ["Кодът за потвърждение на имейл е изтекъл"]
    },
    58: {
        en: ["Invalid credentials for login"],
        bg: ["Неверни данни за вход"]
    },
    59: {
        en: ["Message not found"],
        bg: ["Няма съществуващ запис на съобщението"]
    },
    60: {
        en: ["You are not allowed to post content if your personal trainer account is not active"],
        bg: ["Нямате право да добавяте съдържание, ако нямате активен треньорски акаунт"]
    },
    61: {
        en: ["Content not found"],
        bg: ["Няма съществуващ запис на съдържанието"]
    },
    62: {
        en: ["You are not allowed to delete this content"],
        bg: ["Нямате право да изтриете този запис на съдържание"]
    },
    63: {
        en: ["Blocked content cannot be deleted"],
        bg: ["Блокирано съдържание не може да бъде изтрито"]
    },
    64: {
        en: [""],
        bg: [""]
    },
    65: {
        en: [""],
        bg: [""]
    },
}