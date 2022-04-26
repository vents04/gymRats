import React, { useState, useEffect } from 'react';
import { Text, View, Button, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

import ApiRequests from '../../classes/ApiRequests';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './BarcodeReader.styles';
import { CALORIES_COUNTER_SCREEN_INTENTS, HTTP_STATUS_CODES } from '../../../global';

export default function BarcodeScanner(props) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    const askForCameraPermission = () => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })()
    }

    useEffect(() => {
        askForCameraPermission();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        console.log('Type: ' + type + '\nData: ' + data);
        ApiRequests.get('calories-counter/search/barcode?barcode=' + data).then(response => {
            props.navigation.pop();
            if (!response.data.result) {
                props.navigation.navigate("AddFood", { barcode: data, date: props.route.params.date, timezoneOffset: props.route.params.timezoneOffset, meal: props.route.params.meal });
            } else {
                props.navigation.navigate("AddCaloriesIntakeItem", {
                    intent: CALORIES_COUNTER_SCREEN_INTENTS.ADD,
                    item: response.data.result,
                    meal: props.route.params.meal,
                    date: props.route.params.date,
                    timezoneOffset: props.route.params.timezoneOffset
                })
            }
            console.log(response.data);
        }).catch((error) => {
            console.log("ERROR", error)
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    ApiRequests.alert("Error", error.response.data, [{ text: 'OK' }]);
                } else {
                    ApiRequests.showInternalServerError();
                }
            } else if (error.request) {
                ApiRequests.showNoResponseError();
            } else {
                ApiRequests.showRequestSettingError();
            }
        })
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    animating={true}
                    color="#fff"
                    size="large"
                    style={{ marginBottom: 32 }} />
                <Text style={styles.text}>Requesting for camera permission</Text>
            </View >
        )
    }
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No access to camera</Text>
                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                    maxWidth: 200,
                    marginTop: 16,
                    marginHorizontal: 16
                }]} onPress={() => {
                    askForCameraPermission()
                }}>
                    <Text style={globalStyles.authPageActionButtonText}>Allow camera</Text>
                </TouchableOpacity>
            </View>)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Scan barcode</Text>
            <View style={styles.barcodebox}>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={{ height: 400, width: 400 }} />
            </View>
            {
                scanned
                    ? <TouchableOpacity style={[globalStyles.authPageActionButton, {
                        maxWidth: 200,
                        marginTop: 16,
                        marginHorizontal: 16
                    }]} onPress={() => {
                        setScanned(false)
                    }}>
                        <Text style={globalStyles.authPageActionButtonText}>I want to scan again</Text>
                    </TouchableOpacity>
                    : null
            }
        </View>
    );
}