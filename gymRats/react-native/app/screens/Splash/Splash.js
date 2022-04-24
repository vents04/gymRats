import React, { Component } from 'react';
import { ActivityIndicator, Image, View, Text, Alert } from 'react-native';

import Auth from '../../classes/Auth';
import User from '../../classes/User';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Splash.styles';

export default class Splash extends Component {
    componentDidMount() {
        let isAuthenticated = false;
        (async () => {
            try {
                const token = await Auth.getToken();
                if (token) isAuthenticated = await User.validateToken(token);
            } catch (err) {
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
