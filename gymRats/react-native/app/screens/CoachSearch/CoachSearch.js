import React, { Component } from 'react'
import axios from 'axios';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheet from "react-native-gesture-bottom-sheet";
import Slider from '@react-native-community/slider';

import ApiRequests from '../../classes/ApiRequests';

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

    async componentDidMount() {
        await this.getLocationByIp();
        this.searchCoaches();
    }

    getLocationByIp = async () => {
        const geolocationByIp = await axios.get('https://geolocation-db.com/json/');
        this.setState({ lat: geolocationByIp.data.latitude, lng: geolocationByIp.data.longitude });
        return;
    }

    searchCoaches = () => {
        this.scrollView.current?.scrollTo({
            y: 0,
            animated: true
        });
        let searchQuery = `coaching/coach/search?lat=${this.state.lat}&lng=${this.state.lng}`;
        if (this.query.length > 0) {
            searchQuery += `name=${this.state.query};`
        }
        if (this.state.maxDistance > 0) {
            searchQuery += `&maxDistance=${this.state.maxDistance}`;
        }
        if (this.state.minRating > 1) {
            searchQuery += `&minRating=${this.state.minRating}`;
        }
        ApiRequests.get(searchQuery, {}, true).then((response) => {
            console.log(response.data.results.length);
            this.setState({ searchResults: response.data.results })
        }).catch((error) => {
            console.log(error.response);
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
        });
    }

    changeName = (value) => {
        this.query = value;

        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.typingTimeout = setTimeout(() => {
            this.searchCoaches();
        }, 1500);
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("Coaching", { tab: "myCoach" })
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </TouchableOpacity>
                        <Text style={globalStyles.followUpScreenTitle}>Coach search</Text>
                    </View>
                    <TouchableOpacity style={globalStyles.topbarIconContainer} onPress={() => {
                        this.filterSheet.current.show();
                    }}>
                        <Text style={globalStyles.actionText}>Filters</Text>
                    </TouchableOpacity>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <TextInput
                        style={[globalStyles.authPageInput, {
                            marginTop: 20
                        }]}
                        placeholder="Type your search here"
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
                                        <TouchableOpacity key={index} onPress={() => {
                                            this.props.navigation.navigate("CoachPage", { coach: result })
                                        }}>
                                            <View style={styles.coachResult}>
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
                                                    <Text style={styles.coachResultReviews}>{result.rating}/5 ({result.reviews} reviews)</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }
                            </ScrollView>
                            : <Text style={[globalStyles.notation, {
                                marginTop: 16
                            }]}>No coaches found</Text>
                    }
                </View>
                <BottomSheet ref={this.filterSheet} height={400} draggable={false}>
                    <View style={styles.bottomSheetTopbar}>
                        <Text style={styles.bottomSheetTitle}>Filters</Text>
                        <TouchableOpacity onPress={() => {
                            this.filterSheet.current.close();
                        }}>
                            <Ionicons name="close" size={30} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.cardsContainer}>
                        <TouchableOpacity onPress={() => {
                            this.filterSheet.current.close();

                        }}>
                            <Text style={styles.sheetSectionTitle}>Minimum rating is {this.state.minRating}/5</Text>
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
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            this.filterSheet.current.close();
                        }} style={{ marginTop: 32 }}>
                            <Text style={styles.sheetSectionTitle}>Maximum distance is {
                                this.state.maxDistance != 0
                                    ? `${this.state.maxDistance}km`
                                    : 'not set'
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
                                        <TouchableOpacity onPress={() => {
                                            this.filterSheet.current.show();
                                            this.setState({ maxDistance: 0 });
                                        }}>
                                            <Text style={[globalStyles.actionText, {
                                                fontFamily: "MainBold",
                                                marginTop: 8
                                            }]}>Unset maximum distance</Text>
                                        </TouchableOpacity>
                                    </>
                                    : <TouchableOpacity onPress={() => {
                                        this.filterSheet.current.show();
                                        this.setState({ maxDistance: 30, filtersChanged: true });
                                    }}>
                                        <Text style={[globalStyles.actionText, {
                                            fontFamily: "MainBold",
                                            marginTop: 8
                                        }]}>Set maximum distance</Text>
                                    </TouchableOpacity>
                            }
                        </TouchableOpacity>
                        {
                            this.state.filtersChanged
                                ? <TouchableOpacity style={[globalStyles.authPageActionButton, {
                                    marginTop: 16
                                }]} onPress={() => {
                                    this.filterSheet.current.close();
                                    this.setState({ hasChanges: false });
                                    this.searchCoaches();
                                }}>
                                    <Text style={globalStyles.authPageActionButtonText}>Apply filters</Text>
                                </TouchableOpacity>
                                : null
                        }
                    </ScrollView>
                </BottomSheet>
            </View>
        )
    }
}
