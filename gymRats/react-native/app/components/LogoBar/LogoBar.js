import React from 'react';
import { Image, Text, View } from 'react-native';

import styles from './LogoBar.styles';

export default function LogoBar() {
    return (
        <View style={styles.pageLogoContainer}>
            <Image style={styles.pageLogo} source={require('../../../assets/img/icon.png')} />
            <Text style={styles.pageLogoText}>Gym Rats</Text>
        </View>
    )
}
