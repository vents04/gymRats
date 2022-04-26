import React, { Component } from 'react'
import axios from 'axios';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
            maxDistance: 30,
            minRating: 2,
            lat: null,
            lng: null,
            searchResults: [],
        }
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
        ApiRequests.get(`coaching/coach/search?name=${this.query.toLowerCase()}&lat=${this.state.lat}&lng=${this.state.lng}`, {}, true).then((response) => {
            console.log(response.data.results.length);
            this.setState({ searchResults: response.data.results })
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
            </View>
        )
    }
}
