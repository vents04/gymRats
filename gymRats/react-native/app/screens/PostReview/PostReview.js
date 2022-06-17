import React, { Component } from 'react'
import { Text, Pressable, View, ScrollView, TextInput, Image, BackHandler, ActivityIndicator } from 'react-native';
import { Rating, AirbnbRating } from 'react-native-ratings';

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles'
import styles from './PostReview.styles';

export default class PostReview extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rating: 4,
            review: "",
            showError: false,
            error: "",
            showLoading: false
        }

        this.ratingTitles = [i18n.t('screens')['postReview']['ratingTitlesTerrible'], i18n.t('screens')['postReview']['ratingTitlesBad'], i18n.t('screens')['postReview']['ratingTitlesOK'], i18n.t('screens')['postReview']['ratingTitlesGood'], i18n.t('screens')['postReview']['ratingTitlesExcellent']];
    }

    backAction = () => {
        this.props.navigation.navigate("Coaching", { tab: "myCoach" })
        return true;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    postReview = () => {
        let payload = {
            rating: this.state.rating
        }
        if (this.state.review.length > 0) payload.review = this.state.review;
        ApiRequests.post(`coaching/relation/${this.props.route.params.relation._id}/review`, {}, payload, true).then((response) => {
            this.props.navigation.navigate('Coaching', { tab: "myCoach" });
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
        })
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
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['postReview']['pageTitle']}</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <View style={[styles.requestItem, {
                        flexDirection: "column",
                        alignItems: "flex-start",
                    }]}>
                        <View style={styles.requestItemProfile}>
                            {
                                !this.props.route.params.relation.coach.profilePicture
                                    ? <View style={styles.profilePictureContainer}>
                                        <Text style={styles.noProfilePictureText}>
                                            {this.props.route.params.relation.coach.firstName.charAt(0)}
                                            {this.props.route.params.relation.coach.lastName.charAt(0)}
                                        </Text>
                                    </View>
                                    : <Image style={styles.profilePictureContainer}
                                        source={{ uri: this.props.route.params.relation.coach.profilePicture }} />
                            }
                            <Text style={styles.names}>
                                {this.props.route.params.relation.coach.firstName}
                                &nbsp;
                                {this.props.route.params.relation.coach.lastName}
                            </Text>
                        </View>
                        <Text style={[globalStyles.notation, {
                            marginTop: 12
                        }]}>{i18n.t('screens')['postReview']['startOfRelation']} {new Date(this.props.route.params.relation.from).toLocaleDateString()}
                            {
                                this.props.route.params.relation.to
                                    ? i18n.t('screens')['postReview']['endOfRelation'] + " " + new Date(this.props.route.params.relation.to).toLocaleDateString()
                                    : null
                            }</Text>
                    </View>
                    <ScrollView style={globalStyles.fillEmptySpace}>
                        <View style={[styles.section, styles.centeredContent]}>
                            <Text style={styles.sectionTitle}>{i18n.t('screens')['postReview']['rateExperience']}</Text>
                            <AirbnbRating
                                selectedColor="#1f6cb0"
                                count={5}
                                reviews={[i18n.t('screens')['postReview']['ratingTitlesTerrible'], i18n.t('screens')['postReview']['ratingTitlesBad'], i18n.t('screens')['postReview']['ratingTitlesOK'], i18n.t('screens')['postReview']['ratingTitlesGood'], i18n.t('screens')['postReview']['ratingTitlesExcellent']]}
                                defaultRating={4}
                                size={25}
                                showRating={false}
                                onFinishRating={(rating) => {
                                    this.setState({ rating })
                                }}
                            />
                            <Text style={styles.ratingTitle}>{this.ratingTitles[this.state.rating - 1]}</Text>
                        </View>
                        <View style={[styles.section, styles.centeredContent]}>
                            <Text style={styles.sectionTitle}>{i18n.t('screens')['postReview']['review']}</Text>
                            <TextInput
                                multiline={true}
                                value={this.state.review}
                                style={[globalStyles.authPageInput, {
                                    maxHeight: 250
                                }]}
                                placeholder={i18n.t('screens')['postReview']['placeholder']}
                                onChangeText={(val) => { this.setState({ review: val, showError: false }) }} />
                        </View>
                    </ScrollView>
                    <Pressable style={({ pressed }) => [
                        globalStyles.authPageActionButton,
                        {
                            opacity: pressed ? 0.1 : 1,
                            marginVertical: 24
                        }
                    ]} onPress={() => {
                        if (!this.state.showLoading) this.postReview()
                    }}>
                        {
                            !this.state.showLoading
                                ? <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['postReview']['submit']}</Text>
                                : <ActivityIndicator
                                    size="small"
                                    color="#fff"
                                    animating={true} />
                        }
                    </Pressable>
                </View>
            </View>
        )
    }
}
