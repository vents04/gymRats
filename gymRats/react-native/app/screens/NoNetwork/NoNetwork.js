import React, { Component } from 'react'
import { Text, Pressable, View, ScrollView, TextInput, Image, BackHandler, ActivityIndicator } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles'
import styles from './NoNetwork.styles';
import LogoBar from '../../components/LogoBar/LogoBar';

export default class NoNetwork extends Component {
  render() {
    return (
      <View style={globalStyles.safeAreaView}>
        <View style={[globalStyles.pageContainer, {paddingTop: 32}]}>
            <LogoBar />
            <View style={styles.noInternetContainer}>
                <Ionicons name="ios-alert-circle" size={50} color="#1f6cb0" />
                <Text style={styles.noInternetText}>{i18n.t('screens')['noNetwork']['text']}</Text>
            </View>
        </View>
      </View>
    )
  }
}
