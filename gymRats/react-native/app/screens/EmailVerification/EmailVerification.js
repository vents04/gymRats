import React, { Component } from 'react'
import { Text, Pressable, View, ScrollView, TextInput, Image, Alert } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';
import Auth from '../../classes/Auth';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles'
import styles from './EmailVerficiation.styles';

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
        ApiRequests.get(`user/check-email-verification-code?identifier=${this.state.identifier}&code=${this.state.code}`).then(async (response) => {
            await Auth.setToken(response.data.token);
            this.setState({ showError: false, showPasswordEntry: true, showCodeEntry: false, showEmailEntry: false });
            Alert.alert("Email Verified", "Your email has successfully been verified.", [{
                text: "OK",
                onPress: () => {
                    this.props.navigation.replace('NavigationRoutes');
                }
            }]);
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

    generateEmailVerificationCode = () => {
        ApiRequests.post(`user/email-verification-code`, {}, {
            email: this.props.route.params.email.trim()
        }, false).then((response) => {
            console.log(response.data);
            this.setState({ identifier: response.data.identifier, showEmailEntry: false, showCodeEntry: true, showPasswordEntry: false })
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
                        placeholder="Enter the code sent to your email:"
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
