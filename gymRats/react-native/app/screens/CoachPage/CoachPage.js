import React, { Component } from 'react'
import { ActivityIndicator, Image, Linking, ScrollView, Text, Pressable, View, BackHandler } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './CoachPage.styles';
import { Share } from 'react-native';

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

    backAction = () => {
        this.props.navigation.navigate("CoachSearch")
        return true;
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    sendRequest = () => {
        this.setState({ showError: false, error: "", isLoading: true }, () => {
            ApiRequests.post("coaching/relation", {}, {
                coachId: this.props.route.params.coach._id
            }, true).then((response) => {
                this.props.navigation.navigate("Coaching", { tab: "myCoach" })
            }).catch((error) => {
                if (error.response) {
                    if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
                        this.setState({ showError: true, error: error.response.data });
                    } else {
                        ApiRequests.showInternalServerError();
                    }
                } else if (error.request) {
                    ApiRequests.showNoResponseError();
                } else {
                    ApiRequests.showRequestSettingError();
                }
            }).finally(() => {
                this.setState({ isLoading: false });
            })
        });
    }

    shareProfileLink = async () => {
        try {
            const url = `gymrats://coach-profile/${this.props.route.params.coach._id}`
            await Share.share({
                message: `Be coached by ${this.props.route.params.coach.firstName}!\n${url}`,
            });
        } catch (error) {
            alert(error.message);
        }
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.backAction();
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </Pressable>
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['coachPage']['pageTitle']}</Text>
                    </View>
                    <View style={globalStyles.topbarIconContainer}>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 15, bottom: 30, left: 15 }} onPress={() => {
                            this.shareProfileLink();
                        }}>
                            <FontAwesome name="share-square-o" size={25} color="#1f6cb0" style={{ marginRight: 12 }} />
                        </Pressable>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <View style={{
                        flex: 1
                    }}>
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
                                                <Text style={styles.statTitle}>{i18n.t('screens')['coachPage']['clients']}</Text>
                                            </View>
                                            <View style={styles.statContainer}>
                                                <Text style={styles.statValue}>{this.props.route.params.coach.rating}</Text>
                                                <Text style={styles.statTitle}>{i18n.t('screens')['coachPage']['rating']}</Text>
                                            </View>
                                            {
                                                /*
                                            <View style={styles.statContainer}>
                                                <Text style={styles.statValue}>{this.props.route.params.coach.experience ?? "-"}</Text>
                                                <Text style={styles.statTitle}>{i18n.t('screens')['coachPage']['experience']}</Text>
                                            </View>
                                                */
                                            }
                                        </View>
                                        <Pressable style={({ pressed }) => [
                                            {
                                                opacity: pressed ? 0.1 : 1,
                                            }
                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                            Linking.openURL(`https://google.com/maps/@${this.props.route.params.coach.location.lat},${this.props.route.params.coach.location.lng},11z`)
                                        }}>
                                            <Text style={styles.location}>{this.props.route.params.coach.location.address}</Text>
                                        </Pressable>
                                    </View>
                                    {
                                        this.props.route.params.coach.prefersOfflineCoaching
                                            ? <Text style={[globalStyles.important, { marginBottom: 32 }]}>{i18n.t('screens')['coachPage']['preffersOfflineCoaching']}</Text>
                                            : null
                                    }
                                    <Pressable style={({ pressed }) => [
                                        globalStyles.authPageActionButton,
                                        {
                                            opacity: pressed ? 0.1 : 1,
                                        }
                                    ]} onPress={() => {
                                        if (!this.state.isLoading) this.sendRequest();
                                    }}>
                                        {
                                            !this.state.isLoading
                                                ? <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['coachPage']['actionButton']}</Text>
                                                : <ActivityIndicator
                                                    animating={true}
                                                    color="#fff"
                                                    size="small"
                                                />
                                        }
                                    </Pressable>
                                    {
                                        this.props.route.params.coach.reviews.length > 0
                                            ? <ScrollView style={{ marginTop: 32 }} contentContainerStyle={globalStyles.fillEmptySpace}>
                                                <Text style={[globalStyles.modalText, { textAlign: 'left' }]}>Reviews</Text>
                                                {
                                                    this.props.route.params.coach.reviews.map((review, index) =>
                                                        <View key={index} style={styles.coachResult}>
                                                            <View style={styles.coachResultInline}>
                                                                {
                                                                    !review.clientInstance.profilePicture
                                                                        ? <View style={styles.reviewProfilePictureContainer}>
                                                                            <Text style={styles.reviewNoProfilePictureText}>
                                                                                {review.clientInstance.firstName.charAt(0)}
                                                                                {review.clientInstance.lastName.charAt(0)}
                                                                            </Text>
                                                                        </View>
                                                                        : <Image style={styles.reviewProfilePictureContainer}
                                                                            source={{ uri: review.clientInstance.profilePicture }} />
                                                                }
                                                                <Text style={styles.reviewNames}>
                                                                    {review.clientInstance.firstName}
                                                                    &nbsp;
                                                                    {review.clientInstance.lastName}
                                                                </Text>
                                                            </View>
                                                            <View style={[styles.coachResultInline, { marginTop: 8 }]}>
                                                                <Ionicons name="md-star" size={20} color="#1f6cb0" />
                                                                <Text style={styles.coachResultReviews}>{review.rating}/5</Text>
                                                            </View>
                                                            {
                                                                review.review && review.review.length > 0
                                                                    ? <Text style={[globalStyles.notation, { marginTop: 8 }]}>{review.review}</Text>
                                                                    : null
                                                            }
                                                        </View>
                                                    )
                                                }
                                            </ScrollView>
                                            : null
                                    }
                                </>
                                : null
                        }
                    </View>
                </View>
            </View>
        )
    }
}
