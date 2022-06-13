import React, { Component } from 'react';
import { Dimensions, Text, Pressable, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import ApiRequests from '../../classes/ApiRequests';
import { DataManager } from "../../classes/DataManager";

import ConfirmationBox from '../ConfirmationBox/ConfirmationBox';

import i18n from 'i18n-js';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES, CALORIES_COUNTER_MEALS, MEAL_TITLES } from '../../../global';
import { cardColors } from '../../../assets/styles/cardColors';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './CaloriesIntakeCard.styles';

export default class CaloriesIntakeCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showConfirmationBox: false,
            data: null,
            calorieCounterDay: null,
            showError: false,
            error: ""
        }
    }

    componentDidMount() {
        this.calculateMacros();
        if (this.props.client) this.getClientCaloriesCounterDay();
    }

    static getDerivedStateFromProps(props, state) {
        let newState = {};
        newState.data = props.data;

        let calories = 0, carbs = 0, fats = 0, protein = 0;

        for (let data of props.data.items) {
            calories += parseInt(data.amount * data.itemInstance.calories);
            carbs += parseInt(data.amount * data.itemInstance.carbs);
            fats += parseInt(data.amount * data.itemInstance.fats);
            protein += parseInt(data.amount * data.itemInstance.protein);
        }

        if (props.data.unknownSourceCaloriesDay && props.data.unknownSourceCaloriesDay.length > 0) {
            for (let item of props.data.unknownSourceCaloriesDay) {
                calories += parseInt(item.calories);
                carbs += parseInt((0.4 * item.calories) / 4);
                fats += parseInt((0.3 * item.calories) / 9);
                protein += parseInt((0.3 * item.calories) / 4);
            }
        }

        newState.calories = calories;
        newState.carbs = carbs;
        newState.fats = fats;
        newState.protein = protein;
        return newState;
    }

    calculateMacros = () => {
        this.setState({ data: this.props.data });

        let calories = 0, carbs = 0, fats = 0, protein = 0;

        for (let data of this.props.data.items) {
            calories += parseInt(data.amount * data.itemInstance.calories);
            carbs += parseInt(data.amount * data.itemInstance.carbs);
            fats += parseInt(data.amount * data.itemInstance.fats);
            protein += parseInt(data.amount * data.itemInstance.protein);
        }

        if (this.props.data.unknownSourceCaloriesDay && this.props.data.unknownSourceCaloriesDay.length > 0) {
            for (let item of this.props.data.unknownSourceCaloriesDay) {
                calories += parseInt(item.calories);
                carbs += parseInt((0.4 * item.calories) / 4);
                fats += parseInt((0.3 * item.calories) / 9);
                protein += parseInt((0.3 * item.calories) / 4);
            }
        }

        this.setState({ calories, carbs, fats, protein })
    }

    toggleShowConfirmationBox = (state) => {
        this.setState({ showConfirmationBox: state });
    }

    deleteCard = async () => {
        console.log(this.props.data);
        try {
            if (this.props.data._id) await ApiRequests.delete(`calories-counter/${this.props.data._id}`, {}, true);
            if (this.props.data.unknownSourceCaloriesDay.length > 0) {
                for (let item of this.props.data.unknownSourceCaloriesDay) {
                    await ApiRequests.delete(`calories-counter/unknown-source-calories/${item._id}`, {}, true);
                }
            }
            this.toggleShowConfirmationBox(false);
            DataManager.onDateCardChanged(this.props.date);
        } catch (error) {
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
        }
    }

    getClientCaloriesCounterDay = () => {
        ApiRequests.get(`calories-counter/day?date=${this.props.date.getDate()}&month=${this.props.date.getMonth() + 1}&year=${this.props.date.getFullYear()}&clientId=${this.props.client._id}`, {}, true).then((response) => {
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

    render() {
        return <Pressable onPress={() => {
            if (!this.state.showConfirmationBox) this.props.actionButtonFunction();
        }}>
            <View style={globalStyles.card}>
                {
                    this.state.showConfirmationBox
                        ? <ConfirmationBox deleteCard={this.deleteCard} toggleShowConfirmationBox={this.toggleShowConfirmationBox} />
                        : null
                }
                <View style={globalStyles.cardTopbar}>
                    <MaterialCommunityIcons name="food-variant" size={25} color={cardColors.caloriesIntake} />
                    <Text style={globalStyles.cardTitle}>{i18n.t('components')['cards']['caloriesIntake']['cardTitle']}</Text>
                    {
                        !this.props.client
                            ? <Pressable style={({ pressed }) => [
                                globalStyles.cardTopbarIcon,
                                {
                                    opacity: pressed ? 0.1 : 1,
                                }
                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                this.setState({ showConfirmationBox: true })
                            }}>
                                <MaterialCommunityIcons name="delete" size={25} color="#ddd" />
                            </Pressable>
                            : null
                    }
                </View>
                {
                    this.state.showError
                        ? <Text style={[globalStyles.errorBox, {
                            marginTop: 16
                        }]}>{this.state.error}</Text>
                        : <>
                            <Text style={styles.calories}>{this.state.calories} {i18n.t('components')['cards']['caloriesIntake']['calories']}</Text>
                            <View style={[styles.inline, styles.macronutrientsCircles]}>
                                <View style={styles.macronutrientsCirclesContainer}>
                                    <AnimatedCircularProgress
                                        ref={(ref) => this.circularProgress = ref}
                                        size={Dimensions.get('window').width * 0.2}
                                        width={Dimensions.get('window').width * 0.2 * 0.1}
                                        fill={
                                            (this.state.carbs * 4) /
                                            this.state.calories
                                            * 100
                                        }
                                        rotation={0}
                                        tintColor={cardColors.caloriesIntake}
                                        backgroundColor="#3d5875"
                                        children={() => {
                                            return (
                                                <Text style={styles.macronutrientsRatioCircleTitle}>{this.state.carbs}{i18n.t('components')['cards']['caloriesIntake']['grams']}</Text>
                                            )
                                        }}
                                    />
                                    <Text style={styles.macroCircleTitle}>{i18n.t('components')['cards']['caloriesIntake']['carbs']}</Text>
                                </View>
                                <View style={styles.macronutrientsCirclesContainer}>
                                    <AnimatedCircularProgress
                                        ref={(ref) => this.circularProgress = ref}
                                        size={Dimensions.get('window').width * 0.2}
                                        width={Dimensions.get('window').width * 0.2 * 0.1}
                                        fill={
                                            (this.state.protein * 4) /
                                            this.state.calories
                                            * 100
                                        }
                                        rotation={0}
                                        tintColor={cardColors.caloriesIntake}
                                        backgroundColor="#3d5875"
                                        children={() => {
                                            return (
                                                <Text style={styles.macronutrientsRatioCircleTitle}>{this.state.protein}{i18n.t('components')['cards']['caloriesIntake']['grams']}</Text>
                                            )
                                        }}
                                    />
                                    <Text style={styles.macroCircleTitle}>{i18n.t('components')['cards']['caloriesIntake']['proteins']}</Text>
                                </View>
                                <View style={styles.macronutrientsCirclesContainer}>
                                    <AnimatedCircularProgress
                                        ref={(ref) => this.circularProgress = ref}
                                        size={Dimensions.get('window').width * 0.2}
                                        width={Dimensions.get('window').width * 0.2 * 0.1}
                                        fill={
                                            (this.state.fats * 9) /
                                            this.state.calories
                                            * 100
                                        }
                                        rotation={0}
                                        tintColor={cardColors.caloriesIntake}
                                        backgroundColor="#3d5875"
                                        children={() => {
                                            return (
                                                <Text style={styles.macronutrientsRatioCircleTitle}>{this.state.fats}{i18n.t('components')['cards']['caloriesIntake']['grams']}</Text>
                                            )
                                        }}
                                    />
                                    <Text style={styles.macroCircleTitle}>{i18n.t('components')['cards']['caloriesIntake']['fats']}</Text>
                                </View>
                            </View>
                            {
                                this.props.client
                                    ? Object.keys(CALORIES_COUNTER_MEALS).map(key =>
                                        <View key={key} style={styles.mealContainer}>
                                            <View style={styles.mealTopBar}>
                                                <Text style={styles.mealTitle}>{MEAL_TITLES[key]}</Text>
                                            </View>
                                            {
                                                this.state.calorieCounterDay &&
                                                    this.state.calorieCounterDay.items.some(item => item.meal == key)
                                                    ? this.state.calorieCounterDay.items.map(item =>
                                                        item.meal == key
                                                            ? <View key={item._id} style={styles.itemContainer}>
                                                                <View style={styles.itemContainerLeft}>
                                                                    <Text style={styles.itemTitle}>{item.itemInstance.title}</Text>
                                                                    <Text style={styles.itemAmount}>{item.amount}&nbsp;{item.itemInstance.unit.toLowerCase()}
                                                                        &nbsp;&middot;&nbsp;{parseFloat(item.itemInstance.calories * item.amount).toFixed()}&nbsp;calories
                                                                        &nbsp;&middot;&nbsp;{parseFloat(item.itemInstance.carbs * item.amount).toFixed()}g&nbsp;carbs
                                                                        &nbsp;&middot;&nbsp;{parseFloat(item.itemInstance.protein * item.amount).toFixed()}g&nbsp;protein
                                                                        &nbsp;&middot;&nbsp;{parseFloat(item.itemInstance.fats * item.amount).toFixed()}g&nbsp;fats
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            : null
                                                    )
                                                    : <Text style={globalStyles.notation}>{i18n.t('components')['cards']['caloriesIntake']['noFoodAdded']}</Text>
                                            }
                                        </View>
                                    )
                                    : null
                            }
                            {
                                !this.props.client
                                    ? <View>
                                        <Pressable style={({ pressed }) => [
                                            globalStyles.authPageActionButton,
                                            {
                                                backgroundColor: cardColors.caloriesIntake,
                                                marginTop: 16
                                            }
                                        ]}
                                            onPress={() => {
                                                this.props.actionButtonFunction();
                                            }}>
                                            <Text style={globalStyles.authPageActionButtonText}>{i18n.t('components')['cards']['caloriesIntake']['redirectButton']}</Text>
                                        </Pressable>
                                    </View>
                                    : null
                            }
                        </>
                }
            </View>
        </Pressable>;
    }
}
