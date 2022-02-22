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
        selectedLocation: "",
        showError: false,
        error: ""
    }

    searchLocation = () => {
        ApiRequests.get(`google/search-places?query=${this.state.query}`, {}, true).then((response) => {
            this.setState({ results: response.data.results })
            console.log(response.data.results)
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

    getPlace = () => {
        ApiRequests.get(`google/place/${this.state.selectedLocation.place_id}`, {}, true).then((response) => {
            const selectedLocation = this.state.selectedLocation;
            selectedLocation.location = response.data.result.geometry.location;
            this.setState({ selectedLocation: selectedLocation }, () => {
                this.submitApplication()
            })
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

    submitApplication = () => {
        ApiRequests.post(`coaching/application`, {}, {
            location: {
                address: this.state.selectedLocation.description,
                lat: this.state.selectedLocation.location.lat,
                lng: this.state.selectedLocation.location.lng
            }
        }, true).then((response) => {
            this.props.navigation.navigate("Coaching", { tab: "myClients" });
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
                            marginVertical: 20
                        }]}
                        placeholder="Where are you located?"
                        onChangeText={(val) => {
                            this.setState({ query: val, showError: false, selectedLocation: "" }, () => {
                                this.searchLocation();
                            })
                        }}
                        onFocus={() => {
                            if (this.state.query == this.state.selectedLocation.description)
                                this.setState({ query: "", selectedLocation: "", showError: false })
                        }} />
                    {
                        !this.state.selectedLocation &&
                        this.state.results.map((result) =>
                            <TouchableOpacity style={styles.resultContainer} onPress={() => {
                                this.setState({ selectedLocation: result, query: result.description });
                            }}>
                                <Text style={styles.result}>{result.description}</Text>
                            </TouchableOpacity>
                        )
                    }
                    {
                        this.state.selectedLocation &&
                        <>
                            <Text style={[globalStyles.notation, {
                                marginBottom: 10
                            }]}>Reviewing you application will take no more than 24 hours after</Text>
                            <TouchableOpacity style={globalStyles.authPageActionButton} onPress={() => {
                                this.getPlace()
                            }}>
                                <Text style={globalStyles.authPageActionButtonText}>Submit application</Text>
                            </TouchableOpacity>
                        </>
                    }
                </View>
            </View>
        )
    }
}
