import React, { Component } from 'react';
import { ActivityIndicator, Image, View, Text, Alert } from 'react-native';

import Auth from '../../classes/Auth';
import User from '../../classes/User';

import socketClass from '../../classes/Socket';
const socket = socketClass.initConnection();

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Splash.styles';

import logo from '../../../assets/img/icon.png'

export default class Splash extends Component {
    componentDidMount() {
        setTimeout(async () => {
            let isAuthenticated = false;
            try {
                const token = await Auth.getToken();
                if (token) isAuthenticated = (await User.validateToken(token)).valid;
            } catch (err) {
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                });
            }
            if(isAuthenticated) socketClass.joinChatsRoom(socket);
            this.props.navigation.reset({
                index: 0,
                routes: [{ name: isAuthenticated ? 'NavigationRoutes' : 'Auth' }],
            });
        }, 1000);
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={styles.centeredContent}>
                    <View style={styles.logoContainer}>
                        <Image style={styles.logo} source={logo} />
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
