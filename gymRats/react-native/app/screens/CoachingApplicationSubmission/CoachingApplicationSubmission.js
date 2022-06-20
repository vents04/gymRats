import React, { Component } from 'react'
import { Text, TextInput, View, Pressable, Switch, BackHandler, ActivityIndicator } from 'react-native';
import i18n from 'i18n-js';

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
            error: "",
            showLoading: false
        }
    }

    backAction = () => {
        this.props.navigation.navigate("Coaching", { tab: "myClients" });
        return true;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    searchLocation = () => {
        ApiRequests.get(`google/search-places?query=${this.state.query.trim()}`, {}, true).then((response) => {
            this.setState({ results: response.data.results })
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

    getPlace = () => {
        this.setState({ showLoading: true }, () => {
            ApiRequests.get(`google/place/${this.state.selectedLocation.place_id}`, {}, true).then((response) => {
                const selectedLocation = this.state.selectedLocation;
                selectedLocation.location = response.data.result.geometry.location;
                this.setState({ selectedLocation: selectedLocation }, () => {
                    this.submitApplication()
                })
            }).catch((error) => {
                this.setState({ showLoading: false });
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
            this.backAction();
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
            this.setState({ showLoading: false });
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
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['coachingApplicationSubmission']['pageTitle']}</Text>
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
                        placeholder={i18n.t('screens')['coachingApplicationSubmission']['locationInputPlaceholder']}
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
                                <Pressable style={({ pressed }) => [
                                    styles.resultContainer,
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                    }
                                ]} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} key={index} onPress={() => {
                                    this.setState({ selectedLocation: result, query: result.description });
                                }}>
                                    <Text style={styles.result}>{result.description}</Text>
                                </Pressable>
                            )
                            : null
                    }
                    <Text style={[globalStyles.notation, {
                        marginTop: 16
                    }]}>{i18n.t('screens')['coachingApplicationSubmission']['prefersOfflineCoachingText']}</Text>
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
                                }]}>{i18n.t('screens')['coachingApplicationSubmission']['processDescriptor']}</Text>
                                <Pressable style={({ pressed }) => [
                                    globalStyles.authPageActionButton,
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                    }
                                ]} onPress={() => {
                                    if (!this.state.showLoading) this.getPlace()
                                }}>
                                    {
                                        !this.state.showLoading
                                            ? <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['coachingApplicationSubmission']['actionButton']}</Text>
                                            : <ActivityIndicator
                                                size="small"
                                                color="#fff"
                                                animating={true} />
                                    }
                                </Pressable>
                            </>
                            : null
                    }
                </View>
            </View>
        )
    }
}
