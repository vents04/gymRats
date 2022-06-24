import React, { Component } from 'react'
import { Alert, Image, ScrollView, Text, TextInput, Pressable, View, BackHandler } from 'react-native';
import BottomSheet from "react-native-gesture-bottom-sheet";
import Slider from '@react-native-community/slider';
import * as Location from "expo-location";

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './CoachSearch.styles';

export default class CoachSearch extends Component {

    constructor(props) {
        super(props);

        this.scrollView = React.createRef();

        this.query = "";

        this.typingTimeout = null

        this.state = {
            showError: false,
            error: "",
            query: "",
            maxDistance: 0,
            minRating: 1,
            lat: null,
            lng: null,
            searchResults: [],
            filtersChanged: false
        }

        this.filterSheet = React.createRef();
    }

    backAction = () => {
        this.props.navigation.navigate("Coaching", { tab: "myCoach" })
        return true;
    }

    async componentDidMount() {
        this.searchCoaches();
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.requestLocationPermission();
        })
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    getLocation = async () => {
        let location = await Location.getCurrentPositionAsync({});
        console.log("LOKACIQ", location)
        this.setState({ lat: location.coords.latitude, lng: location.coords.longitude }, () => {
            this.searchCoaches()
        });
    }

    requestLocationPermission = async () => {
        try {
            let permission = await Location.getForegroundPermissionsAsync();
            if (permission.status !== "granted" && permission.canAskAgain) {
                Alert.alert(i18n.t('screens')['coachSearch']['locationPermission'], i18n.t('screens')['coachSearch']['message'],
                    [
                        {
                            text: "OK",
                            onPress: async () => {
                                let { status } = await Location.requestForegroundPermissionsAsync();
                                if (status !== 'granted') return;
                                this.getLocation();
                            }
                        },
                    ]);
            } else {
                this.getLocation();
            }
        } catch (error) {
            this.setState({ showError: true, error: error.message })
        }
    }

    searchCoaches = () => {
        this.scrollView.current?.scrollTo({
            y: 0,
            animated: true
        });
        let searchQuery = `coaching/coach/search?lat=${this.state.lat}&lng=${this.state.lng}`;
        if (this.query.length > 0) {
            searchQuery += `&name=${this.query}`
        }
        if (this.state.maxDistance > 0) {
            searchQuery += `&maxDistance=${this.state.maxDistance}`;
        }
        if (this.state.minRating > 1) {
            searchQuery += `&minRating=${this.state.minRating}`;
        }
        ApiRequests.get(searchQuery, {}, true).then((response) => {
            this.setState({ searchResults: response.data.results })
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
        });
    }

    changeName = (value) => {
        this.query = value.trim();

        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.typingTimeout = setTimeout(() => {
            this.searchCoaches();
        }, 600);
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
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['coachSearch']['pageTitle']}</Text>
                    </View>
                    <Pressable style={({ pressed }) => [
                        globalStyles.topbarIconContainer,
                        {
                            opacity: pressed ? 0.1 : 1,
                        }
                    ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                        this.filterSheet.current.show();
                    }}>
                        <Text style={globalStyles.actionText}>{i18n.t('screens')['coachSearch']['filters']}</Text>
                    </Pressable>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <TextInput
                        style={[globalStyles.authPageInput, {
                            marginTop: 20
                        }]}
                        placeholder={i18n.t('screens')['coachSearch']['placeholder']}
                        onChangeText={this.changeName} />
                    {
                        this.state.searchResults.length > 0
                            ? <ScrollView style={{
                                marginTop: 16
                            }}
                                contentContainerStyle={globalStyles.fillEmptySpace}
                                ref={this.scrollView}>
                                {
                                    this.state.searchResults.map((result, index) =>
                                        <Pressable style={({ pressed }) => [
                                            {
                                                opacity: pressed ? 0.1 : 1,
                                            }
                                        ]} key={index} onPress={() => {
                                            this.props.navigation.navigate("CoachPage", { coach: result })
                                        }}>
                                            {
                                                result.user
                                                    ? <View style={styles.coachResult}>
                                                        <View style={styles.coachResultInline}>
                                                            {
                                                                !result.user.profilePicture
                                                                    ? <View style={styles.profilePictureContainer}>
                                                                        <Text style={styles.noProfilePictureText}>
                                                                            {result.user.firstName.charAt(0)}
                                                                            {result.user.lastName.charAt(0)}
                                                                        </Text>
                                                                    </View>
                                                                    : <Image style={styles.profilePictureContainer}
                                                                        source={{ uri: result.user.profilePicture }} />
                                                            }
                                                            <Text style={styles.names}>
                                                                {result.user.firstName}
                                                                &nbsp;
                                                                {result.user.lastName}
                                                            </Text>
                                                        </View>
                                                        <View style={[styles.coachResultInline, { marginTop: 8 }]}>
                                                            <Ionicons name="md-star" size={20} color="#1f6cb0" />
                                                            <Text style={styles.coachResultReviews}>{result.rating}/5 ({result.reviews.length} {i18n.t('screens')['coachSearch']['reviews']})</Text>
                                                        </View>
                                                    </View>
                                                    : <View style={styles.coachResult}>
                                                        <View style={styles.coachResultInline}>
                                                            {
                                                                !result.profilePicture
                                                                    ? <View style={styles.profilePictureContainer}>
                                                                        <Text style={styles.noProfilePictureText}>
                                                                            {result.firstName.charAt(0)}
                                                                            {result.lastName.charAt(0)}
                                                                        </Text>
                                                                    </View>
                                                                    : <Image style={styles.profilePictureContainer}
                                                                        source={{ uri: result.profilePicture }} />
                                                            }
                                                            <Text style={styles.names}>
                                                                {result.firstName}
                                                                &nbsp;
                                                                {result.lastName}
                                                            </Text>
                                                        </View>
                                                        <View style={[styles.coachResultInline, { marginTop: 8 }]}>
                                                            <Ionicons name="md-star" size={20} color="#1f6cb0" />
                                                            <Text style={styles.coachResultReviews}>{result.rating}/5 ({result.reviews.length} {i18n.t('screens')['coachSearch']['reviews']})</Text>
                                                        </View>
                                                    </View>
                                            }
                                        </Pressable>
                                    )
                                }
                            </ScrollView>
                            : <Text style={[globalStyles.notation, {
                                marginTop: 16
                            }]}>{i18n.t('screens')['coachSearch']['noCoachesFound']}</Text>
                    }
                </View>
                <BottomSheet ref={this.filterSheet} height={this.state.lat != null && this.state.lng != null ? 400 : 250} draggable={false}>
                    <View style={styles.bottomSheetTopbar}>
                        <Text style={styles.bottomSheetTitle}>{i18n.t('screens')['coachSearch']['filters']}</Text>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.filterSheet.current.close();
                        }}>
                            <Ionicons name="close" size={30} />
                        </Pressable>
                    </View>
                    <ScrollView style={styles.cardsContainer}>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} onPress={() => {
                            this.filterSheet.current.close();
                        }}>
                            <Text style={styles.sheetSectionTitle}>{i18n.t('screens')['coachSearch']['minimumRating']} {this.state.minRating}/5</Text>
                            <Slider
                                style={{ width: "100%", height: 40 }}
                                step={1}
                                value={this.state.minRating}
                                thumbTintColor="#1f6cb0"
                                minimumValue={1}
                                maximumValue={5}
                                minimumTrackTintColor="#1f6cb0"
                                maximumTrackTintColor="#000000"
                                onSlidingComplete={(value) => {
                                    this.setState({ minRating: value, filtersChanged: true });
                                }}
                            />
                        </Pressable>
                        {
                            this.state.lat != null && this.state.lng != null
                                ? <Pressable style={({ pressed }) => [
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                        marginTop: 32
                                    }
                                ]} onPress={() => {
                                    this.filterSheet.current.close();
                                }}>
                                    <Text style={[styles.sheetSectionTitle, { paddingLeft: 0 }]}>{i18n.t('screens')['coachSearch']['maximumDistance']} {
                                        this.state.maxDistance != 0
                                            ? `${this.state.maxDistance}km`
                                            : i18n.t('screens')['coachSearch']['unsetMaximumDistance']
                                    }</Text>
                                    {
                                        this.state.maxDistance != 0
                                            ? <>
                                                <Slider
                                                    style={{ width: "100%", height: 40 }}
                                                    step={1}
                                                    value={this.state.maxDistance}
                                                    thumbTintColor="#1f6cb0"
                                                    minimumValue={1}
                                                    maximumValue={30}
                                                    minimumTrackTintColor="#1f6cb0"
                                                    maximumTrackTintColor="#000000"
                                                    onSlidingComplete={(value) => {
                                                        this.setState({ maxDistance: value, filtersChanged: true });
                                                    }}
                                                />
                                                <Pressable style={({ pressed }) => [
                                                    {
                                                        opacity: pressed ? 0.1 : 1,
                                                    }
                                                ]} onPress={() => {
                                                    this.filterSheet.current.show();
                                                    this.setState({ maxDistance: 0 });
                                                }}>
                                                    <Text style={[globalStyles.actionText, {
                                                        fontFamily: "MainBold",
                                                        marginTop: 8
                                                    }]}>{i18n.t('screens')['coachSearch']['unsetMaximumDistance']}</Text>
                                                </Pressable>
                                            </>
                                            : <Pressable style={({ pressed }) => [
                                                {
                                                    opacity: pressed ? 0.1 : 1,
                                                }
                                            ]} onPress={() => {
                                                this.filterSheet.current.show();
                                                this.setState({ maxDistance: 30, filtersChanged: true });
                                            }}>
                                                <Text style={[globalStyles.actionText, {
                                                    fontFamily: "MainBold",
                                                    marginTop: 8
                                                }]}>{i18n.t('screens')['coachSearch']['setMaximumDistance']}</Text>
                                            </Pressable>
                                    }
                                </Pressable>
                                : null
                        }
                        {
                            this.state.filtersChanged
                                ? <Pressable style={({ pressed }) => [
                                    globalStyles.authPageActionButton,
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                        marginTop: 16
                                    }
                                ]} onPress={() => {
                                    this.filterSheet.current.close();
                                    this.setState({ hasChanges: false, showError: false, error: "" });
                                    this.searchCoaches();
                                }}>
                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['coachSearch']['applyFilters']}</Text>
                                </Pressable>
                                : null
                        }
                    </ScrollView>
                </BottomSheet>
            </View>
        )
    }
}
