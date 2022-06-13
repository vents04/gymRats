import React, { Component } from 'react'
import { Text, View, ScrollView, Pressable, BackHandler } from 'react-native'
import i18n from 'i18n-js';

import ApiRequests from '../../../classes/ApiRequests';
import { BackButtonHandler } from '../../../classes/BackButtonHandler';

import { Ionicons } from '@expo/vector-icons';

import { CALORIES_COUNTER_MEALS, CALORIES_COUNTER_SCREEN_INTENTS, HTTP_STATUS_CODES, MEAL_TITLES } from '../../../../global';
import { cardColors } from '../../../../assets/styles/cardColors';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './CaloriesIntake.styles';

export default class CaloriesIntake extends Component {

    constructor(props) {
        super(props);

        this.state = {
            calorieCounterDay: null,
            unknownSourceCaloriesDay: [],
            showError: false,
            error: ""
        }

        this.focusListener;

        this.backHandler;
    }

    backAction = () => {
        BackButtonHandler.goToPageWithDataManagerCardUpdate(this.props.navigation, "Calendar", this.props.route.params.date)
        return true;
    }

    onFocusFunction = () => {
        this.setState({ timezoneOffset: this.props.route.params.timezoneOffset || new Date().getTimezoneOffset(), date: this.props.route.params.date }, () => {
            this.setState({ calorieCounterDay: null })
            this.getCaloriesIntake();
        })
    }

