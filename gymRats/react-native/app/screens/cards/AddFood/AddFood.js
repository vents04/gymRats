import React, { Component } from 'react'
import { ScrollView, Text, TextInput, Pressable, View, BackHandler } from 'react-native'
import { Picker } from '@react-native-picker/picker';

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
            showError: false,
            error: ""
        }

        this.focusListener;
    }

    backAction = () => {
        this.props.navigation.navigate("SearchCaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
        return true;
    }

    onFocusFunction = () => {
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
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    addFood = () => {
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
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.backAction();
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </Pressable>
                        <Text style={globalStyles.followUpScreenTitle}>Create food item</Text>
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
                            <Text style={styles.inputSectionTitle}>Title</Text>
                            <TextInput
                                value={this.state.title}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ title: val, showError: false }) }} />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>Brand<Text style={styles.optional}>&nbsp;&middot;&nbsp;optional</Text></Text>
                            <TextInput
                                value={this.state.brand}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ brand: val, showError: false }) }} />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>Barcode<Text style={styles.optional}>&nbsp;&middot;&nbsp;optional</Text></Text>
                            {
                                this.state.barcode &&
                                    this.state.barcode.length > 0
                                    ? <Text style={globalStyles.notation}>Already linked</Text>
                                    : <Pressable style={({ pressed }) => [
                                        globalStyles.authPageActionButton,
                                        {
                                            opacity: pressed ? 0.1 : 1,
                                            width: "50%"
                                        }
                                    ]} onPress={() => {
                                        this.props.navigation.navigate("BarcodeReader", { isAddingBarcodeToFood: true, date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset, meal: this.props.route.params.meal })
                                    }}>
                                        <Text style={globalStyles.authPageActionButtonText}>Add barcode</Text>
                                    </Pressable>
                            }
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>Serving unit</Text>
                            <Picker
                                style={styles.inputSectionInput}
                                selectedValue={this.state.unit}
                                onValueChange={(value) =>
                                    this.setState({ unit: value, showError: false })
                                }>
                                <Picker.Item style={{ fontFamily: 'MainRegular' }} label="Grams" value={CALORIES_COUNTER_UNITS.GRAMS} />
                                <Picker.Item style={{ fontFamily: 'MainRegular' }} label="Milliliters" value={CALORIES_COUNTER_UNITS.MILLILITERS} />
                            </Picker>
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>Calories per 100 {this.state.unit.toLowerCase()}</Text>
                            <TextInput
                                keyboardType='numeric'
                                value={this.state.calories}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ calories: val, showError: false }) }} />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>How many grams of carbs per 100 {this.state.unit.toLowerCase()}?</Text>
                            <TextInput
                                keyboardType='numeric'
                                value={this.state.carbs}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ carbs: val, showError: false }) }} />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>How many grams of proteins per 100 {this.state.unit.toLowerCase()}?</Text>
                            <TextInput
                                keyboardType='numeric'
                                value={this.state.protein}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ protein: val, showError: false }) }} />
                        </View>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>How many grams of fats per 100 {this.state.unit.toLowerCase()}?</Text>
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
                    ]} onPress={() => { this.addFood() }}>
                        <Text style={globalStyles.authPageActionButtonText}>Submit</Text>
                    </Pressable>
                </View>
            </View>
        )
    }
}
