module.exports = {
    en: {
        screens: {
            login: {
                pageTitle: "Login",
                emailPlaceholder: "Email:",
                passwordPlaceholder: "Password:",
                submitButton: "Continue",
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
            }
        },
        components: {
            cards: {
                logbook: {
                    cardTitle: "Workout",
                    redirectButton: "Info and progress"
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
                download: "Downloading..."
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
            loading: "Loading..."
        },
        errors: {
            error: "Error",
            internalServerError: "An internal server error occurred while executing your request. Please try again or message our Support if the problem remains unresolved.",
            noResponseError: "Our server did not send a response for your request. Please try again or message our Support if the problem remains unresolved.",
            requestSettingError: "Something failed while sending your request. Please try again or message our Support if the problem remains unresolved."
        }
    },
    bg: {
        screens: {
            login: {
                pageTitle: "Вход",
                emailPlaceholder: "Имейл:",
                passwordPlaceholder: "Парола:",
                submitButton: "Продължи",
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
                pageTitle: "Application submission",
                locationInputPlaceholder: "Where are you located?",
                prefersOfflineCoachingText: "Do you prefer to work with clients only in person?",
                processDescriptor: "Our team will review your application as soon as possible.",
                actionButton: "Submit application"
            }
        },
        components: {
            cards: {
                logbook: {
                    cardTitle: "Тренировка",
                    redirectButton: "Инфо и прогрес"
                },
                weightTracker: {
                    cardTitle: "Тегло",
                    gainedWeight: "покачени от последното измерване",
                    lostWeight: "свалени от последното измерване",
                    redirectButton: "Повече инфо"
                },
                caloriesIntake: {
                    cardTitle: "Приети калории",
                    calories: "Калории",
                    carbs: "Въглехидрати",
                    grams: "г",
                    proteins: "Протеини",
                    fats: "Мазнини",
                    noFoodAdded: "Няма добавена храна",
                    redirectButton: "Добави и промени храната"
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
                download: "Изтегляне..."
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
            loading: "Зареждане..."
        },
        errors: {
            error: "Грешка",
            internalServerError: "Възникна фатална грешка при обработването на вашата заявка. Моля, опитайте отново или се свържете с нашия помощен екип, ако проблемът не се разреши.",
            noResponseError: "Нашият сървър не отговори на вашата заявка. Моля, опитайте отново или се свържете с нашия помощен екип, ако проблемът не се разреши.",
            requestSettingError: "Нещо се обърка докато обработваме вашата заявка. Моля, свържете се с нашия помощен екип, ако проблемът не се разреши."
        }
    }
}
