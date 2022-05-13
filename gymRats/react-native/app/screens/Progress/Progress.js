import React, { Component } from 'react'
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Progress.styles';
import LogoBar from '../../components/LogoBar/LogoBar';

export default class Progress extends Component {
    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <LogoBar />
                </View>
            </View>
        )
    }
}
