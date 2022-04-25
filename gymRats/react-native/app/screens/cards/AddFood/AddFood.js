import React, { Component } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Picker } from '@react-native-picker/picker';

import ApiRequests from '../../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { CALORIES_COUNTER_UNITS, HTTP_STATUS_CODES } from '../../../../global';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './AddFood.styles';

export default class AddFood extends Component {

    constructor(props) {
        super(props);

        this.state = {
            title: "",
            brand: "",
            unit: CALORIES_COUNTER_UNITS.GRAMS,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            showError: false,
            error: ""
        }
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
        if (this.state.brand?.length > 0) payload.brand = this.state.brand;
        ApiRequests.post('calories-counter/item', {}, payload, true).then((response) => {
            this.props.navigation.navigate("SearchCaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset, query: this.state.title })
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
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("SearchCaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </TouchableOpacity>
                        <Text style={globalStyles.followUpScreenTitle}>Create food item</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={[globalStyles.errorBox, {
                                marginTop: 16
                            }]}>{this.state.error}</Text>
                            : null
                    }
                    <ScrollView contentContainerStyle={{
                        flexGrow: 1,
                        flexShrink: 1
                    }}>
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
                            <Text style={styles.inputSectionTitle}>Serving unit</Text>
                            <Picker
                                style={styles.inputSectionInput}
                                selectedValue={this.state.unit}
                                onValueChange={(value) =>
                                    this.setState({ meal: value, showError: false })
                                }>
                                <Picker.Item label="Grams" value={CALORIES_COUNTER_UNITS.GRAMS} />
                                <Picker.Item label="Milliliters" value={CALORIES_COUNTER_UNITS.MILLILITERS} />
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
                    <TouchableOpacity style={[globalStyles.authPageActionButton, {
                        marginTop: 16
                    }]} onPress={() => { this.addFood() }}>
                        <Text style={globalStyles.authPageActionButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}
