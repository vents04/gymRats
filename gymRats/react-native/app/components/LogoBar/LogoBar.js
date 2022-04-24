import React from 'react';
import { Image, Text, View } from 'react-native';

import styles from './LogoBar.styles';

import logo from '../../../assets/img/icon.png'

export default function LogoBar() {
    return (
        <View style={styles.pageLogoContainer}>
            <Image style={styles.pageLogo} source={logo} />
            <Text style={styles.pageLogoText}>Gym Rats</Text>
        </View>
    )
}
