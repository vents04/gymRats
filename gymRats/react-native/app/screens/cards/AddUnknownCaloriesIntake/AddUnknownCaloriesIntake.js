import React, { Component } from 'react'
import { Text, View, ScrollView, Pressable, BackHandler, TextInput } from 'react-native'

import ApiRequests from '../../../classes/ApiRequests';
import { BackButtonHandler } from '../../../classes/BackButtonHandler';

import { Ionicons } from '@expo/vector-icons';

import { cardColors } from '../../../../assets/styles/cardColors';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './AddUnknownCaloriesIntake.styles';
import { HTTP_STATUS_CODES } from '../../../../global';

export default class AddUnknownCaloriesIntake extends Component {

    constructor(props) {
        super(props)

        this.state = {
            showError: false,
            error: '',
            calories: 0
        }
    }

    backAction = () => {
        this.props.navigation.navigate("CaloriesIntake", {
            date: this.props.route.params.date,
            timezoneOffset: this.props.route.params.timezoneOffset
        })
        return true;
    }

    addUnknownSourceCalories = () => {
        ApiRequests.post("calories-counter/unknown-source-calories", {}, {
            calories: this.state.calories,
            date: this.props.route.params.date.getDate(),
            month: this.props.route.params.date.getMonth() + 1,
            year: this.props.route.params.date.getFullYear()
        }, true).then((response) => {
            this.backAction();
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
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.backAction()
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </Pressable>
                        <Text style={globalStyles.followUpScreenTitle}>Add unknown source calories</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                        <Text style={globalStyles.notation}>The macros for unknown source calories are the following: 40% carbs, 30% protein, 30% fats</Text>
                        <View style={styles.inputSection}>
                            <Text style={styles.inputSectionTitle}>Calories estimate:</Text>
                            <TextInput
                                keyboardType='numeric'
                                value={this.state.calories}
                                style={styles.inputSectionInput}
                                onChangeText={(val) => { this.setState({ calories: val, showError: false }) }} />
                        </View>
                        <Pressable style={({ pressed }) => [
                            globalStyles.authPageActionButton,
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} onPress={() => {
                            this.addUnknownSourceCalories()
                        }}>
                            <Text style={globalStyles.authPageActionButtonText}>Submit</Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        )
    }
}