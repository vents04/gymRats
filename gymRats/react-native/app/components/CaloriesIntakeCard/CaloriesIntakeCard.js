import React, { Component } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { FaWeight, FaLongArrowAltUp, FaLongArrowAltDown } from 'react-icons/fa';
import { GiMeal } from 'react-icons/gi';
import { AiFillDelete } from 'react-icons/ai';
import ApiRequests from '../../classes/ApiRequests';
import ConfirmationBox from '../ConfirmationBox/ConfirmationBox';
import { HTTP_STATUS_CODES, CALORIES_COUNTER_MEALS } from '../../../global';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import i18n from 'i18n-js';

const { cardColors } = require('../../../assets/styles/cardColors');
const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./CaloriesIntakeCard.styles');

export default class CaloriesIntakeCard extends Component {

    state = {
        showConfirmationBox: false,
        calorieCounterDay: null,
        data: null
    }

    mealTitles = {
        BREAKFAST: "Breakfast",
        LUNCH: "Lunch",
        DINNER: "Dinner",
        SNACKS: "Snacks"
    }

    componentDidMount() {
        this.calculateMacros();
        if (this.props.client) this.getClientCaloriesCounterDay();
        setTimeout(() => {
            console.log(this.state)
        }, 2000);
    }

    calculateMacros = () => {
        this.setState({ data: this.props.data });
        let calories = 0;
        let carbs = 0;
        let fats = 0;
        let protein = 0;

        for (let data of this.props.data.items) {
            calories += parseInt(data.amount * data.itemInstance.calories);
            carbs += parseInt(data.amount * data.itemInstance.carbs);
            fats += parseInt(data.amount * data.itemInstance.fats);
            protein += parseInt(data.amount * data.itemInstance.protein);
        }

        this.setState({
            calories,
            carbs,
            fats,
            protein
        }, () => {
            console.log(this.state)
        })
    }

    toggleShowConfirmationBox = (state) => {
        this.setState({ showConfirmationBox: state });
    }

    deleteCard = () => {
        ApiRequests.delete(`calories-counter/${this.props.data._id}`, {}, true).then((response) => {
            this.toggleShowConfirmationBox(false);
            this.props.rerender(this.props.date);
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
        return <View style={globalStyles.card}>
            {this.state.showConfirmationBox && <ConfirmationBox deleteCard={this.deleteCard} toggleShowConfirmationBox={this.toggleShowConfirmationBox} />}
            <View style={globalStyles.cardTopbar}>
                <GiMeal size={25} color={cardColors.caloriesIntake} />
                <Text style={globalStyles.cardTitle}>Calories intake</Text>
                {
                    !this.props.client
                    && <View style={globalStyles.cardTopbarIcon}>
                        <AiFillDelete size={25} color="#ddd" onClick={() => {
                            this.setState({ showConfirmationBox: true })
                        }} />
                    </View>
                }
            </View>
            <Text style={styles.calories}>{this.state.calories} calories</Text>
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
                        onAnimationComplete={() => console.log('onAnimationComplete')}
                        backgroundColor="#3d5875"
                        children={(fill) => {
                            return (
                                <Text style={styles.macronutrientsRatioCircleTitle}>
                                    {this.state.carbs}g
                                </Text>
                            )
                        }}
                    />
                    <Text style={styles.macroCircleTitle}>carbs</Text>
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
                        onAnimationComplete={() => console.log('onAnimationComplete')}
                        backgroundColor="#3d5875"
                        children={(fill) => {
                            return (
                                <Text style={styles.macronutrientsRatioCircleTitle}>
                                    {this.state.protein}g
                                </Text>
                            )
                        }}
                    />
                    <Text style={styles.macroCircleTitle}>proteins</Text>
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
                        onAnimationComplete={() => console.log('onAnimationComplete')}
                        backgroundColor="#3d5875"
                        children={(fill) => {
                            return (
                                <Text style={styles.macronutrientsRatioCircleTitle}>
                                    {this.state.fats}g
                                </Text>
                            )
                        }}
                    />
                    <Text style={styles.macroCircleTitle}>fats</Text>
                </View>
            </View>
            {
                this.props.client
                && Object.keys(CALORIES_COUNTER_MEALS).map(key =>
                    <View key={key} style={styles.mealContainer}>
                        <View style={styles.mealTopBar}>
                            <Text style={styles.mealTitle}>{this.mealTitles[key]}</Text>
                        </View>
                        {
                            this.state.calorieCounterDay &&
                                this.state.calorieCounterDay.items.some(item => item.meal == key)
                                ? this.state.calorieCounterDay.items.map(item =>
                                    item.meal == key &&
                                    <View key={item._id} style={styles.itemContainer}>
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
                                )
                                : <Text style={globalStyles.notation}>No food added for {this.mealTitles[key]}</Text>
                        }
                    </View>
                )
            }
            {
                !this.props.client
                && <View>
                    <TouchableOpacity style={[globalStyles.authPageActionButton, {
                        backgroundColor: cardColors.caloriesIntake,
                        marginTop: 16
                    }]} onPress={() => {
                        this.props.actionButtonFunction();
                    }}>
                        <Text style={globalStyles.authPageActionButtonText}>Add or update food</Text>
                    </TouchableOpacity>
                </View>
            }
        </View>;
    }
}
