import React, { useState, useEffect } from 'react';
import { Text, View, Button, Pressable, ActivityIndicator, Alert, TextInput, BackHandler, KeyboardAvoidingView, Keyboard } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import i18n from 'i18n-js';

import ApiRequests from '../../classes/ApiRequests';
import { BackButtonHandler } from '../../classes/BackButtonHandler';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './BarcodeReader.styles';
import { CALORIES_COUNTER_SCREEN_INTENTS, HTTP_STATUS_CODES } from '../../../global';
import { Ionicons } from '@expo/vector-icons';

export default function BarcodeScanner(props) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [barcode, setBarcode] = useState("");
    const [shouldHideBarcodeBox, setShouldHideBarcodeBox] = useState(false);

    const askForCameraPermission = () => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })()
    }

    const backAction = () => {
        props.navigation.goBack();
        return true;
    }

    useEffect(() => {
        askForCameraPermission();
        BackHandler.addEventListener("hardwareBackPress", backAction);
        Keyboard.addListener("keyboardDidShow", () => {
            setShouldHideBarcodeBox(true);
        })
        Keyboard.addListener("keyboardDidHide", () => {
            setShouldHideBarcodeBox(false);
        })
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", backAction);
        }
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        setBarcode(data)
        ApiRequests.get('calories-counter/search/barcode?barcode=' + data).then(response => {
            if (response.data.result) {
                if (props.route.params.isAddingBarcodeToFood) {
                    Alert.alert(i18n.t('screens')['barcodeReader']['barcodeAlreadyExistsErrorTitle'], i18n.t('screens')['barcodeReader']['barcodeAlreadyExistsErrorMessage']);
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
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
                    ApiRequests.alert(i18n.t('errors')['error'], error.response.data, [{ text: 'OK' }]);
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
                <Text style={styles.text}>{i18n.t('screens')['barcodeReader']['requestingCameraPermission']}</Text>
            </View >
        )
    }
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>{i18n.t('screens')['barcodeReader']['noCameraAccess']}</Text>
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
                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['barcodeReader']['allowCamera']}</Text>
                </Pressable>
            </View>)
    }

    return (
        <KeyboardAvoidingView style={globalStyles.safeAreaView}>
            <View style={globalStyles.pageContainer}>
                <View style={globalStyles.followUpScreenTopbar}>
                    <Pressable style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.1 : 1,
                        }
                    ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                        backAction();
                    }}>
                        <Ionicons name="md-arrow-back-sharp" size={25} />
                    </Pressable>
                    <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['barcodeReader']['scanBarcode']}</Text>
                </View>
                <View style={styles.container}>
                    {
                        !shouldHideBarcodeBox
                            ? <View style={styles.barcodebox}>
                                <BarCodeScanner
                                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                                    style={{ height: 400, width: 400 }} />
                            </View>
                            : null
                    }
                    {
                        scanned
                            ? <>
                                <Text style={{ ...globalStyles.modalText, marginVertical: 24 }}>{i18n.t('screens')['barcodeReader']['barcodeNotFound']}</Text>
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
                                    <Text style={globalStyles.actionText}>{i18n.t('screens')['barcodeReader']['scanBarcode']}</Text>
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
                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['barcodeReader']['addFood']}</Text>
                                </Pressable>
                            </>
                            : <>
                                <TextInput
                                    style={[globalStyles.authPageInput, { width: "80%", marginTop: 32 }]}
                                    placeholder={i18n.t('screens')['barcodeReader']['enterBarcode']}
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
                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['barcodeReader']['submitBarcode']}</Text>
                                </Pressable>
                            </>
                    }
                </View >
            </View>
        </KeyboardAvoidingView>
    );
}