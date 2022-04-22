import React, { Component } from 'react'
import { BiArrowBack } from 'react-icons/bi';
import { ActivityIndicator, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { HTTP_STATUS_CODES } from '../../../global';
import ApiRequests from '../../classes/ApiRequests';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./CoachPage.styles');

export default class CoachPage extends Component {

    state = {
        showError: false,
        error: "",
        isLoading: false,
        coach: {}
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
                            this.props.route.params.coach
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
                                    <Text style={styles.location} onClick={() => {
                                        Linking.openURL(`https://google.com/maps/@${this.props.route.params.coach.location.lat},${this.props.route.params.coach.location.lng},11z`)
                                    }}>{this.props.route.params.coach.location.address}</Text>
                                </View>
                                {
                                    this.props.route.params.coach.prefersOfflineCoaching && <Text style={globalStyles.important}>This coach prefers to work with clients in person (offline).</Text>
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
                        }
                    </ScrollView>
                </View>
            </View>
        )
    }
}
