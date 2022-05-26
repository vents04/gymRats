import React, { Component } from 'react'
import { Text, Pressable, View, ScrollView, TextInput, Image, Alert } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles'
import styles from './EmailVerficiation.styles';

/*
This screen will work in the following way:
- user gets redirected from login (if email is not verified (should modify the login response payload to have a boolean field for verifiedEmail)) or from signup (right after account creation)
    - when navigating make sure to pass user's email as a param (this.props.navigation.navigate("EmailVerification", {param1: ..., param2: ...}))
- user should enter the code from their email
    - proper error messages when: code has expired, code is invalid
- user gets redirected to calendar screen if everything went as expected
*/

export default class EmailVerification extends Component {

    constructor(props) {
        super(props);

        this.state = {
            code: "",
            showError: false,
            error: "",
        }
    }

    backAction = () => {
        // navigate to previous screen
    }

    checkCode = () => {
        // endpoint to check if the code is valid
    }

    generateEmailVerificationCode = () => {
        // endpoint to generate and send an email verification code
    }

    componentDidMount = () => {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
    }

    onFocusFunction = () => {
        this.generateEmailVerificationCode();
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
                        <Text style={globalStyles.followUpScreenTitle}>Email verification</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <TextInput
                        value={this.state.code}
                        style={globalStyles.authPageInput}
                        placeholder="Enter code sent to your email:"
                        onChangeText={(val) => { this.setState({ code: val, showError: false }) }} />
                    <Pressable style={({ pressed }) => [
                        globalStyles.authPageActionButton,
                        {
                            opacity: pressed ? 0.1 : 1,
                            marginTop: 16
                        }
                    ]} onPress={() => {
                        this.checkCode();
                    }}>
                        <Text style={globalStyles.authPageActionButtonText}>Verify email</Text>
                    </Pressable>
                </View>
            </View>
        )
    }
}
