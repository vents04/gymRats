import React, { Component } from 'react';
import { Text, View, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AUTHENTICATION_TOKEN_KEY, HTTP_STATUS_CODES } from '../../../global';
import ApiRequests from '../../classes/ApiRequests';
import Auth from '../../classes/Auth';

const globalStyles = require('../../../assets/styles/global.styles');

export default class Login extends Component {

    state = {
        email: "",
        password: "",
        showError: false,
        error: "",
        isLoading: false,
    }

    login = () => {
        this.setState({ showError: false, error: null, isLoading: true });
        ApiRequests.post("user/login", {}, {
            email: this.state.email,
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
                        <Image style={globalStyles.pageLogo} source={require('../../../assets/img/logo.png')} />
                        <Text style={globalStyles.pageLogoText}>Gym Rats</Text>
                    </View>
                    <Text style={globalStyles.authPageTitle}>Login</Text>
                    <View style={globalStyles.authPageInputs}>
                        <TextInput
                            value={this.state.email}
                            style={globalStyles.authPageInput}
                            placeholder="Email:"
                            onChangeText={(val) => { this.setState({ email: val, showError: false }) }} />
                        <TextInput
                            value={this.state.password}
                            style={globalStyles.authPageInput}
                            placeholder="Password:"
                            secureTextEntry={true}
                            onChangeText={(val) => { this.setState({ password: val, showError: false }) }} />
                    </View>
                    {
                        this.state.showError && <Text style={globalStyles.authPageError}>{this.state.error}</Text>
                    }
                    <TouchableOpacity style={globalStyles.authPageActionButton} onPress={() => {
                        if (!this.state.isLoading) this.login();
                    }}>
                        {
                            !this.state.isLoading
                                ? <Text style={globalStyles.authPageActionButtonText}>Continue</Text>
                                : <ActivityIndicator
                                    animating={true}
                                    color="#fff"
                                    size="small"
                                />
                        }
                    </TouchableOpacity>
                    <View style={globalStyles.authPageRedirectTextContainer} onClick={() => {
                        this.props.navigation.navigate("Signup")
                    }}>
                        <Text style={globalStyles.authPageRedirectText}>Don't have an account?</Text>
                        &nbsp;
                        <Text style={globalStyles.authPageRedirectHighlightText}>Go to Signup</Text>
                    </View>
                </View>
            </View>
        );
    }
}
