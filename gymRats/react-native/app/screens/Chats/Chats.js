import React, { Component } from 'react'
import { Image, ScrollView, Text, View } from 'react-native';
import ChatsItem from '../../components/ChatsItem/ChatsItem';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Chats.styles');

export default class Chats extends Component {
    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.pageLogoContainer}>
                        <Image style={globalStyles.pageLogo} source={require('../../../assets/img/icon.png')} />
                        <Text style={globalStyles.pageLogoText}>Gym Rats</Text>
                    </View>
                    <ScrollView style={{
                        marginTop: 16
                    }}
                        contentContainerStyle={{
                            flexGrow: 1,
                            flexShrink: 1,
                        }}>
                        <ChatsItem />
                    </ScrollView>
                </View>
            </View>
        )
    }
}
