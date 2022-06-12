import React, { Component } from 'react';
import { Keyboard, Text, View, Image, TextInput, Pressable, ActivityIndicator, Alert, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ApiRequests from '../../classes/ApiRequests';
import Auth from '../../classes/Auth';

import i18n from 'i18n-js';

import { HTTP_STATUS_CODES } from '../../../global';

import socketClass from '../../classes/Socket';

import globalStyles from '../../../assets/styles/global.styles';
import LogoBar from '../../components/LogoBar/LogoBar';
import { Platform } from 'react-native';

export default class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            showPassword: false,
            showError: false,
            error: "",
            isLoading: false
        }
    }

    componentDidMount() {
        if (this.props.route && this.props.route.params && this.props.route.params.email && this.props.route.params.email.length > 0) {
            this.props.navigation.navigate("EmailVerification", { email: this.props.route.params.email, doesNotComeFromSignup: true })
        }
    }

    login = () => {
        Keyboard.dismiss();
        this.setState({ showError: false, error: null, isLoading: true });
        ApiRequests.post("user/login", {}, {
            email: this.state.email.trim(),
            password: this.state.password
        }, false).then(async (response) => {
            if (response.data.verifiedEmail) {
                let chatsRoomSocket = socketClass.getChatsRoomSocket();
                if (!chatsRoomSocket) {
                    chatsRoomSocket = socketClass.initConnection();
                    socketClass.setChatsRoomSocket(chatsRoomSocket);
                }
                socketClass.joinChatsRoom();
                await Auth.setToken(response.data.token);
                this.props.navigation.replace('NavigationRoutes');
            } else {
                this.props.navigation.navigate("EmailVerification", { email: this.state.email.trim(), doesNotComeFromSignup: true })
            }
        }).catch((error) => {
            this.setState({ password: "" })
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
        }).finally(() => {
            this.setState({ isLoading: false })
        })
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <LogoBar />
                    <Text style={globalStyles.authPageTitle}>{i18n.t('screens')['login']['pageTitle']}</Text>
                    <View style={globalStyles.authPageInputs}>
                        <TextInput
                            autoCapitalize='none'
                            autoCorrect={false}
                            keyboardType={Platform.OS == "ios" ? "email-address" : "default"}
                            value={this.state.email}
                            style={globalStyles.authPageInput}
                            placeholder={i18n.t('screens')['login']['emailPlaceholder']}
                            onChangeText={(val) => { this.setState({ email: val, showError: false }) }} />
                        <View style={globalStyles.authPageInputContainer}>
                            {
                                this.state.password && this.state.password.length > 0
                                    ? <Text style={{
                                        ...globalStyles.authPageInputLabel,
                                        top: !this.state.password || this.state.password.length == 0 ? "auto" : -10,
                                        left: !this.state.password || this.state.password.length == 0 ? "auto" : 6,
                                    }}>{i18n.t('screens')['login']['passwordPlaceholder']}</Text>
                                    : null
                            }
                            <TextInput
                                style={{ ...globalStyles.authPageInputText, width: '90%' }}
                                value={this.state.password}
                                placeholder={!this.state.password || this.state.password.length == 0 ? i18n.t('screens')['login']['passwordPlaceholder'] : ""}
                                secureTextEntry={!this.state.showPassword}
                                onChangeText={(val) => { this.setState({ password: val, showError: false }) }} />
                            <Pressable style={({ pressed }) => [
                                {
                                    opacity: pressed ? 0.1 : 1,
                                    width: '10%',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'flex-end',
                                }
                            ]} onPress={() => {
                                this.setState({ showPassword: !this.state.showPassword })
                            }} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                                <Ionicons name={!this.state.showPassword ? "eye-sharp" : "eye-off-sharp"} size={24} color="#ccc" />
                            </Pressable>
                        </View>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.authPageError}>{this.state.error}</Text>
                            : null
                    }
                    <Pressable style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.1 : 1,
                            marginBottom: 32
                        }
                    ]} onPress={() => {
                        this.props.navigation.navigate("PasswordRecovery");
                    }}>
                        <Text style={globalStyles.authPageRedirectHighlightText}>{i18n.t('screens')['login']['forgottenPassword']}</Text>
                    </Pressable>
                    <Pressable style={({ pressed }) => [
                        globalStyles.authPageActionButton,
                        {
                            opacity: pressed ? 0.1 : 1,
                        }
                    ]} onPress={() => {
                        if (!this.state.isLoading) this.login();
                    }}>
                        {
                            !this.state.isLoading
                                ? <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['login']['submitButton']}</Text>
                                : <ActivityIndicator
                                    animating={true}
                                    color="#fff"
                                    size="small"
                                />
                        }
                    </Pressable>
                    <TouchableWithoutFeedback onPress={() => {
                        this.props.navigation.navigate("Signup")
                    }}>
                        <View style={globalStyles.authPageRedirectTextContainer}>
                            <Text style={globalStyles.authPageRedirectText}>{i18n.t('screens')['login']['dontHaveAccount']}&nbsp;</Text>
                            <Text style={globalStyles.authPageRedirectHighlightText}>{i18n.t('screens')['login']['goToSignup']}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        );
    }
}
