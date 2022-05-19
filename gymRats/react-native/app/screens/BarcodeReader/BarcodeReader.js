import React, { useState, useEffect } from 'react';
import { Text, View, Button, Pressable, ActivityIndicator, Alert, TextInput } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

import ApiRequests from '../../classes/ApiRequests';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './BarcodeReader.styles';
import { CALORIES_COUNTER_SCREEN_INTENTS, HTTP_STATUS_CODES } from '../../../global';

export default function BarcodeScanner(props) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [barcode, setBarcode] = useState("");

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
        setBarcode(data)
        ApiRequests.get('calories-counter/search/barcode?barcode=' + data).then(response => {
            if (response.data.result) {
                if (props.route.params.isAddingBarcodeToFood) {
                    Alert.alert("Barcode already exists", "This barcode is already associated with a food item. Please scan a different barcode.");
                    setScanned(false);
                } else {
                    props.navigation.replace("AddCaloriesIntakeItem", {
                        intent: CALORIES_COUNTER_SCREEN_INTENTS.ADD,
                        item: response.data.result,
                        meal: props.route.params.meal,
                        date: props.route.params.date,
                        timezoneOffset: props.route.params.timezoneOffset
                    })
                }
            }
        }).catch((error) => {
            setScanned(false)
            setBarcode("")
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
                <Pressable style={({ pressed }) => [
                    globalStyles.authPageActionButton,
                    {
                        opacity: pressed ? 0.1 : 1,
                        maxWidth: 200,
                        marginTop: 16,
                        marginHorizontal: 16
                    }
                ]} onPress={() => {
                    askForCameraPermission()
                }}>
                    <Text style={globalStyles.authPageActionButtonText}>Allow camera</Text>
                </Pressable>
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
                    ? <>
                        <Text style={{ ...globalStyles.modalText, marginVertical: 24 }}>Barcode not found</Text>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                                marginHorizontal: 16,
                                padding: 8
                            }
                        ]} onPress={() => {
                            setBarcode("")
                            setScanned(false)
                        }}>
                            <Text style={globalStyles.actionText}>Scan / enter again</Text>
                        </Pressable>
                        <Pressable style={({ pressed }) => [
                            globalStyles.authPageActionButton,
                            {
                                opacity: pressed ? 0.1 : 1,
                                maxWidth: "80%",
                                marginTop: 64,
                                marginHorizontal: 16
                            },
                        ]} onPress={() => {
                            setScanned(false);
                            props.navigation.replace("AddFood", { barcode, date: props.route.params.date, timezoneOffset: props.route.params.timezoneOffset, meal: props.route.params.meal });
                        }}>
                            <Text style={globalStyles.authPageActionButtonText}>Let's add this food to Gym Rats</Text>
                        </Pressable>
                    </>
                    : <>
                        <TextInput
                            style={[globalStyles.authPageInput, { width: "80%", marginTop: 64 }]}
                            placeholder="Enter barcode:"
                            value={barcode}
                            onChangeText={(val) => { setBarcode(val) }} />
                        <Pressable style={({ pressed }) => [
                            globalStyles.authPageActionButton,
                            {
                                opacity: pressed ? 0.1 : 1,
                                width: "80%",
                                marginTop: 16
                            },
                        ]} onPress={() => {
                            handleBarCodeScanned({ type: "", data: barcode });
                        }}>
                            <Text style={globalStyles.authPageActionButtonText}>Submit barcode</Text>
                        </Pressable>
                    </>
            }
        </View >
    );
}