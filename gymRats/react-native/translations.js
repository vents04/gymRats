module.exports = {
    en: {
        screens: {
            login: {
                pageTitle: "Login",
                emailPlaceholder: "Email:",
                passwordPlaceholder: "Password:",
                submitButton: "Continue",
                forgottenPassword: "Forgotten password?",
                dontHaveAccount: "Don't have an account?",
                goToSignup: "Go to Signup"
            },
            signup: {
                pageTitle: "Signup",
                firstNamePlaceholder: "First name:",
                lastNamePlaceholder: "Last name:",
                emailPlaceholder: "Email:",
                passwordPlaceholder: "Password:",
                submitButton: "Create account",
                haveAccount: "Have an account?",
                goToLogin: "Go to Login"
            },
            calendar: {
                calendarControllerBack: "Previous",
                calendarControllerNext: "Next",
                addData: "Add data",
                noData: "No data added for that date",
                bottomSheetTitle: "Cards",
                bottomSheetNoCards: "You have already added all type of cards"
            },
            profile: {
                profileLoadingError: "There was a problem loading your profile. Try again or contact support on support@uploy.app",
                profilePictureUpdateError: "There was a problem uploading the profile picture. Please try again or contact support at support@uploy.app",
                logout: "Logout",
                weightUnitSectionTitle: "Metric system",
                weightUnitSectionSelectValues: {
                    KILOGRAMS: "Metric system (kilogram, om)",
                    POUNDS: "Imperial system (pound, ft, in)"
                }
            },
            profileEdit: {
                pageTitle: "Profile edit",
                inputFields: {
                    firstName: {
                        title: "First name",
                        placeholder: "First name:"
                    },
                    lastName: {
                        title: "Last name",
                        placeholder: "Last name:"
                    },
                    metricSystem: {
                        title: "Metric system",
                        labels: {
                            KILOGRAMS: "Metric system (kilogram, om)",
                            POUNDS: "Imperial system (pound, ft, in)"
                        }
                    }
                },
                removeProfilePicture: "Remove profile picture"
            },
            coachSearch: {
                pageTitle: "Coach search",
                reviews: "reviews",
                noCoachesFound: "No coaches found for that search"
            },
            coachRequests: {
                pageTitle: "Unanswered requests",
                pageDescriptor: "Users that have requested to be coached by you:",
            },
            coachPage: {
                pageTitle: "Coach",
                clients: "clients",
                rating: "rating",
                experience: "experience",
                prefersOfflineCoaching: "This coach prefers to work with clients in person (offline).",
                actionButton: "Request to be coached"
            },
            coachingApplicationSubmission: {
                pageTitle: "Application submission",
                locationInputPlaceholder: "Where are you located?",
                prefersOfflineCoachingText: "Do you prefer to work with clients only in person?",
                processDescriptor: "Our team will review your application as soon as possible.",
                actionButton: "Submit application"
            },
            emailVerification: {
                pageTitle: "Email verification",
                enterEmailVerificationCode: "Enter the code sent to your email:",
                doesNotComeFromSignup: "Your email has not been verified, yet. To continue using our services, please enter the code we have just sent to your email inbox.",
                actionButton: "Verify email",
                emailVerified: "Email verified",
                alertText: "Your email has been successfully verified. You can now use our services.",
            },
            passwordRecovery: {
                pageTitle: "Password recovery",
                enterCode: "Enter code:",
                enterNewPassword: "Enter new password:",
                repeatNewPassword: "Repeat new password:",
                enterAccountEmail: "Enter your account email:",
                sentRecoveryCode: "Sent recovery code",
                recievedCode: "We have sent a recovery code to your email. Please, enter it here to continue the password recovery process.",
                actionButton: "Check code",
                passwordUpdated: "Password updated",
                alertText: "Your password has been updated successfully. You can now login with your new password."
            },
            chats: {
                noChats: "Chats with clients and coaches will appear here"
            },
            barcodeReader: {
                barcodeAlreadyExistsErrorTitle: "Barcode already exists",
                barcodeAlreadyExistsErrorMessage: "This barcode is already associated with a food item. Please, scan a different barcode.",
                requestingCameraPermission: "Requesting camera permission",
                noCameraAccess: "No access to camera",
                allowCamera: "Allow camera",
                scanBarcode: "Scan barcode",
                barcodeNotFound: "Barcode not found",
                scan: "Scan / enter again",
                addFood: "Add this food to Gym Rats",
                enterBarcode: "Enter barcode:",
                submitBarcode: "Submit barcode"
            },
            suggestions: {
                pageTitle: "Suggestions",
                incentive: "Become a part of Gym Rats by suggesting features you'd like having or help us catch bugs early for a more seamless experience for all the gym rats out there.",
                placeholder: "Type here...",
                pendingReview: "Pending review",
                answered: "Answered",
            },
            progress: {
                pageTitle: "Progress",
                weightTracker: "Weight tracker",
                minorWeightLost: "Minor weight lost",
                efficientWeightLoss: "Efficient weight loss",
                efficientWeightGain: "Efficient weight gain",
                tooRapidWeightLoss: "Too rapid weight loss",
                tooRapidWeightGain: "Too rapid weight gain",
                minorWeightGain: "Minor weight gain",
                tipsToImproove: "Tips to improve",
                logbook: "Logbook",
                selectExercise: "Select an exercise",
                trendFromLastSession: "Trend from last session",
                rapidStrengthGain: "Rapid strength gain",
                strengthGain: "Strength gain",
                slightStrengthGain: "Slight strength gain",
                noNotableChange: "No notable change",
                slightStrengthLoss: "Slight strength loss",
                strengthLoss: "Strength loss",
                rapidStrengthLoss: "Rapid strength loss",
                generalTrend: "General trend:",
                atLeastTwoSessions: "Finish at least two sessions with this exercise to unlock the progress functionality",
                addWorkoutSession: "Add a workout session",
                selectExercise: "Please, select an exercise to show progress charts for.",
                messageToUser: "After adding some data you will have the ability to monitor your progress from this tab as well as get software-based suggestions on how to improve your fitness.",
                letsUnlockThisTab: "Let's unlock this tab!"
            }
        },
        components: {
            cards: {
                logbook: {
                    cardTitle: "Workout",
                    redirectButton: "Info and progress",
                    for: "for",
                    seconds: "seconds",
                    with: "with"
                },
                weightTracker: {
                    cardTitle: "Weight",
                    gainedWeight: "gained compared to last measurement",
                    lostWeight: "lost compared to last measurement",
                    redirectButton: "More info"
                },
                caloriesIntake: {
                    cardTitle: "Calories intake",
                    calories: "Calories",
                    carbs: "Carbs",
                    grams: "g",
                    proteins: "Proteins",
                    fats: "Fats",
                    noFoodAdded: "No food added",
                    redirectButton: "Add or update food"
                }
            },
            confirmationBox: {
                question: "Are you sure?",
                affirmation: "Yes",
                denial: "No"
            },
            chatsItem: {
                fileSent: "File sent"
            },
            coachRequestItem: {
                acceptRequest: "Accept request"
            },
            message: {
                clickToPreview: "Click to preview",
                downloading: "Downloading...",
                fileDownloadErrorTitle: "File download error",
                fileDownloadErrorDescription: "There was an error while downloading and saving this file to your system",
                fileDownloadSuccessTitle: "Downloaded successfully",
                fileDownloadSuccessDescription: ["The file", ".", "was downloaded to the folder named Gym Rats"],
                download: "Download"
            }
        },
        navigation: {
            calendar: "Calendar",
            progress: "Progress",
            coaching: "Coaching",
            chats: "Chats",
            profile: "Profile"
        },
        common: {
            saving: "Saving...",
            loading: "Loading...",
            set: "set",
            sets: "sets",
            rep: "rep",
            reps: "reps",
            weight: "weight",
            duration: "duration",
        },
        errors: {
            error: "Error",
            internalServerError: "An internal server error occurred while executing your request. Please try again or message our Support if the problem remains unresolved.",
            noResponseError: "Our server did not send a response for your request. Please try again or message our Support if the problem remains unresolved.",
            requestSettingError: "Something failed while sending your request. Please try again or message our Support if the problem remains unresolved."
        },
        constants: {
            kgs: "kgs",
            lbs: "lbs"
        }
    },
    bg: {
        screens: {
            login: {
                pageTitle: "Вход",
                emailPlaceholder: "Имейл:",
                passwordPlaceholder: "Парола:",
                submitButton: "Продължи",
                forgottenPassword: "Забравена парола?",
                dontHaveAccount: "Нямаш акаунт?",
                goToSignup: "Регистрирай се тук!"
            },
            signup: {
                pageTitle: "Регистрация",
                firstNamePlaceholder: "Име:",
                lastNamePlaceholder: "Фамилия:",
                emailPlaceholder: "Имейл:",
                passwordPlaceholder: "Парола:",
                submitButton: "Създай акаунт",
                haveAccount: "Имаш акаунт?",
                goToLogin: "Влез тук!"
            },
            calendar: {
                calendarControllerBack: "Назад",
                calendarControllerNext: "Напред",
                addData: "Добави данни",
                noData: "Няма добавени данни за тази дата",
                bottomSheetTitle: "Карти",
                bottomSheetNoCards: "Вече сте добавили всички типове карти"
            },
            profile: {
                profileLoadingError: "Възнкина проблем при зареждането на профила ви. Опитайте отново или се свържете с екипа ни на support@uploy.app",
                profilePictureUpdateError: "Възникна проблем при промяната на профилната ви снимка. Опитайте отново или се свържете с екипа ни на support@uploy.app",
                logout: "Излез от профила",
                weightUnitSectionTitle: "Основни мерни единици",
                weightUnitSectionSelectValues: {
                    KILOGRAMS: "Метрична система (килограм, см)",
                    POUNDS: "Имперска система (паунд, фут, инч)"
                }
            },
            profileEdit: {
                pageTitle: "Промяна на профила",
                inputFields: {
                    firstName: {
                        title: "Име",
                        placeholder: "Име:"
                    },
                    lastName: {
                        title: "Фамилия",
                        placeholder: "Фамилия:"
                    },
                    metricSystem: {
                        title: "Основни мерни единици",
                        labels: {
                            KILOGRAMS: "Метрична система (килограм, см)",
                            POUNDS: "Имперска система (паунд, фут, инч)"
                        }
                    }
                },
                removeProfilePicture: "Премахни профилната снимка"
            },
            coachSearch: {
                pageTitle: "Търсене на треньори",
                reviews: "ревюта",
                noCoachesFound: "Няма намерени треньори за това търсене"
            },
            coachRequests: {
                pageTitle: "Неотговорени заявки",
                pageDescriptor: "Потребители, които са заявили, че желаят да бъдат тренирани от вас:",
            },
            coachPage: {
                pageTitle: "Треньор",
                clients: "клиенти",
                rating: "рейтинг",
                experience: "опит",
                prefersOfflineCoaching: "Този треньор предпочита да работи с клиенти на живо (офлайн).",
                actionButton: "Заяви желание да бъдеш трениран"
            },
            coachingApplicationSubmission: {
                pageTitle: "Заяви желание да станеш личен треньор",
                locationInputPlaceholder: "В кое населено място работите с клиенти?",
                prefersOfflineCoachingText: "Предпочитате ли да работите с клиенти физически, спрямо онлайн?",
                processDescriptor: "Нашият екип ще прегледа вашата заявка възможно най-скоро.",
                actionButton: "Изпрати заявката"
            },
            emailVerification: {
                pageTitle: "Потвърждаване на имейл",
                enterEmailVerificationCode: "Въведете изпратеният код:",
                doesNotComeFromSignup: "Вашият имейл все още не е потвърден. За да продължите да използвате нашите услуги, моля въведете кода, който сме изпратили до вашият имейл адрес.",
                actionButton: "Потвърди имейл",
                emailVerified: "Потвърден имейл",
                alertText: "Вашият имейл беше успешно потвърден. Можете да започнете да използвате нашите услуги.",
            },
            passwordRecovery: {
                pageTitle: "Възстановяване на парола",
                enterCode: "Въведи кода:",
                enterNewPassword: "Въведи нова парола:",
                repeatNewPassword: "Повтори новата парола:",
                enterAccountEmail: "Въведете имейла на акаунта:",
                sentRecoveryCode: "Изпрати код",
                recievedCode: "Изпратен е код за възстановяване на паролата на вашият имейл. Моля въведете кода, за да продължите процеса за възстановяване на паролата.",
                actionButton: "Потвърди код",
                passwordUpdated: "Променена парола",
                alertText: "Паролата ви беше променена. Вече можете да влезете в профила си с новата парола.",
            },
            chats: {
                noChats: "Чатовете с клиенти и треньори ще се покажат тук"
            },
            barcodeReader: {
                barcodeAlreadyExistsErrorTitle: "Баркодът вече е записан",
                barcodeAlreadyExistsErrorMessage: "Баркодът е свързан към друга храна. Моля, сканирайте друг баркод.",
                requestingCameraPermission: "Чака се разрешение за ползване на камерата",
                noCameraAccess: "Няма достъп до камерата",
                allowCamera: "Позволи достъп до камерата",
                scanBarcode: "Сканирай баркод",
                barcodeNotFound: "Баркодът не е намерен",
                scan: "Сканирай / въведи отново",
                addFood: "Добави храната в Gym Rats",
                enterBarcode: "Въведи баркод:",
                submitBarcode: "Запиши баркод"
            },
            suggestions: {
                pageTitle: "Предложения",
                incentive: "Станете част от Gym Rats, като предлагате функционалности, които бихте искали да имаме или ни помогнете с откриването на бъгове, за да подобрим преживяването на всички фитнесджии тук.",
                placeholder: "Пишете тук...",
                pendingReview: "Изчакващи отзив от нас",
                answered: "Отговорено",
            },
            progress: {
                pageTitle: "Прогрес",
                weightTracker: "Тегло",
                minorWeightLost: "Незначителна загуба на тегло",
                efficientWeightLoss: "Оптимална загуба на тегло",
                efficientWeightGain: "Оптимално покачване на тегло",
                tooRapidWeightLoss: "Дразтична загуба на тегло",
                tooRapidWeightGain: "Дразтично покачване на тегло",
                minorWeightGain: "Незначително качване на тегло",
                tipsToImproove: "Съвети за подобряване",
                logbook: "Тренировка",
                selectExercise: "Избери упражнение",
                trendFromLastSession: "Тенденция от последната тренировка",
                rapidStrengthGain: "Дразтично покачване на сила",
                strengthGain: "Покачване на сила",
                slightStrengthGain: "Слабо покачване на сила",
                noNotableChange: "Nяма забележима промяна",
                slightStrengthLoss: "Слаба загуба на сила",
                strengthLoss: "Загуба на сила",
                rapidStrengthLoss: "Дразтична загуба на сила",
                generalTrend: "Генерална тенденция:",
                atLeastTwoSessions: "Направете поне 2 тренировки с това упражнение, за да отключите функционалността за прогрес",
                addWorkoutSession: "Добави тренировка",
                selectExercise: "Моля изберете упражнение, чийто прогрес искате да видите.",
                messageToUser: "След като добавите данни, ще имате възможността да наблюдавате напредъка си от тази страница, както и да получавате алгоритмично базирани предложения как да подобрите своето здраве.",
                letsUnlockThisTab: "Нека отключим тази страница"
            }

        },
        components: {
            cards: {
                logbook: {
                    cardTitle: "Тренировка",
                    redirectButton: "Инфо и прогрес",
                    for: "за",
                    seconds: "секунди",
                    with: "с"
                },
                weightTracker: {
                    cardTitle: "Тегло",
                    gainedWeight: "покачени от последното измерване",
                    lostWeight: "свалени от последното измерване",
                    redirectButton: "Повече инфо"
                },
                caloriesIntake: {
                    cardTitle: "Приети калории",
                    calories: "калории",
                    carbs: "въглехидр.",
                    grams: "гр.",
                    proteins: "Протеини",
                    fats: "Мазнини",
                    noFoodAdded: "Няма добавени храни",
                    redirectButton: "Добави и промени храните"
                }
            },
            confirmationBox: {
                question: "Сигурни ли сте?",
                affirmation: "Да",
                denial: "Не"
            },
            chatsItem: {
                fileSent: "Файлът е изпратен"
            },
            coachRequestItem: {
                acceptRequest: "Приеми заявката",
            },
            message: {
                clickToPreview: "Прегледай файла",
                download: "Изтегляне...",
                fileDownloadErrorTitle: "Грешка при изтегляне на файла",
                fileDownloadErrorDescription: "Възникна грешка по време на изтеглянето и запазването на файла на вашето устройство",
                fileDownloadSuccessTitle: "Успешно изтегляне",
                fileDownloadSuccessDescription: ["Файлът", ".", "е запазен в папка на име Gym Rats"],
                download: "Изтегли"
            }

        },
        navigation: {
            calendar: "Календар",
            progress: "Прогрес",
            coaching: "Коучинг",
            chats: "Чатове",
            profile: "Профил"
        },
        common: {
            saving: "Запазване...",
            loading: "Зареждане...",
            set: "серия",
            sets: "серии",
            rep: "повторение",
            reps: "повторения",
            weight: "тежест",
            duration: "продължителност",
        },
        errors: {
            error: "Грешка",
            internalServerError: "Възникна фатална грешка при обработването на вашата заявка. Моля, опитайте отново или се свържете с нашия помощен екип, ако проблемът не се разреши.",
            noResponseError: "Нашият сървър не отговори на вашата заявка. Моля, опитайте отново или се свържете с нашия помощен екип, ако проблемът не се разреши.",
            requestSettingError: "Нещо се обърка докато обработваме вашата заявка. Моля, свържете се с нашия помощен екип, ако проблемът не се разреши."
        },
        constants: {
            kgs: "кг.",
            lbs: "паунда"
        }
    }
}
