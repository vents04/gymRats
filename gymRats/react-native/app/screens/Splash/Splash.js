import React, { Component } from 'react';
import { ActivityIndicator, Image, View, Text, Alert } from 'react-native';
import * as Device from 'expo-device';
import { default as AsyncStorage } from '@react-native-async-storage/async-storage';
import i18n from 'i18n-js'
import * as Network from 'expo-network';

import Auth from '../../classes/Auth';
import User from '../../classes/User';

import socketClass from '../../classes/Socket';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Splash.styles';

import logo from '../../../assets/img/icon.png'
import ApiRequests from '../../classes/ApiRequests';

export default class Splash extends Component {

    submitDeviceInfo = async () => {
        const deviceTypes = ["UNKNOWN", "PHONE", "TABLET", "DESKTOP", "TV"]

        const deviceType = await Device.getDeviceTypeAsync();
        const device = {
            deviceType: deviceTypes[deviceType] || null,
            osName: Device.osName,
            brand: Device.brand,
            manufacturer: Device.manufacturer,
            modelName: Device.modelName,
            modelId: Device.modelId,
            designName: Device.designName,
            productName: Device.productName,
            deviceYearClass: parseInt(Device.deviceYearClass),
            totalMemory: parseInt(Device.totalMemory),
            osBuildId: Device.osBuildId,
            osInternalBuildId: Device.osInternalBuildId,
            osBuildFingerprint: Device.osBuildFingerprint,
            platformApiLevel: Device.platformApiLevel,
            deviceName: Device.deviceName,
        }

        const deviceId = await AsyncStorage.getItem('@gymRats:deviceId');
        if (deviceId) device.deviceId = deviceId;

        ApiRequests.post("analytics/device", {}, device, true).then(async (response) => {
            AsyncStorage.setItem('@gymRats:deviceId', response.data.deviceId);
            // set expo token
            const expoPushToken = await AsyncStorage.getItem('@gymRats:expoPushToken');
            if (expoPushToken) {
                ApiRequests.put("analytics/expo-push-token/" + expoPushToken, {}, {}, true)
            }
        }).catch((error) => {
            ApiRequests.alert(i18n.t("errors")['error'], i18n.t("errors")['deviceInfoSubmissionError']);
        })
    }

    componentDidMount() {
        setTimeout(async () => {
            const token = await Auth.getToken();
            const networkState = await Network.getNetworkStateAsync();
            if ((!networkState.isConnected || !networkState.isInternetReachable) && token) {
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'NavigationRoutes' }],
                });
                return;
            }
            let validationEndpointResponse = null;
            let isAuthenticated = false;
            let hasUnverifiedEmail = false;
            let user = {};
            try {
                if (token) {
                    validationEndpointResponse = await User.validateToken(token);
                    isAuthenticated = validationEndpointResponse.valid;
                    hasUnverifiedEmail = !validationEndpointResponse.user.verifiedEmail;
                }
            } catch (err) {
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                });
            }
            if (isAuthenticated) {
                user = validationEndpointResponse.user;
                if (!hasUnverifiedEmail) {
                    let chatsRoomSocket = socketClass.getChatsRoomSocket();
                    if (!chatsRoomSocket) {
                        chatsRoomSocket = socketClass.initConnection();
                        socketClass.setChatsRoomSocket(chatsRoomSocket);
                    }
                    socketClass.joinChatsRoom();
                    this.submitDeviceInfo();
                }
            }
            if (!hasUnverifiedEmail) {
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: isAuthenticated ? 'NavigationRoutes' : 'Auth' }],
                });
            } else {
                this.props.navigation.replace("Auth", { hasUnverifiedEmail, email: validationEndpointResponse.user.email });
            }
            await AsyncStorage.setItem("@gymrats:user", JSON.stringify(user));
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
