import React, { Component } from 'react'
import { Text, View, ScrollView, TouchableOpacity } from 'react-native'

import ApiRequests from '../../../classes/ApiRequests';
import { DataManager } from '../../../classes/DataManager';

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
            showError: false,
            error: ""
        }

        this.focusListener;
    }

    onFocusFunction = () => {
        this.setState({ timezoneOffset: this.props.route.params.timezoneOffset || new Date().getTimezoneOffset(), date: this.props.route.params.date }, () => {
            this.setState({ calorieCounterDay: null })
            this.getCaloriesIntake();
        })
    }

    componentDidMount = () => {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction();
        })
    }

    getCaloriesIntake = () => {
        ApiRequests.get(`calories-counter/day?date=${this.props.route.params.date.getDate()}&month=${this.props.route.params.date.getMonth() + 1}&year=${this.props.route.params.date.getFullYear()}`, {}, true).then((response) => {
            if (response.data.calorieCounterDay) this.setState({ calorieCounterDay: response.data.calorieCounterDay })
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

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={[globalStyles.followUpScreenTopbar, {
                        marginBottom: 32
                    }]}>
                        <TouchableOpacity onPress={() => {
                            DataManager.onDateCardChanged(this.props.route.params.date);
                            this.props.navigation.navigate("Calendar")
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </TouchableOpacity>
                        <Text style={globalStyles.followUpScreenTitle}>Calories intake</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                        {
                            Object.keys(CALORIES_COUNTER_MEALS).map(key =>
                                <View key={key} style={styles.mealContainer}>
                                    <View style={styles.mealTopBar}>
                                        <Text style={styles.mealTitle}>{MEAL_TITLES[key]}</Text>
                                        <TouchableOpacity onPress={() => {
                                            this.props.navigation.navigate("SearchCaloriesIntake", { meal: key, date: this.props.route.params.date, timezoneOffset: this.state.timezoneOffset })
                                        }}>
                                            <Ionicons name="add-sharp" size={25} color={cardColors.caloriesIntake} />
                                        </TouchableOpacity>
                                    </View>
                                    {
                                        this.state.calorieCounterDay &&
                                            this.state.calorieCounterDay.items.some(item => item.meal == key)
                                            ? this.state.calorieCounterDay.items.map(item =>
                                                item.meal == key
                                                    ? <View key={item._id} style={styles.itemContainer}>
                                                        <TouchableOpacity onPress={() => {
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
                                                        }} style={styles.itemContainerLeft}>
                                                            <Text style={styles.itemTitle}>{item.itemInstance.title}</Text>
                                                            <Text style={styles.itemAmount}>{item.amount}&nbsp;{item.itemInstance.unit.toLowerCase()}</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => {
                                                            this.removeItem(item._id)
                                                        }}>
                                                            <Ionicons name="close" size={20} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    : null
                                            )
                                            : <Text style={globalStyles.notation}>No food added</Text>
                                    }
                                </View>
                            )
                        }
                    </ScrollView>
                </View>
            </View>
        )
    }
}
