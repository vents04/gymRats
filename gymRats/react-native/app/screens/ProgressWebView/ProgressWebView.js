import { Ionicons } from '@expo/vector-icons';
import React from 'react'
import { BackHandler, Pressable, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './ProgressWebView.styles.js';

export default function ProgressWebView(props) {

    const backAction = () => {
        props.navigation.goBack();
    }

    React.useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", backAction);

        return () =>
            BackHandler.removeEventListener("hardwareBackPress", backAction);
    }, []);

    return (
        <View style={globalStyles.safeAreaView}>
            <View style={[globalStyles.followUpScreenTopbar, {
                padding: 32
            }]}>
                <Pressable style={({ pressed }) => [
                    {
                        opacity: pressed ? 0.1 : 1,
                    }
                ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                    backAction();
                }}>
                    <Ionicons name="md-arrow-back-sharp" size={25} />
                </Pressable>
                <Text style={globalStyles.followUpScreenTitle}>Progress</Text>
            </View>
            <WebView
                source={{ uri: 'https://expo.dev' }}
            />
        </View>
    )
}