    componentDidMount = () => {
        this.backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            this.backAction
        );
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction();
        })
    }

    componentWillUnmount = () => {
        this.backHandler.remove();
    }

    getCaloriesIntake = () => {
        ApiRequests.get(`calories-counter/day?date=${this.props.route.params.date.getDate()}&month=${this.props.route.params.date.getMonth() + 1}&year=${this.props.route.params.date.getFullYear()}`, {}, true).then((response) => {
            this.setState({ calorieCounterDay: response.data.calorieCounterDay, unknownSourceCaloriesDay: response.data.unknownSourceCaloriesDay })
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showError: true, error: error.response.data });
                } else {
                    ApiRequests.showInternalServerError();
                }
            } else if (error.request) {
                ApiRequests.showNoResponseError();
            } else {
                ApiRequests.showRequestSettingError();
            }
        })
    }

    removeItem = (id) => {
        ApiRequests.delete(`calories-counter/${this.state.calorieCounterDay._id}/${id}`, {}, true).then((response) => {
            this.getCaloriesIntake();
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showError: true, error: error.response.data });
                } else {
                    ApiRequests.showInternalServerError();
                }
            } else if (error.request) {
                ApiRequests.showNoResponseError();
            } else {
                ApiRequests.showRequestSettingError();
            }
        })
    }

    removeUnknownSourceCaloriesItem = (id) => {
        ApiRequests.delete(`calories-counter/unknown-source-calories/${id}`, {}, true).then((response) => {
            this.getCaloriesIntake();
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showError: true, error: error.response.data });
                } else {
                    ApiRequests.showInternalServerError();
                }
            } else if (error.request) {
                ApiRequests.showNoResponseError();
            } else {
                ApiRequests.showRequestSettingError();
            }
        })
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={[globalStyles.followUpScreenTopbar, {
                        marginBottom: 32
                    }]}>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.backAction()
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </Pressable>
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['caloriesIntake']['title']}</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <View style={styles.unknownSourceCaloriesIncentiveContainer}>
                        <Text style={styles.unknownSourceCaloriesIncentiveText}>{i18n.t('screens')['caloriesIntake']['unknownSourceCaloriesMessage']}</Text>
                        <Pressable style={({ pressed }) => [
                            globalStyles.authPageActionButton,
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} onPress={() => {
                            this.props.navigation.navigate("AddUnknownCaloriesIntake", {
                                date: this.props.route.params.date,
                                timezoneOffset: this.props.route.params.timezoneOffset
                            })
                        }}>
                            <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['caloriesIntake']['unknownSourceCaloriesButton']}</Text>
                        </Pressable>
                    </View>
                    <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                        {
                            Object.keys(CALORIES_COUNTER_MEALS).map(key =>
                                <View key={key} style={styles.mealContainer}>
                                    <View style={styles.mealTopBar}>
                                        <Text style={styles.mealTitle}>{i18n.t('common')['meals'][key]}</Text>
                                        <Pressable style={({ pressed }) => [
                                            {
                                                opacity: pressed ? 0.1 : 1,
                                            }
                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                            this.props.navigation.navigate("SearchCaloriesIntake", { meal: key, date: this.props.route.params.date, timezoneOffset: this.state.timezoneOffset })
                                        }}>
                                            <Ionicons name="add-sharp" size={25} color={cardColors.caloriesIntake} />
                                        </Pressable>
                                    </View>
                                    {
                                        this.state.calorieCounterDay &&
                                            this.state.calorieCounterDay.items.some(item => item.meal == key)
                                            ? this.state.calorieCounterDay.items.map(item =>
                                                item.meal == key
                                                    ? <View key={item._id} style={styles.itemContainer}>
                                                        <Pressable style={({ pressed }) => [
                                                            styles.itemContainerLeft,
                                                            {
                                                                opacity: pressed ? 0.1 : 1,
                                                            }
                                                        ]} onPress={() => {
                                                            this.props.navigation.navigate("AddCaloriesIntakeItem", {
                                                                dayId: this.state.calorieCounterDay._id,
                                                                intent: CALORIES_COUNTER_SCREEN_INTENTS.UPDATE,
                                                                item: item.itemInstance,
                                                                itemId: item._id,
                                                                amount: item.amount,
                                                                meal: item.meal,
                                                                date: this.props.route.params.date,
                                                                timezoneOffset: this.props.route.params.timezoneOffset,
                                                                previousScreen: "CaloriesIntake"
                                                            })
                                                        }}>
                                                            <Text style={styles.itemTitle}>{item.itemInstance.title}</Text>
                                                            <Text style={styles.itemAmount}>{item.amount}&nbsp;{i18n.t('common')['foodUnits'][item.itemInstance.unit]}</Text>
                                                        </Pressable>
                                                        <Pressable style={({ pressed }) => [
                                                            {
                                                                opacity: pressed ? 0.1 : 1,
                                                            }
                                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                                            this.removeItem(item._id)
                                                        }}>
                                                            <Ionicons name="close" size={20} />
                                                        </Pressable>
                                                    </View>
                                                    : null
                                            )
                                            : <Text style={globalStyles.notation}>{i18n.t('screens')['caloriesIntake']['noFoodAdded']}</Text>
                                    }
                                </View>
                            )
                        }
                        <View key="unknownSourceCaloriesMeal" style={styles.mealContainer}>
                            <View style={styles.mealTopBar}>
                                <Text style={styles.mealTitle}>{i18n.t('screens')['caloriesIntake']['unknownSourceCaloriesTitle']}</Text>
                                <Pressable style={({ pressed }) => [
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                    }
                                ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                    this.props.navigation.navigate("AddUnknownCaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.state.timezoneOffset })
                                }}>
                                    <Ionicons name="add-sharp" size={25} color={cardColors.caloriesIntake} />
                                </Pressable>
                            </View>
                            {
                                this.state.unknownSourceCaloriesDay.length > 0
                                    ? this.state.unknownSourceCaloriesDay.map((item, index) =>
                                        <View key={item._id} style={styles.itemContainer}>
                                            <Pressable style={({ pressed }) => [
                                                styles.itemContainerLeft
                                            ]}>
                                                <Text style={styles.itemTitle}>{item.calories} {i18n.t('common')['foodUnits']['CALORIES']}</Text>
                                                <Text style={styles.itemAmount}>{i18n.t('screens')['caloriesIntake']['unknownSourceCaloriesItemDescription']}</Text>
                                            </Pressable>
                                            <Pressable style={({ pressed }) => [
                                                {
                                                    opacity: pressed ? 0.1 : 1,
                                                }
                                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                                this.removeUnknownSourceCaloriesItem(item._id)
                                            }}>
                                                <Ionicons name="close" size={20} />
                                            </Pressable>
                                        </View>
                                    )
                                    : <Text style={globalStyles.notation}>{i18n.t('screens')['caloriesIntake']['noFoodAdded']}</Text>
                            }
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}
