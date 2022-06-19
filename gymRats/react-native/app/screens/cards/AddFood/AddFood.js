import React, { Component } from 'react'
import { ScrollView, Text, TextInput, Pressable, View, BackHandler, ActivityIndicator } from 'react-native'
import { Picker } from '@react-native-picker/picker';
import i18n from 'i18n-js';
import DropDownPicker from 'react-native-dropdown-picker'

import ApiRequests from '../../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { CALORIES_COUNTER_SCREEN_INTENTS, CALORIES_COUNTER_UNITS, HTTP_STATUS_CODES } from '../../../../global';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './AddFood.styles';

export default class AddFood extends Component {

    constructor(props) {
        super(props);

        this.state = {
            title: "",
            brand: "",
            barcode: "",
            unit: CALORIES_COUNTER_UNITS.GRAMS,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            unitPickerValues: [],
            isUnitPickerOpened: false,
            showError: false,
            error: "",
            showLoading: false,
        }

        this.focusListener;
    }

    backAction = () => {
        this.props.navigation.navigate("SearchCaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
        return true;
    }

    onFocusFunction = () => {
        console.log(this.props.route.params)
        if (this.props.route.params.barcode) {
            this.setState({
                barcode: this.props.route.params.barcode
            })
        }
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
        BackHandler.addEventListener('hardwareBackPress', this.backAction);
        this.setServingUnitValues();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    setServingUnitValues = () => {
        let servingUnitValues = [
            { value: CALORIES_COUNTER_UNITS.GRAMS, label: i18n.t('common')['foodUnits']['GRAMS'] },
            { value: CALORIES_COUNTER_UNITS.MILLILITERS, label: i18n.t('common')['foodUnits']['MILLILITERS'] },
        ]
        this.setState({ unitPickerValues: servingUnitValues });
    }

    addFood = () => {
        this.setState({ showLoading: true }, () => {
            const payload = {
                title: this.state.title,
                unit: this.state.unit,
                calories: this.state.calories,
                carbs: this.state.carbs,
                protein: this.state.protein,
                fats: this.state.fats
            }
            if (this.state.barcode?.length > 0) payload.barcode = this.state.barcode;
            if (this.state.brand?.length > 0) payload.brand = this.state.brand;
            ApiRequests.post('calories-counter/item', {}, payload, true).then((response) => {
                this.props.navigation.navigate("AddCaloriesIntakeItem", {
                    intent: CALORIES_COUNTER_SCREEN_INTENTS.ADD,
                    item: response.data.item,
                    meal: this.props.route.params.meal,
                    date: this.props.route.params.date,
                    timezoneOffset: this.props.route.params.timezoneOffset
                })
            }).catch((error) => {
                if (error.response) {
                    if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
                        this.setState({ showError: true, error: error.response.data });
                    } else {
                        ApiRequests.showInternalServerError();
                    }
                } else if (error.request) {
                    ApiRequests.showNoResponseError();
                } else {
                    ApiRequests.showRequestSettingError();
                }
            }).finally(() => {
                this.setState({ showLoading: false });
            })
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
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['addFood']['title']}</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={[globalStyles.errorBox, {
                                marginTop: 16
                            }]}>{this.state.error}</Text>
                            : null
                    }
                    <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>{i18n.t('screens')['addFood']['titleInput']}</Text>
                            <TextInput
                                value={this.state.title}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ title: val, showError: false }) }} />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>{i18n.t('screens')['addFood']['brandInput']}<Text style={styles.optional}>&nbsp;&middot;&nbsp;{i18n.t('screens')['addFood']['optional']}</Text></Text>
                            <TextInput
                                value={this.state.brand}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ brand: val, showError: false }) }} />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>{i18n.t('screens')['addFood']['barcodeInput']}<Text style={styles.optional}>&nbsp;&middot;&nbsp;{i18n.t('screens')['addFood']['optional']}</Text></Text>
                            {
                                this.state.barcode &&
                                    this.state.barcode.length > 0
                                    ? <Text style={globalStyles.notation}>{i18n.t('screens')['addFood']['barcodeAlreadyLinked']}</Text>
                                    : <Pressable style={({ pressed }) => [
                                        globalStyles.authPageActionButton,
                                        {
                                            opacity: pressed ? 0.1 : 1,
                                            width: "50%"
                                        }
                                    ]} onPress={() => {
                                        this.props.navigation.navigate("BarcodeReader", { isAddingBarcodeToFood: true, date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset, meal: this.props.route.params.meal })
                                    }}>
                                        <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['addFood']['addBarcode']}</Text>
                                    </Pressable>
                            }
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>{i18n.t('screens')['addFood']['servingUnitInput']}</Text>
                            <DropDownPicker
                                placeholder={i18n.t('screens')['addFood']['servingUnitPlaceholder']}
                                maxHeight={150}
                                open={this.state.isUnitPickerOpened}
                                setOpen={(value) => {
                                    this.setState({ isUnitPickerOpened: value })
                                }}
                                value={this.state.unit}
                                setValue={(callback) => {
                                    this.setState(state => ({
                                        unit: callback(state.value),
                                    }));
                                }}
                                items={this.state.unitPickerValues}
                                setItems={(callback) => {
                                    this.setState(state => ({
                                        unitPickerValues: callback(state.items)
                                    }));
                                }}
                                onChangeItem={item => { }}
                                zIndex={10000}
                                textStyle={{
                                    fontFamily: 'MainMedium',
                                    fontSize: 14,
                                    textTransform: "capitalize",
                                }}
                                dropDownContainerStyle={{
                                    borderColor: "#ccc",
                                }}
                                style={{
                                    borderColor: "#ccc",
                                    marginBottom: 16
                                }}
                            />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>{i18n.t('screens')['addFood']['caloriesInput']} {i18n.t('common')['foodUnits'][this.state.unit]}</Text>
                            <TextInput
                                keyboardType='numeric'
                                value={this.state.calories}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ calories: val, showError: false }) }} />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>{i18n.t('screens')['addFood']['carbsInput']} {i18n.t('common')['foodUnits'][this.state.unit]}</Text>
                            <TextInput
                                keyboardType='numeric'
                                value={this.state.carbs}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ carbs: val, showError: false }) }} />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>{i18n.t('screens')['addFood']['proteinsInput']} {i18n.t('common')['foodUnits'][this.state.unit]}</Text>
                            <TextInput
                                keyboardType='numeric'
                                value={this.state.protein}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ protein: val, showError: false }) }} />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>{i18n.t('screens')['addFood']['fatsInput']} {i18n.t('common')['foodUnits'][this.state.unit]}</Text>
                            <TextInput
                                keyboardType='numeric'
                                value={this.state.fats}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ fats: val, showError: false }) }} />
                        </View>
                    </ScrollView>
                    <Pressable style={({ pressed }) => [
                        globalStyles.authPageActionButton,
                        {
                            opacity: pressed ? 0.1 : 1,
                            marginVertical: 16
                        }
                    ]} onPress={() => { if (!this.state.showLoading) this.addFood() }}>
                        {
                            !this.state.showLoading
                                ? <Text style={globalStyles.authPageActionButtonText}>{i18n.t('common')['submit']}</Text>
                                : <ActivityIndicator
                                    size="small"
                                    color="#fff"
                                    animating={true} />
                        }
                    </Pressable>
                </View>
            </View>
        )
    }
}
