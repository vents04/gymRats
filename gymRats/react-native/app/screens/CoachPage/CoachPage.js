import React, { Component } from 'react'
import { ActivityIndicator, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './CoachPage.styles';

export default class CoachPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showError: false,
            error: "",
            isLoading: false,
            coach: {}
        }
    }

    sendRequest = () => {
        this.setState({ showError: false, error: "", isLoading: true });
        ApiRequests.post("coaching/relation", {}, {
            coachId: this.props.route.params.coach._id
        }, true).then((response) => {
            this.setState({ isLoading: false });
            this.props.navigation.navigate("Coaching", { tab: "myCoach" })
        }).catch((error) => {
            this.setState({ isLoading: false });
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showError: true, error: error.response.data });
                } else {
                    ApiRequests.showInternalServerError();
                }
            } else if (error.request) {
                ApiRequests.showNoResponseError();
            } else {
                ApiRequests.showRequestSettingError();
            }
        })
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("CoachSearch")
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </TouchableOpacity>
                        <Text style={globalStyles.followUpScreenTitle}>Coach</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                        {
                            this.props.route.params.coach
                                ? <>
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
                                                    source={{ uri: this.props.route.params.coach.user.profilePicture }} />
                                        }
                                        <Text style={styles.names}>
                                            {this.props.route.params.coach.user.firstName}
                                            &nbsp;
                                            {this.props.route.params.coach.user.lastName}
                                        </Text>
                                        <View style={styles.coachStats}>
                                            <View style={styles.statContainer}>
                                                <Text style={styles.statValue}>{this.props.route.params.coach.clients}</Text>
                                                <Text style={styles.statTitle}>clients</Text>
                                            </View>
                                            <View style={styles.statContainer}>
                                                <Text style={styles.statValue}>{this.props.route.params.coach.rating}</Text>
                                                <Text style={styles.statTitle}>rating</Text>
                                            </View>
                                            <View style={styles.statContainer}>
                                                <Text style={styles.statValue}>{this.props.route.params.coach.experience ?? "-"}</Text>
                                                <Text style={styles.statTitle}>experience</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => {
                                            Linking.openURL(`https://google.com/maps/@${this.props.route.params.coach.location.lat},${this.props.route.params.coach.location.lng},11z`)
                                        }}>
                                            <Text style={styles.location}>{this.props.route.params.coach.location.address}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {
                                        this.props.route.params.coach.prefersOfflineCoaching
                                            ? <Text style={globalStyles.important}>This coach prefers to work with clients in person (offline).</Text>
                                            : null
                                    }
                                    <TouchableOpacity style={globalStyles.authPageActionButton} onPress={() => {
                                        if (!this.state.isLoading) this.sendRequest();
                                    }}>
                                        {
                                            !this.state.isLoading
                                                ? <Text style={globalStyles.authPageActionButtonText}>Request to be coached</Text>
                                                : <ActivityIndicator
                                                    animating={true}
                                                    color="#fff"
                                                    size="small"
                                                />
                                        }
                                    </TouchableOpacity>
                                </>
                                : null
                        }
                    </ScrollView>
                </View>
            </View>
        )
    }
}
