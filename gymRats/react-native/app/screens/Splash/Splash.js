import React, { Component } from 'react';
import { ActivityIndicator, Image, View, Text, Alert } from 'react-native';
import Auth from '../../classes/Auth';
import User from '../../classes/User';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Splash.styles');

export default class Splash extends Component {

    componentDidMount() {
        let isAuthenticated = false;
        (async () => {
            try {
                Alert.alert("Verifying user...");
                const token = await Auth.getToken();
                Alert.alert("tokena", token);
                if (token) {
                    Alert.alert("TULAAA");
                    isAuthenticated = await User.validateToken(token);
                    Alert.alert("proverih validnost", isTokenValid);
                }
            } catch (err) {
                Alert.alert("greshka");
                this.props.navigation.navigate('Auth');
            }
            this.props.navigation.navigate(isAuthenticated ? 'NavigationRoutes' : 'Auth');
        })();
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={styles.centeredContent}>
                    <View style={styles.logoContainer}>
                        <Image style={styles.logo} source={require('../../../assets/img/icon.png')} />
                        <Text style={styles.logoText}>Gym Rats</Text>
                    </View>
                    <ActivityIndicator
                        animating={true}
                        color="#777"
                        size="small"
                        style={styles.activityIndicator}
                    />
                </View>
            </View>
        );
    }
}
