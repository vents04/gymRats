import React, { Component } from 'react'
import { View } from 'react-native';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Chat.styles');

export default class Chat extends Component {
    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                </View>
            </View>
        )
    }
}
