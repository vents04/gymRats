import React, { Component } from 'react';
import { Text, View, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { HTTP_STATUS_CODES } from '../../../global';
import ApiRequests from '../../classes/ApiRequests';
import Auth from '../../classes/Auth';
import i18n from 'i18n-js';

const globalStyles = require('../../../assets/styles/global.styles');

export default class Signup extends Component {

    state = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        showError: false,
        error: "",
        isLoading: false
    }

    signup = () => {
        this.setState({ showError: false, error: null, isLoading: true });
        ApiRequests.post("user/signup", {}, {
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            email: this.state.email.trim(),
            password: this.state.password
        }, false).then(async (response) => {
            await Auth.setToken(response.data.token);
            this.props.navigation.replace('NavigationRoutes');
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
        }).finally(() => {
            this.setState({ isLoading: false })
        })
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.pageLogoContainer}>
                        <Image style={globalStyles.pageLogo} source={require('../../../assets/img/icon.png')} />
                        <Text style={globalStyles.pageLogoText}>Gym Rats</Text>
                    </View>
                    <Text style={globalStyles.authPageTitle}>{i18n.t('signup')['pageTitle']}</Text>
                    <View style={globalStyles.authPageInputs}>
                        <TextInput
                            value={this.state.firstName}
                            style={globalStyles.authPageInput}
                            placeholder={i18n.t('signup')['firstNamePlaceholder']}
                            onChangeText={(val) => { this.setState({ firstName: val, showError: false }) }} />
                        <TextInput
                            value={this.state.lastName}
                            style={globalStyles.authPageInput}
                            placeholder={i18n.t('signup')['lastNamePlaceholder']}
                            onChangeText={(val) => { this.setState({ lastName: val, showError: false }) }} />
                        <TextInput
                            value={this.state.email}
                            style={globalStyles.authPageInput}
                            placeholder={i18n.t('signup')['emailPlaceholder']}
                            onChangeText={(val) => { this.setState({ email: val }); this.setState({ showError: false }) }} />
                        <TextInput
                            value={this.state.password}
                            style={globalStyles.authPageInput}
                            placeholder={i18n.t('signup')['passwordPlaceholder']}
                            secureTextEntry={true}
                            onChangeText={(val) => { this.setState({ password: val }); this.setState({ showError: false }) }} />
                    </View>
                    {
                        this.state.showError && <Text style={globalStyles.authPageError}>{this.state.error}</Text>
                    }
                    <TouchableOpacity style={globalStyles.authPageActionButton} onPress={() => {
                        if (!this.state.isLoading) this.signup();
                    }}>
                        {
                            !this.state.isLoading
                                ? <Text style={globalStyles.authPageActionButtonText}>{i18n.t('signup')['submitButton']}</Text>
                                : <ActivityIndicator
                                    animating={true}
                                    color="#fff"
                                    size="small"
                                />
                        }
                    </TouchableOpacity>
                    <View style={globalStyles.authPageRedirectTextContainer} onClick={() => {
                        this.props.navigation.navigate("Login")
                    }}>
                        <Text style={globalStyles.authPageRedirectText}>{i18n.t('signup')['haveAccount']}</Text>
                        &nbsp;
                        <Text style={globalStyles.authPageRedirectHighlightText}>{i18n.t('signup')['goToLogin']}</Text>
                    </View>
                </View>
            </View>
        );
    }
}
