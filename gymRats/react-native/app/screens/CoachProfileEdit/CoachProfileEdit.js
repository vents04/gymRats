import React, { Component } from 'react'
import { Image, Linking, ScrollView, Switch, Text, View } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import { BiArrowBack } from 'react-icons/bi';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './CoachProfileEdit.styles';

export default class CoachPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showError: false,
            error: "",
            isLoading: false,
            coach: null
        }
    }

    componentDidMount() {
        this.getCoach();
    }

    getCoach = () => {
        ApiRequests.get('coaching/me-as-coach', {}, true).then((response) => {
            this.setState({ coach: response.data.coach })
        }).catch((error) => {
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
                            this.props.navigation.navigate("Coaching", { tab: "myClients" })
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Coach profile edit</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                        {
                            this.state.coach
                                ? <>
                                    <View style={styles.profileTop}>
                                        {
                                            !this.state.coach.user.profilePicture
                                                ? <View style={styles.profilePictureContainer}>
                                                    <Text style={styles.noProfilePictureText}>
                                                        {this.state.coach.user.firstName.charAt(0)}
                                                        {this.state.coach.user.lastName.charAt(0)}
                                                    </Text>
                                                </View>
                                                : <Image style={styles.profilePictureContainer}
                                                    source={{ uri: this.state.coach.user.profilePicture }} />
                                        }
                                        <Text style={styles.names}>
                                            {this.state.coach.user.firstName}
                                            &nbsp;
                                            {this.state.coach.user.lastName}
                                        </Text>
                                        <View style={styles.coachStats}>
                                            <View style={styles.statContainer}>
                                                <Text style={styles.statValue}>{this.state.coach.clients}</Text>
                                                <Text style={styles.statTitle}>clients</Text>
                                            </View>
                                            <View style={styles.statContainer}>
                                                <Text style={styles.statValue}>{this.state.coach.rating}</Text>
                                                <Text style={styles.statTitle}>rating</Text>
                                            </View>
                                            <View style={styles.statContainer}>
                                                <Text style={styles.statValue}>{this.state.coach.experience ?? "-"}</Text>
                                                <Text style={styles.statTitle}>experience</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.location} onClick={() => {
                                            Linking.openURL(`https://google.com/maps/@${this.state.coach.location.lat},${this.state.coach.location.lng},11z`)
                                        }}>{this.state.coach.location.address}</Text>
                                    </View>
                                    <Text style={[globalStyles.notation, {
                                        marginTop: 16
                                    }]}>Do you prefer to work with clients only in person?</Text>
                                    <Switch
                                        style={{
                                            marginTop: 10
                                        }}
                                        trackColor={{ false: '#767577', true: '#53c7f0' }}
                                        thumbColor={this.state.coach.prefersOfflineCoaching ? '#1f6cb0' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => {
                                            let coach = this.state.coach;
                                            coach.prefersOfflineCoaching = !coach.prefersOfflineCoaching;
                                            this.setState({ coach });
                                        }}
                                        value={this.state.coach.prefersOfflineCoaching}
                                    />
                                </>
                                : null
                        }
                    </ScrollView>
                </View>
            </View>
        )
    }
}
