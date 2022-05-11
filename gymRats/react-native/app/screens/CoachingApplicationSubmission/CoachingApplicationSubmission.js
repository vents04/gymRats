import React, { Component } from 'react'
import { Text, TextInput, View, TouchableOpacity, Switch } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './CoachingApplicationSubmission.styles';

export default class CoachingApplicationSubmission extends Component {

    constructor(props) {
        super(props);

        this.state = {
            query: "",
            results: [],
            selectedLocation: "",
            prefersOfflineCoaching: false,
            showError: false,
            error: ""
        }
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
            },
            prefersOfflineCoaching: this.state.prefersOfflineCoaching
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
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("Coaching")
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </TouchableOpacity>
                        <Text style={globalStyles.followUpScreenTitle}>Application submission</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
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
                        !this.state.selectedLocation
                            ? this.state.results.map((result, index) =>
                                <TouchableOpacity key={index} style={styles.resultContainer} onPress={() => {
                                    this.setState({ selectedLocation: result, query: result.description });
                                }}>
                                    <Text style={styles.result}>{result.description}</Text>
                                </TouchableOpacity>
                            )
                            : null
                    }
                    <Text style={[globalStyles.notation, {
                        marginTop: 16
                    }]}>Do you prefer to work with clients only in person?</Text>
                    <View style={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", }}>
                        <Switch
                            trackColor={{ false: '#767577', true: '#53c7f0' }}
                            thumbColor={this.state.prefersOfflineCoaching ? '#1f6cb0' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => {
                                this.setState({ prefersOfflineCoaching: !this.state.prefersOfflineCoaching });
                            }}
                            value={this.state.prefersOfflineCoaching}
                        />
                    </View>
                    {
                        this.state.selectedLocation
                            ? <>
                                <Text style={[globalStyles.notation, {
                                    marginBottom: 10,
                                    marginTop: 16
                                }]}>Our team will review your application as soon as possible.</Text>
                                <TouchableOpacity style={globalStyles.authPageActionButton} onPress={() => {
                                    this.getPlace()
                                }}>
                                    <Text style={globalStyles.authPageActionButtonText}>Submit application</Text>
                                </TouchableOpacity>
                            </>
                            : null
                    }
                </View>
            </View>
        )
    }
}
