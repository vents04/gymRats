import React, { Component } from 'react'
import { BiArrowBack } from 'react-icons/bi';
import { Text, TextInput, View } from 'react-native';
import axios from 'axios';
import ApiRequests from '../../classes/ApiRequests';
import { HTTP_STATUS_CODES } from '../../../global';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./CoachSearch.styles')

export default class CoachSearch extends Component {

    state = {
        showError: false,
        error: "",
        query: "",
        maxDistance: 30,
        minRating: 2,
        lat: null,
        lng: null
    }

    componentDidMount() {
        this.getLocationByIp();
    }

    getLocationByIp = async () => {
        const geolocationByIp = await axios.get('https://geolocation-db.com/json/');
        this.setState({ lat: geolocationByIp.data.latitude, lng: geolocationByIp.data.longitude });
        return;
    }

    searchCoaches = async () => {
        ApiRequests.get(`coaching/coach/search
            ?name=${this.state.query.toLowerCase()}
            &lat=${this.state.lat}
            &lng=${this.state.lng}
            &maxDistance=${this.state.maxDistance}
            &minRating=${this.state.minRating}`, {}, true).then((response) => {
            console.log(response.data);
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

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <BiArrowBack size={25} onClick={() => {
                            this.props.navigation.navigate("Coaching", { tab: "myCoach" })
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Coach search</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <TextInput
                        value={this.state.query}
                        style={[globalStyles.authPageInput, {
                            marginTop: 20
                        }]}
                        placeholder="Type your search here"
                        onChangeText={(val) => {
                            this.setState({ query: val, showError: false }, () => {
                                this.searchCoaches();
                            })
                        }} />
                </View>
            </View>
        )
    }
}
