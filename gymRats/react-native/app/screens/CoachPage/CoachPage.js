import React, { Component } from 'react'
import { BiArrowBack } from 'react-icons/bi';
import { Image, Linking, ScrollView, Text, View } from 'react-native';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./CoachPage.styles');

export default class CoachPage extends Component {

    state = {
        showError: false,
        error: "",
        profile: {
            profilePicture: null,
            firstName: "Ventsislav",
            lastName: "Dimitrov",
            stats: {
                clients: 19,
                rating: 3.89,
                experience: "1y 6m"
            },
            trainsOnlyOffline: true,
            location: {
                address: "Sofia, Bulgaria",
                lat: 42.6953468,
                lng: 23.1838624
            }
        }
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <ScrollView style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <BiArrowBack size={25} onClick={() => {
                            this.props.navigation.navigate("CoachSearch")
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Coach</Text>
                    </View>
                    {
                        this.state.showError && <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                    }
                    <View style={styles.profileTop}>
                        {
                            !this.state.profile.profilePicture
                                ? <View style={styles.profilePictureContainer}>
                                    <Text style={styles.noProfilePictureText}>
                                        {this.state.profile.firstName.charAt(0)}
                                        {this.state.profile.lastName.charAt(0)}
                                    </Text>
                                </View>
                                : <Image style={styles.profilePictureContainer}
                                    source={{ uri: this.state.profile.profilePicture }} />
                        }
                        <Text style={styles.names}>
                            {this.state.profile.firstName}
                            &nbsp;
                            {this.state.profile.lastName}
                        </Text>
                        <View style={styles.coachStats}>
                            <View style={styles.statContainer}>
                                <Text style={styles.statValue}>{this.state.profile.stats.clients}</Text>
                                <Text style={styles.statTitle}>clients</Text>
                            </View>
                            <View style={styles.statContainer}>
                                <Text style={styles.statValue}>{this.state.profile.stats.rating}</Text>
                                <Text style={styles.statTitle}>rating</Text>
                            </View>
                            <View style={styles.statContainer}>
                                <Text style={styles.statValue}>{this.state.profile.stats.experience}</Text>
                                <Text style={styles.statTitle}>experience</Text>
                            </View>
                        </View>
                        <Text style={styles.location} onClick={() => {
                            Linking.openURL(`https://google.com/maps/@${this.state.profile.location.lat},${this.state.profile.location.lng},11z`)
                        }}>{this.state.profile.location.address}</Text>
                    </View>
                    {
                        this.state.profile.trainsOnlyOffline && <Text style={globalStyles.important}>This coach will train with clients only in person (offline).</Text>
                    }
                </ScrollView>
            </View>
        )
    }
}
