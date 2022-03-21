import React, { Component } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { BiArrowBack } from 'react-icons/bi';
import CoachRequestsItem from '../../components/CoachRequestsItem/CoachRequestsItem';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./CoachRequests.styles');

export default class CoachRequests extends Component {
  render() {
    return (
        <View style={globalStyles.safeAreaView}>
            <View style={globalStyles.pageContainer}>
                <View style={globalStyles.followUpScreenTopbar}>
                    <BiArrowBack size={25} onClick={() => {
                        this.props.navigation.navigate("Coaching")
                    }} />
                    <Text style={globalStyles.followUpScreenTitle}>Unanswered requests</Text>
                </View>
                <Text style={[globalStyles.notation, {marginTop: 24}]}>Users that have requested to be coached by you:</Text>
                <ScrollView contentContainerStyle={{
                    
                }} style={{marginTop: 14}}>
                    <CoachRequestsItem />
                </ScrollView>
            </View>
        </View>
    )
  }
}
