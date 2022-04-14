import React, { Component } from 'react'
import { BackHandler, Dimensions, Modal, ScrollView, Text, TextInput, View } from 'react-native'
import { BiArrowBack, BiCheck } from 'react-icons/bi';
import { IoIosAdd } from 'react-icons/io';
import { MdRemoveCircleOutline } from 'react-icons/md';
import { cardColors } from '../../../../assets/styles/cardColors';
import ApiRequests from '../../../classes/ApiRequests';
import { CALORIES_COUNTER_MEALS, HTTP_STATUS_CODES } from '../../../../global';
import { Picker } from '@react-native-picker/picker';
import { CgArrowsExchangeAltV } from 'react-icons/cg';

const globalStyles = require('../../../../assets/styles/global.styles');
const styles = require('./CaloriesIntake.styles');

export default class CaloriesIntake extends Component {

    state = {
        items: []
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
            if (response.data.calorieCounterDay) this.setState({ items: response.data.calorieCounterDay.items })
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
                    <View style={globalStyles.followUpScreenTopbar}>
                        <BiArrowBack size={25} onClick={() => {
                            this.props.navigation.navigate("Calendar", { reloadDate: true, date: this.props.route.params.date })
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Calories intake</Text>
                    </View>
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
                                    Object.values(this.state.items).includes(key)
                                        ? this.state.items.map(item =>
                                            item.meal == key &&
                                            <View key={item._id} style={styles.itemContainer}>

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
