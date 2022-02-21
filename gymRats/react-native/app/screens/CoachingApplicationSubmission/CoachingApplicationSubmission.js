import React, { Component } from 'react'
import { BiArrowBack } from 'react-icons/bi'
import { Dimensions, ScrollView, Text, View } from 'react-native'

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./CoachingApplicationSubmission.styles');

export default class CoachingApplicationSubmission extends Component {
    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <BiArrowBack size={25} onClick={() => {
                            this.props.navigation.navigate("Coaching")
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Application submission</Text>
                    </View>
                    <ScrollView style={{
                        height: `${Dimensions.get('window').height - 140}px`
                    }}>

                    </ScrollView>
                </View>
            </View>
        )
    }
}
