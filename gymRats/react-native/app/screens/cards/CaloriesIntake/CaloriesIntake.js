import React, { Component } from 'react'
import { BackHandler, Dimensions, Modal, ScrollView, Text, TextInput, View } from 'react-native'
import { BiArrowBack, BiCheck } from 'react-icons/bi';
import { IoIosAdd } from 'react-icons/io';
import { MdRemoveCircleOutline } from 'react-icons/md';
import { cardColors } from '../../../../assets/styles/cardColors';
import ApiRequests from '../../../classes/ApiRequests';
import { CALORIES_COUNTER_MEALS, CALORIES_COUNTER_SCREEN_INTENTS, HTTP_STATUS_CODES } from '../../../../global';
import { Picker } from '@react-native-picker/picker';
import { CgArrowsExchangeAltV } from 'react-icons/cg';
import { IoMdClose } from 'react-icons/io';

const globalStyles = require('../../../../assets/styles/global.styles');
const styles = require('./CaloriesIntake.styles');

export default class CaloriesIntake extends Component {

    state = {
        calorieCounterDay: null,
        showError: false,
        error: ""
    }

    mealTitles = {
        BREAKFAST: "Breakfast",
        LUNCH: "Lunch",
        DINNER: "Dinner",
        SNACKS: "Snacks"
    }

    focusListener;

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
                        <BiArrowBack size={25} onClick={() => {
                            this.props.navigation.navigate("Calendar", { reloadDate: true, date: this.state.date || this.props.route.params.date })
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Calories intake</Text>
                    </View>
                    {
                        this.state.showError
                        && <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                    }
                    {
                        Object.keys(CALORIES_COUNTER_MEALS).map(key =>
                            <View key={key} style={styles.mealContainer}>
                                <View style={styles.mealTopBar}>
                                    <Text style={styles.mealTitle}>{this.mealTitles[key]}</Text>
                                    <IoIosAdd color={cardColors.caloriesIntake} size={25} onClick={() => {
                                        this.props.navigation.navigate("SearchCaloriesIntake", { meal: key, date: this.props.route.params.date, timezoneOffset: this.state.timezoneOffset })
                                    }} />
                                </View>
                                {
                                    this.state.calorieCounterDay &&
                                        this.state.calorieCounterDay.items.some(item => item.meal == key)
                                        ? this.state.calorieCounterDay.items.map(item =>
                                            item.meal == key &&
                                            <View key={item._id} style={styles.itemContainer}>
                                                <View style={styles.itemContainerLeft} onClick={() => {
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
                                                    <Text style={styles.itemAmount}>{item.amount}&nbsp;{item.itemInstance.unit.toLowerCase()}</Text>
                                                </View>
                                                <IoMdClose size={20} onClick={() => {
                                                    this.removeItem(item._id)
                                                }} />
                                            </View>
                                        )
                                        : <Text style={globalStyles.notation}>No food added for {this.mealTitles[key]}</Text>
                                }
                            </View>
                        )
                    }
                </View>
            </View>
        )
    }
}
