import React, { Component } from 'react';
import { ActivityIndicator, Image, View, Text } from 'react-native';
import Auth from '../../classes/Auth';
import User from '../../classes/User';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Splash.styles');

export default class Splash extends Component {

    componentDidMount() {
        setTimeout(async () => {
            const token = await Auth.getToken();
            if (!token) return this.props.navigation.replace('Auth');
            try {
                const isTokenValid = await User.validateToken(token);
                this.props.navigation.replace(
                    !isTokenValid ? 'Auth' : 'NavigationRoutes'
                )
            } catch (err) {
                this.props.navigation.replace('Auth');
            }
        }, 0);
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
