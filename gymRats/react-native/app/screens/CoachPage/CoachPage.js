import React, { Component } from 'react'
import { BiArrowBack } from 'react-icons/bi';
import { Image, Linking, ScrollView, Text, View } from 'react-native';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./CoachPage.styles');

export default class CoachPage extends Component {

    state = {
        showError: false,
        error: "",
        coach: {}
    }

    componentDidMount() {
        console.log(this.props)
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <BiArrowBack size={25} onClick={() => {
                            this.props.navigation.navigate("CoachSearch")
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Coach</Text>
                    </View>
                    {
                        this.state.showError && <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                    }
                    <ScrollView contentContainerStyle={{
                        flexGrow: 1,
                        flexShrink: 1
                    }}>
                        {
                            !this.state.coach
                            && <>
                                <View style={styles.profileTop}>
                                    {
                                        !this.props.route.params.coach.user.profilePicture
                                            ? <View style={styles.profilePictureContainer}>
                                                <Text style={styles.noProfilePictureText}>
                                                    {this.props.route.params.coach.user.firstName.charAt(0)}
                                                    {this.props.route.params.coach.user.lastName.charAt(0)}
                                                </Text>
                                            </View>
                                            : <Image style={styles.profilePictureContainer}
                                                source={{ uri: this.state.coach.user.profilePicture }} />
                                    }
                                    <Text style={styles.names}>
                                        {this.props.route.params.coach.user.firstName}
                                        &nbsp;
                                        {this.props.route.params.coach.user.lastName}
                                    </Text>
                                    <View style={styles.coachStats}>
                                        <View style={styles.statContainer}>
                                            <Text style={styles.statValue}>{this.props.route.params.coach.stats.clients}</Text>
                                            <Text style={styles.statTitle}>clients</Text>
                                        </View>
                                        <View style={styles.statContainer}>
                                            <Text style={styles.statValue}>{this.props.route.params.coach.rating}</Text>
                                            <Text style={styles.statTitle}>rating</Text>
                                        </View>
                                        <View style={styles.statContainer}>
                                            <Text style={styles.statValue}>{this.props.route.params.coach.experience}</Text>
                                            <Text style={styles.statTitle}>experience</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.location} onClick={() => {
                                        Linking.openURL(`https://google.com/maps/@${this.props.route.params.coach.location.lat},${this.props.route.params.coach.location.lng},11z`)
                                    }}>{this.state.coach.location.address}</Text>
                                </View>
                                {
                                    this.props.route.params.coach.prefersOfflineCoaching && <Text style={globalStyles.important}>This coach prefers to work with clients in person (offline).</Text>
                                }
                            </>
                        }
                    </ScrollView>
                </View>
            </View>
        )
    }
}
