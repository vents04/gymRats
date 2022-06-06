import React, { Component } from 'react'
import { Text, Pressable, View, ScrollView, TextInput, Image, Alert, BackHandler } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import i18n from 'i18n-js';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles'
import styles from './PasswordRecovery.styles';

export default class PasswordRecovery extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            code: "",
            password: "",
            repeatedPassword: "",
            showError: false,
            error: "",
            showPasswordEntry: false,
            showCodeEntry: false,
            showEmailEntry: true,
        }
    }

    backAction = () => {
        this.props.navigation.navigate("Login")
        return true;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    checkCode = () => {
        ApiRequests.get(`user/check-password-recovery-code?identifier=${this.state.identifier}&code=${this.state.code}`).then((response) => {
            this.setState({ showError: false, showPasswordEntry: true, showCodeEntry: false, showEmailEntry: false });
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

    generatePasswordRecoveryCode = () => {
        ApiRequests.post(`user/password-recovery-code`, {}, {
            email: this.state.email
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

    submitNewPassword = () => {
        if (this.state.password != this.state.repeatedPassword) {
            this.setState({ showError: true, error: "Repeated password is different" });
            return;
        }
        ApiRequests.put(`user/password`, {}, {
            code: this.state.code,
            identifier: this.state.identifier,
            password: this.state.password
        }, false).then(response => {
            Alert.alert(i18n.t('screens')['passwordRecovery']['passwordUpdated'], i18n.t('screens')['passwordRecovery']['alertText'], [{
                text: "OK",
                onPress: () => {
                    this.props.navigation.navigate("Login");
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
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['passwordRecovery']['pageTitle']}</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    {
                        this.state.showEmailEntry
                            ? <>
                                <TextInput
                                    value={this.state.email}
                                    style={globalStyles.authPageInput}
                                    placeholder={i18n.t('screens')['passwordRecovery']['enterAccountEmail']}
                                    onChangeText={(val) => { this.setState({ email: val, showError: false }) }} />
                                <Pressable style={({ pressed }) => [
                                    globalStyles.authPageActionButton,
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                        marginTop: 16
                                    }
                                ]} onPress={() => {
                                    this.generatePasswordRecoveryCode();
                                }}>
                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['passwordRecovery']['sentRecoveryCode']}</Text>
                                </Pressable>
                            </>
                            : null
                    }
                    {
                        this.state.showCodeEntry
                            ? <>
                                <View style={styles.unknownSourceCaloriesIncentiveContainer}>
                                    <Text style={styles.unknownSourceCaloriesIncentiveText}>{i18n.t('screens')['passwordRecovery']['recievedCode']}</Text>
                                </View>
                                <TextInput
                                    keyboardType='numeric'
                                    value={this.state.code}
                                    style={globalStyles.authPageInput}
                                    placeholder={i18n.t('screens')['passwordRecovery']['enterCode']}
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
                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['passwordRecovery']['actionButton']}</Text>
                                </Pressable>
                            </>
                            : null
                    }
                    {
                        this.state.showPasswordEntry
                            ? <>
                                <TextInput
                                    value={this.state.password}
                                    style={globalStyles.authPageInput}
                                    secureTextEntry={true}
                                    placeholder={i18n.t('screens')['passwordRecovery']['enterNewPassword']}
                                    onChangeText={(val) => { this.setState({ password: val, showError: false }) }} />
                                <TextInput
                                    value={this.state.repeatedPassword}
                                    style={globalStyles.authPageInput}
                                    secureTextEntry={true}
                                    placeholder={i18n.t('screens')['passwordRecovery']['repeatNewPassword']}
                                    onChangeText={(val) => { this.setState({ repeatedPassword: val, showError: false }) }} />
                                <Pressable style={({ pressed }) => [
                                    globalStyles.authPageActionButton,
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                        marginTop: 16
                                    }
                                ]} onPress={() => {
                                    this.submitNewPassword();
                                }}>
                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['passwordRecovery']['actionButton']}</Text>
                                </Pressable>
                            </>
                            : null
                    }
                </View>
            </View>
        )
    }
}
