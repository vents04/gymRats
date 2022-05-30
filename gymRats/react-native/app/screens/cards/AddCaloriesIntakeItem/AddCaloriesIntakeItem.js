import React, { Component } from 'react'
import { Dimensions, ScrollView, Text, TextInput, Pressable, View, BackHandler } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Picker } from '@react-native-picker/picker';

import ApiRequests from '../../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { CALORIES_COUNTER_SCREEN_INTENTS, HTTP_STATUS_CODES } from '../../../../global';
import { cardColors } from '../../../../assets/styles/cardColors';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './AddCaloriesIntakeItem.styles';

export default class AddCaloriesIntakeItem extends Component {

    constructor(props) {
        super(props);

        this.state = {
            amount: 100,
            meal: this.props.route.params.meal || "BREAKFAST",
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
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
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
                    ApiRequests.alert("Error", error.response.data, [{ text: "OK" }]);
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
                    ApiRequests.alert("Error", error.response.data, [{ text: "OK" }]);
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
                                ? "Add"
                                : "Update"
                        }&nbsp;food</Text>
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
                                <Text style={styles.nutritionalInfoTitle}>{this.props.route.params.item.unit.toLowerCase()}</Text>
                            </View>
                            <Picker
                                style={styles.editSectionInput}
                                selectedValue={this.state.meal}
                                onValueChange={(value, index) =>
                                    this.setState({ meal: value, showError: false })
                                }>
                                <Picker.Item label="Breakfast" value="BREAKFAST" />
                                <Picker.Item label="Lunch" value="LUNCH" />
                                <Picker.Item label="Dinner" value="DINNER" />
                                <Picker.Item label="Snacks" value="SNACKS" />
                            </Picker>
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
                                        ? "Add"
                                        : "Update"
                                }&nbsp;food
                            </Text>
                        </Pressable>
                        <View style={styles.statsContainer}>
                            <Text style={styles.statsTitle}>Macronutrients ratio</Text>
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
                                    <Text style={styles.macroCircleTitle}>carbs</Text>
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
                                    <Text style={styles.macroCircleTitle}>proteins</Text>
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
                                    <Text style={styles.macroCircleTitle}>fats</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.statsContainer}>
                            <Text style={styles.statsTitle}>Nutritional info per {this.state.amount} {this.props.route.params.item.unit.toLowerCase()}</Text>
                            <View style={styles.nutritionalInfoContainer}>
                                <Text style={styles.nutritionalInfoTitle}>Calories</Text>
                                <Text style={styles.nutritionalInfoValue}>{parseFloat(this.props.route.params.item.calories * this.state.amount).toFixed()}kcal</Text>
                            </View>
                            <View style={styles.nutritionalInfoContainer}>
                                <Text style={styles.nutritionalInfoTitle}>Carbs</Text>
                                <Text style={styles.nutritionalInfoValue}>{parseFloat(this.props.route.params.item.carbs * this.state.amount).toFixed()}g</Text>
                            </View>
                            <View style={styles.nutritionalInfoContainer}>
                                <Text style={styles.nutritionalInfoTitle}>Proteins</Text>
                                <Text style={styles.nutritionalInfoValue}>{parseFloat(this.props.route.params.item.protein * this.state.amount).toFixed()}g</Text>
                            </View>
                            <View style={styles.nutritionalInfoContainer}>
                                <Text style={styles.nutritionalInfoTitle}>Fats</Text>
                                <Text style={styles.nutritionalInfoValue}>{parseFloat(this.props.route.params.item.fats * this.state.amount).toFixed()}g</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}
