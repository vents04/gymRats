import React, { Component } from 'react';
import { ActivityIndicator, Image, View, Text, Alert } from 'react-native';
import * as Device from 'expo-device';
import { default as AsyncStorage } from '@react-native-async-storage/async-storage';

import Auth from '../../classes/Auth';
import User from '../../classes/User';

import socketClass from '../../classes/Socket';
const socket = socketClass.initConnection();

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
                ApiRequests.put("analytics/expo-push-token/" + expoPushToken, {}, {}, true).then(async (response) => {
                    console.log("expo push token set");
                })
            }
        }).catch((error) => {
            console.log(error.response.data);
            ApiRequests.alert("Error", "An error occurred while submitting device info for notifications");
        })
    }

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
            if (isAuthenticated) {
                socketClass.joinChatsRoom(socket);
                this.submitDeviceInfo();
            }
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
