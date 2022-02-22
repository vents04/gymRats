import React, { Component } from 'react'
import { BiArrowBack } from 'react-icons/bi';
import { Text, TextInput, View, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { HTTP_STATUS_CODES } from '../../../global';
import ApiRequests from '../../classes/ApiRequests';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./CoachingApplicationSubmission.styles');

export default class CoachingApplicationSubmission extends Component {

    state = {
        query: "",
        results: [],
        showError: false,
        error: ""
    }

    searchLocation = () => {
        ApiRequests.get(`google/search-places?query=${this.state.query}`, {}, true).then((response) => {
            this.setState({ results: response.data.results })
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
                            this.props.navigation.navigate("Coaching")
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Application submission</Text>
                    </View>
                    {
                        this.state.showError && <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                    }
                    <TextInput
                        value={this.state.query}
                        style={[globalStyles.authPageInput, {
                            marginTop: 20
                        }]}
                        placeholder="Where are you located?"
                        onChangeText={(val) => {
                            this.setState({ query: val, showError: false }, () => {
                                this.searchLocation();
                            })
                        }} />
                    {
                        this.state.results.map((result) =>
                            <TouchableOpacity style={styles.resultContainer} onPress={() => {

                            }}>
                                <Text style={styles.result}>{result.description}</Text>
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>
        )
    }
}
