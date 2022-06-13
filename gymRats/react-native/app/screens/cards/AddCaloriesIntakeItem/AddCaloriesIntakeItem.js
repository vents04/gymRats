import React, { Component } from 'react'
import { Dimensions, ScrollView, Text, TextInput, Pressable, View, BackHandler } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Picker } from '@react-native-picker/picker';
import i18n from 'i18n-js'
import DropDownPicker from 'react-native-dropdown-picker'

import ApiRequests from '../../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { CALORIES_COUNTER_MEALS, CALORIES_COUNTER_SCREEN_INTENTS, HTTP_STATUS_CODES, MEAL_TITLES } from '../../../../global';
import { cardColors } from '../../../../assets/styles/cardColors';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './AddCaloriesIntakeItem.styles';

export default class AddCaloriesIntakeItem extends Component {

    constructor(props) {
        super(props);

        this.state = {
            amount: 100,
            meal: this.props.route.params.meal || "BREAKFAST",
            mealPickerValues: [],
            isMealPickerOpened: false,
            showError: false,
            error: ""
        }
    }


    backAction = () => {
        (!this.props.route.params.previousScreen)
            ? this.props.navigation.navigate("SearchCaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset, meal: this.state.meal })
            : this.props.navigation.navigate(this.props.route.params.previousScreen, { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset, meal: this.state.meal })
        return true;
    }

    componentDidMount() {
        if (this.props.route.params.intent == CALORIES_COUNTER_SCREEN_INTENTS.UPDATE)
            this.setState({ amount: parseInt(this.props.route.params.amount) });
        if (this.props.route.params.amount)
            this.setState({ amount: parseInt(this.props.route.params.amount) });
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
        this.setMealPickerValues();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    setMealPickerValues = () => {
        let mealPickerValues = [];
        Object.keys(CALORIES_COUNTER_MEALS).map((meal) =>
            mealPickerValues.push({ value: meal, label: i18n.t('common')['meals'][meal] })
        )
        this.setState({ mealPickerValues })
    }

    addFood = () => {
        ApiRequests.post(`calories-counter/daily-item`, {}, {
            date: +new Date(this.props.route.params.date).getDate(),
            month: +new Date(this.props.route.params.date).getMonth() + 1,
            year: +new Date(this.props.route.params.date).getFullYear(),
            itemId: this.props.route.params.item._id,
            meal: this.state.meal,
            dt: new Date().getTime(),
            amount: this.state.amount
        }, true).then((response) => {
            this.props.navigation.navigate("CaloriesIntake", {
                date: this.props.route.params.date,
                timezoneOffset: this.props.route.params.timezoneOffset
            })
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    ApiRequests.alert(i18n.t('errors')['error'], error.response.data, [{ text: "OK" }]);
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

    updateFood = () => {
        ApiRequests.put(`calories-counter/${this.props.route.params.dayId}/${this.props.route.params.itemId}`, {}, {
            meal: this.state.meal,
            amount: this.state.amount
        }, true).then((response) => {
            this.props.navigation.navigate("CaloriesIntake", {
                date: this.props.route.params.date,
                timezoneOffset: this.props.route.params.timezoneOffset
            })
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    ApiRequests.alert(i18n.t('errors')['error'], error.response.data, [{ text: "OK" }]);
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
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.backAction();
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </Pressable>
                        <Text style={globalStyles.followUpScreenTitle}>{
                            this.props.route.params.intent == CALORIES_COUNTER_SCREEN_INTENTS.ADD
                                ? i18n.t('screens')['addCaloriesIntakeItem']['add']
                                : i18n.t('screens')['addCaloriesIntakeItem']['update']
                        }&nbsp;{i18n.t('screens')['addCaloriesIntakeItem']['food']}</Text>
                    </View>
                    <ScrollView contentContainerStyle={[globalStyles.fillEmptySpace, {
                        paddingBottom: 150
                    }]}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.foodTitleContainer}>
                            <Text style={styles.foodTitle}>{this.props.route.params.item.title}</Text>
                            {
                                this.props.route.params.item.brand
                                    ? <Text style={styles.foodBrand}>{this.props.route.params.item.brand}</Text>
                                    : null
                            }
                            {
                                this.props.route.params.item.userInstance
                                    ? <View style={styles.user}>
                                        {
                                            !this.props.route.params.item.userInstance.profilePicture
                                                ? <View style={styles.profilePictureContainer}>
                                                    <Text style={styles.noProfilePictureText}>
                                                        {this.props.route.params.item.userInstance.firstName.charAt(0)}
                                                        {this.props.route.params.item.userInstance.lastName.charAt(0)}
                                                    </Text>
                                                </View>
                                                : <Image style={styles.profilePictureContainer}
                                                    source={{ uri: this.props.route.params.item.userInstance.profilePicture }} />
                                        }
                                        <Text style={styles.names}>
                                            {this.props.route.params.item.userInstance.firstName}
                                            &nbsp;
                                            {this.props.route.params.item.userInstance.lastName}
                                        </Text>
                                    </View>
                                    : null
                            }
                        </View>
                        <View style={styles.inputContainer}>
                            <View style={[globalStyles.authPageInput, styles.amountInputContainer]}>
                                <TextInput
                                    keyboardType='numeric'
                                    defaultValue={this.state.amount.toString()}
                                    value={this.state.amount}
                                    style={styles.amountInput}
                                    onChangeText={(val) => { this.setState({ amount: val, showError: false }) }} />
                                <Text style={styles.nutritionalInfoTitle}>{i18n.t('common')['foodUnits'][this.props.route.params.item.unit]}</Text>
                            </View>
                            <DropDownPicker
                                placeholder={i18n.t('screens')['addCaloriesIntakeItem']['mealPickerPlaceholder']}
                                maxHeight={200}
                                open={this.state.isMealPickerOpened}
                                setOpen={(value) => {
                                    this.setState({ isMealPickerOpened: value })
                                }}
                                value={this.state.meal}
                                setValue={(callback) => {
                                    this.setState(state => ({
                                        meal: callback(state.value),
                                    }));
                                }}
                                items={this.state.mealPickerValues}
                                setItems={(callback) => {
                                    this.setState(state => ({
                                        mealPickerValues: callback(state.items)
                                    }));
                                }}
                                onChangeItem={item => { }}
                                zIndex={10000}
                                textStyle={{
                                    fontFamily: 'MainMedium',
                                    fontSize: 14,
                                }}
                                dropDownContainerStyle={{
                                    borderColor: "#ccc",
                                    width: "50%",
                                    marginLeft: 16,
                                }}
                                style={[styles.editSectionInput, {
                                    borderColor: "#ccc",
                                }]}
                            />
                        </View>
                        <Pressable style={({ pressed }) => [
                            globalStyles.authPageActionButton,
                            {
                                opacity: pressed ? 0.1 : 1,
                                backgroundColor: cardColors.caloriesIntake,
                                marginTop: 8
                            }
                        ]} onPress={() => {
                            (this.props.route.params.intent == CALORIES_COUNTER_SCREEN_INTENTS.ADD)
                                ? this.addFood()
                                : this.updateFood()
                        }}>
                            <Text style={globalStyles.authPageActionButtonText}>
                                {
                                    this.props.route.params.intent == CALORIES_COUNTER_SCREEN_INTENTS.ADD
                                        ? i18n.t('screens')['addCaloriesIntakeItem']['add']
                                        : i18n.t('screens')['addCaloriesIntakeItem']['update']
                                }&nbsp;{i18n.t('screens')['addCaloriesIntakeItem']['food']}
                            </Text>
                        </Pressable>
                        <View style={styles.statsContainer}>
                            <Text style={styles.statsTitle}>{i18n.t('screens')['addCaloriesIntakeItem']['macronutrients']}</Text>
                            <View style={[styles.inline, styles.macronutrientsCircles]}>
                                <View style={styles.macronutrientsCirclesContainer}>
                                    <AnimatedCircularProgress
                                        ref={(ref) => this.circularProgress = ref}
                                        size={Dimensions.get('window').width * 0.2}
                                        width={Dimensions.get('window').width * 0.2 * 0.1}
                                        fill={
                                            !Number.isNaN(this.props.route.params.item.carbs /
                                                (this.props.route.params.item.carbs + this.props.route.params.item.fats + this.props.route.params.item.protein)
                                                * 100)
                                                ? (this.props.route.params.item.carbs /
                                                    (this.props.route.params.item.carbs + this.props.route.params.item.fats + this.props.route.params.item.protein)
                                                    * 100)
                                                : 33
                                        }
                                        rotation={0}
                                        tintColor={cardColors.caloriesIntake}
                                        backgroundColor="#3d5875"
                                        children={(fill) => {
                                            return (
                                                <Text style={styles.macronutrientsRatioCircleTitle}>
                                                    {parseInt(fill)}%
                                                </Text>
                                            )
                                        }}
                                    />
                                    <Text style={styles.macroCircleTitle}>{
                                        i18n.locale.includes("bg")
                                            ? i18n.t('common')['macros']['carbsShortened']
                                            : i18n.t('common')['macros']['carbs']
                                    }</Text>
                                </View>
                                <View style={styles.macronutrientsCirclesContainer}>
                                    <AnimatedCircularProgress
                                        ref={(ref) => this.circularProgress = ref}
                                        size={Dimensions.get('window').width * 0.2}
                                        width={Dimensions.get('window').width * 0.2 * 0.1}
                                        fill={
                                            !Number.isNaN(this.props.route.params.item.protein /
                                                (this.props.route.params.item.carbs + this.props.route.params.item.fats + this.props.route.params.item.protein)
                                                * 100)
                                                ? this.props.route.params.item.protein /
                                                (this.props.route.params.item.carbs + this.props.route.params.item.fats + this.props.route.params.item.protein)
                                                * 100
                                                : 33
                                        }
                                        rotation={0}
                                        tintColor={cardColors.caloriesIntake}
                                        backgroundColor="#3d5875"
                                        children={(fill) => {
                                            return (
                                                <Text style={styles.macronutrientsRatioCircleTitle}>
                                                    {parseInt(fill)}%
                                                </Text>
                                            )
                                        }}
                                    />
                                    <Text style={styles.macroCircleTitle}>{i18n.t('common')['macros']['proteins']}</Text>
                                </View>
                                <View style={styles.macronutrientsCirclesContainer}>
                                    <AnimatedCircularProgress
                                        ref={(ref) => this.circularProgress = ref}
                                        size={Dimensions.get('window').width * 0.2}
                                        width={Dimensions.get('window').width * 0.2 * 0.1}
                                        fill={
                                            !Number.isNaN(this.props.route.params.item.fats /
                                                (this.props.route.params.item.carbs + this.props.route.params.item.fats + this.props.route.params.item.protein)
                                                * 100)
                                                ? this.props.route.params.item.fats /
                                                (this.props.route.params.item.carbs + this.props.route.params.item.fats + this.props.route.params.item.protein)
                                                * 100
                                                : 33
                                        }
                                        rotation={0}
                                        tintColor={cardColors.caloriesIntake}
                                        backgroundColor="#3d5875"
                                        children={(fill) => {
                                            return (
                                                <Text style={styles.macronutrientsRatioCircleTitle}>
                                                    {parseInt(fill)}%
                                                </Text>
                                            )
                                        }}
                                    />
                                    <Text style={styles.macroCircleTitle}>{i18n.t('common')['macros']['fats']}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.statsContainer}>
                            <Text style={styles.statsTitle}>{i18n.t('screens')['addCaloriesIntakeItem']['nutritionalInfo'][0]} {this.state.amount} {i18n.t('common')['foodUnits'][this.props.route.params.item.unit]} {i18n.t('screens')['addCaloriesIntakeItem']['nutritionalInfo'][1]}</Text>
                            <View style={styles.nutritionalInfoContainer}>
                                <Text style={styles.nutritionalInfoTitle}>{i18n.t('common')['macros']['calories']}</Text>
                                <Text style={styles.nutritionalInfoValue}>{parseFloat(this.props.route.params.item.calories * this.state.amount).toFixed()} {i18n.t('common')['foodUnits']['CALORIES']}</Text>
                            </View>
                            <View style={styles.nutritionalInfoContainer}>
                                <Text style={styles.nutritionalInfoTitle}>{i18n.t('common')['macros']['carbs']}</Text>
                                <Text style={styles.nutritionalInfoValue}>{parseFloat(this.props.route.params.item.carbs * this.state.amount).toFixed()} {i18n.t('common')['foodUnits']['GRAMS']}</Text>
                            </View>
                            <View style={styles.nutritionalInfoContainer}>
                                <Text style={styles.nutritionalInfoTitle}>{i18n.t('common')['macros']['proteins']}</Text>
                                <Text style={styles.nutritionalInfoValue}>{parseFloat(this.props.route.params.item.protein * this.state.amount).toFixed()} {i18n.t('common')['foodUnits']['GRAMS']}</Text>
                            </View>
                            <View style={styles.nutritionalInfoContainer}>
                                <Text style={styles.nutritionalInfoTitle}>{i18n.t('common')['macros']['fats']}</Text>
                                <Text style={styles.nutritionalInfoValue}>{parseFloat(this.props.route.params.item.fats * this.state.amount).toFixed()} {i18n.t('common')['foodUnits']['GRAMS']}</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}
