module.exports = {
    en: {
        screens: {
            login: {
                pageTitle: "Login",
                emailPlaceholder: "Email",
                passwordPlaceholder: "Password",
                submitButton: "Continue",
                forgottenPassword: "Forgotten password?",
                dontHaveAccount: "Don't have an account?",
                goToSignup: "Go to Signup"
            },
            signup: {
                pageTitle: "Signup",
                firstNamePlaceholder: "First name",
                lastNamePlaceholder: "Last name",
                emailPlaceholder: "Email",
                passwordPlaceholder: "Password",
                submitButton: "Create account",
                haveAccount: "Have an account?",
                goToLogin: "Go to Login"
            },
            calendar: {
                calendarControllerBack: "Back",
                calendarControllerNext: "Next",
                addData: "Add data",
                noData: "No data added for this date",
                bottomSheetTitle: "Cards",
                bottomSheetNoCards: "You have already added all data cards for this date",
                cardsRefreshing: "Cards refreshing..."
            },
            coachSearch: {
                pageTitle: "Coach search",
                reviews: "reviews",
                noCoachesFound: "No coaches found for that search",
                placeholder: "Type your search here",
                minimumRating: "Minimum rating is ",
                maxDistance: "Maximum distance is ",
                notSet: "not set",
                unsetMaximumDistance: "Unset maximum distance",
                setMaximumDistance: "Set maximum distance",
                applyFilters: "Apply filters",
                locationPermission: "Location permission needed",
                message: "In order to provide a more personalized experience Gym Rats needs access to your location.",
                filters: "Filters",
            },
            coachProfileEdit: {
                pageTitle: "Coach profile edit",
                clients: "clients",
                rating: "rating",
                inPerson: "Do you prefer to work with clients only in person?",
                shareProfileLink: "Share profile link",
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
                noChats: "Chats with clients and coaches will appear here",
                fileMessage: "File message"
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
                submitBarcode: "Submit barcode",
                barcodeAlreadyLinked: "Barcode is already linked to another food"
            },
            suggestions: {
                pageTitle: "Suggestions",
                incentive: "Become a part of Gym Rats by suggesting features you'd like having or help us catch bugs early for a more seamless experience for all the gym rats out there.",
                placeholder: "Type here...",
                pendingReview: "Pending review",
                answered: "Answered",
            },
            addCaloriesIntakeItem: {
                add: "Add",
                update: "Update",
                food: "food",
                macronutrients: "Macronutrients",
                nutritionalInfo: ["Nutritional info per", ""],
                mealPickerPlaceholder: "Choose meal"
            },
            progress: {
                pageTitle: "Progress",
                myProgress: "My progress",
                friends: "Friends",
                weightTracker: "Weight tracker",
                minorWeightLoss: "Minor weight loss",
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
                atLeastTwoSessions: "There are not enough workout sessions done to unlock this functionality",
                addWorkoutSession: "Add a workout session",
                selectExercise: "Please, select an exercise to show progress charts for.",
                messageToUser: "After adding some data you will have the ability to monitor your progress from this tab as well as get software-based suggestions on how to improve your fitness.",
                letsUnlockThisTab: "Let's unlock this tab!",
                noFriendsText: "Gym Rats is way more fun when you are competing with your friend's progress",
                noFriendsIncentive: "Invite your friends",
                friendsLinkModalTitle: ["Add", "as a friend"],
                sendFriendRequest: "Send friendship request",
                competitiveProgressNotationBetter: "You are progressing quicker",
                competitiveProgressNotationWorse: "You are progressing slower",
                competitiveProgressNotationNeutral: "You are progressing at the same pace",
                competitiveRegress: "% regress",
                competitiveProgress: "% progress",
                strength: 'strength',
                volume: 'volume'
            },
            addFood: {
                optional: "optional",
                title: "Add food to Gym Rats",
                titleInput: "Title",
                brandInput: "Brand",
                barcodeInput: "Barcode",
                servingUnitInput: "Serving unit",
                caloriesInput: "Calories per 100",
                carbsInput: "Carbs per 100",
                proteinsInput: "Proteins per 100",
                fatsInput: "Fats per 100",
                barcodeAlreadyLinked: "Already linked",
                addBarcode: "Add barcode",
                servingUnitPlaceholder: "Choose a serving unit"
            },
            profileDetailsEdit: {
                pageTitle: "Profile edit",
                saving: "Saving...",
                firstName: "First name",
                firstNamePlaceholder: "First name",
                lastName: "Last name",
                lastNamePlaceholder: "Last name",
                weightUnit: "Weight unit",
                KILOGRAMS: "Metric system (kilograms)",
                POUNDS: "Imperial system (pounds)",
                removeProfilePicture: "Remove profile picture",
                accountDeletion: "Account deletion",
                initiateAccountDeletion: "Initiate account deletion",
                pendingAccountDeletionDescription: "You account deletion will be completed between 7 and 30 days after the request has been initiated. Until then you may cancel the request by the button below.",
                cancelAccountDeletion: "Cancel account deletion"
            },
            profile: {
                saving: "Saving...",
                logout: "Logout",
                weightUnit: "Weight unit",
                KILOGRAMS: "Metric system (kilograms)",
                POUNDS: "Imperial system (pounds)",
                loading: "Loading...",
            },
            addUnknownSourceCalories: {
                title: "Add unknown souce calories",
                notation: "The macros for unknown source calories are the following: 40% carbs, 30% protein, 30% fats",
                caloriesInput: "Calories estimate:"
            },
            postReview: {
                pageTitle: "Post a review",
                startOfRelation: "This relation started at ",
                endOfRelation: "and ended at",
                rateExperience: "How would you rate your whole experience with this coach?",
                review: "You may also write a detailed review",
                placeholder: "Type here...",
                actionButton: "Submit",
                ratingTitlesTerrible: "Terrible",
                ratingTitlesBad: "Bad",
                ratingTitlesOK: "OK",
                ratingTitlesGood: "Good",
                ratingTitlesExcellent: "Excellent",
                submit: "Submit"
            },
            caloriesIntake: {
                title: "Calories intake",
                unknownSourceCaloriesMessage: "You may also add unknown source calories if you do not bother searching for a food you have consumed",
                unknownSourceCaloriesButton: "Add calories from unknown source",
                noFoodAdded: "No food added",
                unknownSourceCaloriesTitle: "Unknown source calories",
                unknownSourceCaloriesItemDescription: "40% carbs, 30% protein, 30% fats"
            },
            exerciseSearch: {
                title: "Exercise search",
                searchInputPlaceholder: "Type exercise name",
                usageStat: ["Used in", "workout sessions"]
            },
            logbook: {
                backActionAlertTitle: "Hold on!",
                backActionAlertMessage: "Are you sure you want to go back without saving the changes?",
                cancel: "Cancel",
                yes: "Yes, go back",
                workoutTemplateModalMessage: "You may add this workout template for future use by giving it a name.",
                workoutTemplateModalInput: "Title:",
                workoutTemplateDeny: "Skip and do not ask again",
                workoutTemplateSkip: "Skip",
                workoutTemplateAdd: "Add",
                templatePickerModalMessage: "You may choose a workout template for this workout session",
                templatePickerModalSkip: "Skip",
                templatePickerModalAdd: "Add",
                title: "Logbook",
                save: "Save",
                manageWorkoutTemplatesMessage: "You may manage your previously created workout templates",
                manageWorkoutTemplatesButton: "Manage workout templates",
                exercises: "Exercises",
                noExercisesAdded: "No exercises added",
                addSet: "Add set",
                setNo: "Set No.",
                templatePickerModalTitle: "Workout template picker",
                templatePickerModalDropdownPlaceholder: "Choose a template",
                templatePostModalTitle: "Add workout template",
            },
            filePreview: {
                playPauseAudio: "Play/pause audio",
                pause: "Pause",
                play: "Play"
            },
            manageWorkoutTemplates: {
                title: "Manage workout templates",
                noTemplates: "You do not have any workout templates, yet.",
                deletionAlertTitle: "Hold on!",
                deletionAlertMessage: "Are you sure you want to delete this workout template?",
                cancel: "Cancel",
                yes: "Yes, delete"
            },
            searchCaloriesIntake: {
                title: "Search food",
                searchInputPlaceholder: "Type food name here",
                noResultsFound: "No results found",
                recentFoods: "Recent foods",
            },
            weightTracker: {
                title: "Weight",
                add: "Add",
                update: "Update"
            },
            chat: {
                fileUploadErrorTitle: "File upload error",
                fileUploadSizeError: "The size of the file you have selected is too large",
                fileUploadUnsupportedType: "This file type is not supported",
                messagePlaceholder: "Type a message...",
                fileUploading: "The file is being uploaded",
                loadingMessagesText: "Loading messages",
            },
            client: {
                title: "Client profile",
                clientSince: "Client since",
                previous: "Previous",
                next: "Next",
            },
            coaching: {
                title: "Coaching",
                personalTrainerStatusMessagesPending: "Your coach account is being reviewed by our team and will become active soon",
                personalTrainerStatusMessagesActive: "You do not have any clients, yet",
                personalTrainerStatusMessagesBlocked: "You have been blocked by our team. Contact us at support@uploy.app for more information",
                meAsClient: "Me as client",
                meAsCoach: "Me as coach",
                getInShape: "Get in shape with Gym Rats",
                ourCoaches: "All of our coaches are:",
                singleHandedly: "Single handedly approved by us",
                motivatedAndReady: "Motivated and ready to help",
                capableOfTraining: "Capable of training people with different goals",
                searchCoaches: "Search coaches",
                relationsWithoutReviews: "Relations without reviews",
                startOfRelation: "This relation started at ",
                endOfRelation: "and ended at ",
                leaveAReview: "Leave a review",
                stillNoCoaches: "You still do not have any coaches",
                coaches: "Coaches",
                unansweredRequests: "Unanswered requests",
                openMyCoachProfile: "Open my coach profile",
                beACoach: "Be a coach at Gym Rats",
                catchTheOpportunity: "Catch the opportunity to:",
                workWithPeople: "Work with people locally and internationally",
                getAccessToClientData: "Get access to your clients' Gym Rats data (logbooks, diet, weight and etc.)",
                getTheMost: "Get the most out of what you have earned through Gym Rats",
                submitApplication: "Submit application",
                clients: "Clients"
            },
            noNetwork: {
                text: "Gym Rats works only when you are connected to the internet. We are waiting to see you back online soon."
            }
        },
        components: {
            cards: {
                logbook: {
                    cardTitle: "Workout",
                    cardDescription: "Track your workouts",
                    redirectButton: "Info and progress",
                    for: "for",
                    seconds: "seconds",
                    with: "with"
                },
                weightTracker: {
                    cardTitle: "Weight",
                    cardDescription: "Track your daily weight changes",
                    gainedWeight: "gained compared to last measurement",
                    lostWeight: "lost compared to last measurement",
                    redirectButton: "More info"
                },
                caloriesIntake: {
                    cardTitle: "Calories intake",
                    cardDescription: "Track your meals throughout the day",
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
                title: "Confirmation",
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
            submit: "Submit",
            saving: "Saving...",
            loading: "Loading...",
            set: "set",
            sets: "sets",
            rep: "rep",
            reps: "reps",
            weight: "weight",
            duration: "duration",
            meals: {
                BREAKFAST: "Breakfast",
                LUNCH: "Lunch",
                DINNER: "Dinner",
                SNACKS: "Snacks"
            },
            foodUnits: {
                GRAMS: "grams",
                MILLILITERS: "ml",
                CALORIES: "kcal"
            },
            macros: {
                calories: "Calories",
                carbs: "Carbs",
                proteins: "Proteins",
                fats: "Fats",
            },
            weightUnits: {
                KILOGRAMS: "kgs",
                POUNDS: "lbs"
            }
        },
        errors: {
            error: "Error",
            internalServerError: "An internal server error occurred while executing your request or the server is down. Please, try again or message our Support if the problem remains unresolved.",
            noResponseError: "Our server did not send a response for your request. Please try again or message our Support if the problem remains unresolved.",
            requestSettingError: "Something failed while sending your request. Please try again or message our Support if the problem remains unresolved.",
            profilePictureUploadError: "There was a problem uploading the profile picture. Please try again or contact support at support@uploy.app",
            loadProfileError: "There was a problem loading your profile. Try again or contact support on office@uploy.app",
            deviceInfoSubmissionError: "An error occurred while submitting device info",
            navigationAnalyticsSubmissionError: "An error occurred while submitting analytics data"
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
                emailPlaceholder: "Имейл",
                passwordPlaceholder: "Парола",
                submitButton: "Продължи",
                forgottenPassword: "Забравена парола?",
                dontHaveAccount: "Нямаш акаунт?",
                goToSignup: "Регистрирай се тук!"
            },
            signup: {
                pageTitle: "Регистрация",
                firstNamePlaceholder: "Име",
                lastNamePlaceholder: "Фамилия",
                emailPlaceholder: "Имейл",
                passwordPlaceholder: "Парола",
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
                bottomSheetNoCards: "Вече сте добавили всички типове карти",
                cardsRefreshing: "Картите се обновяват..."
            },
            coachSearch: {
                pageTitle: "Търсене на треньори",
                reviews: "ревюта",
                noCoachesFound: "Няма намерени треньори за това търсене",
                placeholder: "Търси треньори",
                minimumRating: "Минималният рейтин е ",
                maxDistance: "Максималното разстояние е ",
                notSet: "не е зададено",
                unsetMaximumDistance: "Премахни максималното разстояние",
                setMaximumDistance: "Задай максималното разстояние",
                applyFilters: "Постави филтри",
                locationPermission: "Разрешение за взимане на локация",
                message: "За по-персонализирано преживяване, Gym Rats изисква достъп до локацията ви.",
                filters: "Филтри",
            },
            coachProfileEdit: {
                pageTitle: "Редактиране на профила на треньор",
                clients: "клиенти",
                rating: "рейтинг",
                inPerson: "Предпочитате ли да работите с клиенти само на живо?",
                shareProfileLink: "Сподели линк към профила",
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
                noChats: "Чатовете с клиенти и треньори ще се покажат тук",
                fileMessage: "Файлово съобщение"
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
                submitBarcode: "Запиши баркод",
                barcodeAlreadyLinked: "Баркодът е свързан към друга храна"
            },
            suggestions: {
                pageTitle: "Предложения",
                incentive: "Станете част от Gym Rats, като предлагате функционалности, които бихте искали да имаме или ни помогнете с откриването на бъгове, за да подобрим преживяването на всички фитнесджии тук.",
                placeholder: "Пишете тук...",
                pendingReview: "Изчакващи отзив от нас",
                answered: "Отговорено",
            },
            addCaloriesIntakeItem: {
                add: "Добави",
                update: "Обнови",
                food: "храна",
                macronutrients: "Макронутриенти",
                nutritionalInfo: ["Информация за", "от храната"],
                mealPickerPlaceholder: "Избери хранене"
            },
            progress: {
                pageTitle: "Прогрес",
                myProgress: "Моят прогрес",
                freinds: "Приятели",
                weightTracker: "Тегло",
                minorWeightLoss: "Незначителна загуба на тегло",
                efficientWeightLoss: "Оптимална загуба на тегло",
                efficientWeightGain: "Оптимално покачване на тегло",
                tooRapidWeightLoss: "Драстична загуба на тегло",
                tooRapidWeightGain: "Драстично покачване на тегло",
                minorWeightGain: "Незначително качване на тегло",
                tipsToImproove: "Съвети за подобряване",
                logbook: "Тренировка",
                selectExercise: "Избери упражнение",
                trendFromLastSession: "Тенденция от последната тренировка",
                rapidStrengthGain: "Драстично покачване на сила",
                strengthGain: "Покачване на сила",
                slightStrengthGain: "Слабо покачване на сила",
                noNotableChange: "Няма забележима промяна",
                slightStrengthLoss: "Слаба загуба на сила",
                strengthLoss: "Загуба на сила",
                rapidStrengthLoss: "Драстична загуба на сила",
                generalTrend: "Генерална тенденция:",
                atLeastTwoSessions: "Няма достатъчно добавени тренировки, за да отключите тази функционалност",
                addWorkoutSession: "Добави тренировка",
                selectExercise: "Моля, изберете упражнение, чийто прогрес искате да видите.",
                messageToUser: "След като добавите данни, ще имате възможността да наблюдавате напредъка си от тази страница, както и да получавате алгоритмично базирани предложения как да подобрите своето здраве.",
                letsUnlockThisTab: "Нека отключим тази страница",
                noFriendsText: "Gym Rats е много по-интересно, когато се състезаваш с прогреса на приятелите си",
                noFriendsIncentive: "Покани приятелите си",
                friendsLinkModalTitle: ["Добави", "като приятел/ка"],
                sendFriendRequest: "Изпрати покана за приятелство",
                competitiveProgressNotationBetter: "Прогресирате по-бързо",
                competitiveProgressNotationWorse: "Прогресирате по-бавно",
                competitiveProgressNotationNeutral: "Прогресирате еднакво бързо",
                competitiveRegress: "% регрес",
                competitiveProgress: "% прогрес",
                strength: 'сила',
                volume: 'обем'
            },
            addFood: {
                optional: "опиционално",
                title: "Добави храна в Gym Rats",
                titleInput: "Име",
                brandInput: "Фирма",
                barcodeInput: "Баркод",
                servingUnitInput: "Измревателна единица",
                caloriesInput: "Калории за 100",
                carbsInput: "Въглехидрати за 100",
                proteinsInput: "Протеини за 100",
                fatsInput: "Мазнини за 100",
                barcodeAlreadyLinked: "Вече свързан",
                addBarcode: "Добави баркод",
                servingUnitPlaceholder: "Избери начин на измерване на порция"
            },
            profileDetailsEdit: {
                pageTitle: "Редакция на профила",
                saving: "Запазване...",
                firstName: "Име",
                firstNamePlaceholder: "Име",
                lastName: "Фамилия",
                lastNamePlaceholder: "Фамилия",
                weightUnit: "Мерна единица за тегло",
                KILOGRAMS: "Метрична система (килограми)",
                POUNDS: "Имперска система (паунди)",
                removeProfilePicture: "Премахни профилната снимка",
                accountDeletion: "Изтриване на акаунт",
                initiateAccountDeletion: "Заяви желание за изтриване на акаунта",
                pendingAccountDeletionDescription: "Изтриването на акаунта ще отнеме от 7 до 3 дни след подаване на заявката за изтриване. Дотогава може да откажете изтриването на акаунта с бутона по-долу.",
                cancelAccountDeletion: "Откажи изтриването на акаунта"
            },
            profile: {
                saving: "Запазване...",
                logout: "Излез от профил",
                weightUnit: "Мерна единица за тегло",
                KILOGRAMS: "Метрична система (килограми)",
                POUNDS: "Имперска система (паунди)",
                loading: "Зареждане...",
            },
            addUnknownSourceCalories: {
                title: "Добави калории от незнаен източник",
                notation: "Макронутриентите за калории от незнаен източник се разпределят както следва: 40% въглехидрати, 30% протеини, 30% мазнини",
                caloriesInput: "Приблизително приети калории:"
            },
            postReview: {
                pageTitle: "Публикувай отзив",
                startOfRelation: "Тази връзка започна на ",
                endOfRelation: "и завърши на",
                rateExperience: "Как бихте оценили времето си с този треньор?",
                review: "Също можете да напишете детайлен отзив",
                placeholder: "Пишете тук...",
                actionButton: "Публикувай",
                ratingTitlesTerrible: "Ужасно",
                ratingTitlesBad: "Лошо",
                ratingTitlesOK: "Ок",
                ratingTitlesGood: "Добро",
                ratingTitlesExcellent: "Отлично",
                submit: "Публикувай отзив",
            },
            caloriesIntake: {
                title: "Прием на калории",
                unknownSourceCaloriesMessage: "Може да добавите калории от незнаен източник, ако не искате да търсите специфична храна, която сте консумирали",
                unknownSourceCaloriesButton: "Добави калории от незнаен източник",
                noFoodAdded: "Няма добавени храни",
                unknownSourceCaloriesTitle: "Калории от незнайни източници",
                unknownSourceCaloriesItemDescription: "40% въглехидрати, 30% протеини, 30% мазнини"
            },
            exerciseSearch: {
                title: "Търсене на упражнение",
                searchInputPlaceholder: "Напиши име на упражнение",
                usageStat: ["Използвано в", "тренировки"]
            },
            logbook: {
                backActionAlertTitle: "Изчакайте!",
                backActionAlertMessage: "Сигурни ли сте, че искате да се върнете назад без да запазите сегашните промени?",
                cancel: "Отказ",
                yes: "Да, назад",
                workoutTemplateModalMessage: "Може да добавите този тренировъчен шаблон за бъдещо ползване като му дадете име",
                workoutTemplateModalInput: "Име:",
                workoutTemplateDeny: "Пропусни и не питай повече",
                workoutTemplateSkip: "Пропусни",
                workoutTemplateAdd: "Добави",
                templatePickerModalMessage: "Може да изберете тренировъчен шаблон за тренировъчната ви сесия",
                templatePickerModalSkip: "Пропусни",
                templatePickerModalAdd: "Добави",
                title: "Тренировка",
                save: "Запази",
                manageWorkoutTemplatesMessage: "Може да управлявате вашите тренировъчни шаблони",
                manageWorkoutTemplatesButton: "Управлявай шаблоните",
                exercises: "Упражнения",
                noExercisesAdded: "Няма добавени упражнения",
                addSet: "Серия",
                setNo: "Серия №",
                templatePickerModalTitle: "Избор на тренировъчен шаблон",
                templatePickerModalDropdownPlaceholder: "Избери шаблон",
                templatePostModalTitle: "Добавяне на тренировъчен шаблон",
            },
            filePreview: {
                playPauseAudio: "Пусни/Спри аудио",
                pause: "Спри",
                play: "Пусни"
            },
            searchCaloriesIntake: {
                title: "Търсене на храна",
                searchInputPlaceholder: "Напиши името на храна",
                noResultsFound: "Няма намерени резултати",
                recentFoods: "Скорошни храни",
            },
            weightTracker: {
                title: "Тегло",
                add: "Добави",
                update: "Обнови"
            },
            chat: {
                fileUploadErrorTitle: "Грешка при качване на файл",
                fileUploadSizeError: "Размерът на файла е прекалено голям",
                fileUploadUnsupportedType: "Файловият формат не е поддържан в Gym Rats",
                messagePlaceholder: "Напиши съобщение...",
                fileUploading: "Файлът се качва",
                loadingMessagesText: "Съобщенията се зареждат"
            },
            client: {
                title: "Клиентски профил",
                clientSince: "Клиент от",
                previous: "Назад",
                next: "Напред",
            },
            coaching: {
                title: "Коучинг",
                personalTrainerStatusMessagesPending: "Вашият треньорски профил бива прегледан от нашият екип и скоро ще бъде активен",
                personalTrainerStatusMessagesActive: "Все още нямате клиенти",
                personalTrainerStatusMessagesBlocked: "Вие сте блокиран от нашият екип. Свържете се с нас на support@uploy.app за повече информация",
                meAsClient: "Аз като клиент",
                meAsCoach: "Аз като треьор",
                getInShape: "Влез във форма с Gym Rats",
                ourCoaches: "Треньорите ни са:",
                singleHandedly: "Собственоръчно одобрени от нас",
                motivatedAndReady: "Мотивирани и готови да помогнат",
                capableOfTraining: "Способни да тренират хора с различни цели",
                searchCoaches: "Потърси треньори",
                relationsWithoutReviews: "Връзки треньор-клиент без отзиви",
                startOfRelation: "Връзката треньор-клиент е започната на ",
                endOfRelation: "и е приключила на ",
                leaveAReview: "Остави отзив",
                stillNoCoaches: "Все още нямаш треньори",
                coaches: "Треньори",
                unansweredRequests: "Неотговорени заявки",
                openMyCoachProfile: "Отвори моят треньорски профил",
                beACoach: "Стани треньор в Gym Rats",
                catchTheOpportunity: "Възползвай се от възможността да:",
                workWithPeople: "Работиш с хора на местно и интернационално ниво",
                getAccessToClientData: "Имаш достъп до информация свързана с твоите клиенти (тренировки, диети, тегло и др.)",
                getTheMost: "Изкараш това, което ти се полага от Gym Rats",
                submitApplication: "Подай заявка",
                clients: "Клиенти",
            },
            manageWorkoutTemplates: {
                title: "Управление на тренировъчните шаблони",
                noTemplates: "Все още нямате добавени тренировъчни шаблони",
                deletionAlertTitle: "Изчакайте!",
                deletionAlertMessage: "Сигурни ли сте, че искате да изтриете този тренировъчен шаблон?",
                cancel: "Отказ",
                yes: "Да, изтрий"
            },
            noNetwork: {
                text: "Gym Rats работи само при връзка с интернет. Ще те чакаме отново на линия в Gym Rats."
            }
        },
        components: {
            cards: {
                logbook: {
                    cardTitle: "Тренировка",
                    cardDescription: "Следи прогреса в тренировките си",
                    redirectButton: "Инфо и прогрес",
                    for: "за",
                    seconds: "секунди",
                    with: "с"
                },
                weightTracker: {
                    cardTitle: "Тегло",
                    cardDescription: "Следи промените в теглото си",
                    gainedWeight: "покачени от последното измерване",
                    lostWeight: "свалени от последното измерване",
                    redirectButton: "Повече инфо"
                },
                caloriesIntake: {
                    cardTitle: "Приети калории",
                    cardDescription: "Следи храненията през деня си",
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
                title: "Потвърждение",
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
            submit: "Изпрати",
            saving: "Запазване...",
            loading: "Зареждане...",
            set: "серия",
            sets: "серии",
            rep: "повторение",
            reps: "повт.",
            weight: "тежест",
            duration: "време",
            meals: {
                BREAKFAST: "Закуска",
                LUNCH: "Обяд",
                DINNER: "Вечеря",
                SNACKS: "Други"
            },
            foodUnits: {
                GRAMS: "грама",
                MILLILITERS: "мл.",
                CALORIES: "ккал"
            },
            macros: {
                calories: "Калории",
                carbsShortened: "Въглех.",
                carbs: "Въглехидрати",
                proteins: "Протеини",
                fats: "Мазнини",
            },
            weightUnits: {
                KILOGRAMS: "кг",
                POUNDS: "паунда"
            }
        },
        errors: {
            error: "Грешка",
            internalServerError: "Възникна фатална грешка при обработването на вашата заявка или сървърът е спрян. Моля, опитайте отново или се свържете с нашия помощен екип, ако проблемът не се разреши.",
            noResponseError: "Нашият сървър не отговори на вашата заявка. Моля, опитайте отново или се свържете с нашия помощен екип, ако проблемът не се разреши.",
            requestSettingError: "Нещо се обърка докато обработваме вашата заявка. Моля, свържете се с нашия помощен екип, ако проблемът не се разреши.",
            profilePictureUploadError: "Възникна проблем с качването на профилната снимка. Моля, опитайте отново или се свържете с помощеня екип на support@uploy.app",
            loadProfileError: "Възникна проблем със зареждането на профилът ви. Моля, опитайте отново или се свържете с помощеня екип на support@uploy.app",
            deviceInfoSubmissionError: "Възникна проблем при изпращането на информация за устройството",
            navigationAnalyticsSubmissionError: "Възникна проблем при изпращането на аналитични данни"
        },
        constants: {
            kgs: "кг.",
            lbs: "паунда"
        }
    }
}
