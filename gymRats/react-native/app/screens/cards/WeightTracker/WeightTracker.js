import React, { Component } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ApiRequests from '../../../classes/ApiRequests';

import { HTTP_STATUS_CODES, WEIGHT_UNITS, WEIGHT_UNITS_LABELS } from '../../../../global';
import { cardColors } from '../../../../assets/styles/cardColors';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './WeightTracker.styles';
import { Ionicons } from '@expo/vector-icons';

export default class WeightTracker extends Component {

    constructor(props) {
        super(props);

        this.state = {
            weight: null,
            weightUnit: WEIGHT_UNITS.KILOGRAMS,
            showSaving: false,
            showError: false,
            error: "",
            originalRecord: null
        }
    }

    componentDidMount() {
        this.setState({
            weightUnit: (this.props.route.params.weightUnit) ? this.props.route.params.weightUnit : this.getWeightUnit(),
            weight: (this.props.route.params.weight) ? this.props.route.params.weight : null
        }, () => {
            if (this.state.weight) {
                this.setState({
                    originalRecord: {
                        weight: this.state.weight,
                        weightUnit: this.state.weightUnit
                    }
                })
            }
        });
    }

    getWeightUnit = () => {
        ApiRequests.get("user", {}, true).then((response) => {
            this.setState({ weightUnit: response.data.user.weightUnit });
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

    postWeight = () => {
        this.setState({ showSaving: true });
        ApiRequests.post(`weight-tracker/daily-weight?date=${this.props.route.params.date.getDate()}&month=${this.props.route.params.date.getMonth() + 1}&year=${this.props.route.params.date.getFullYear()}`, false, {
            weight: this.state.weight,
            unit: this.state.weightUnit
        }, true).then((response) => {
            this.setState({ showSaving: false });
            this.props.navigation.navigate("Calendar", { reloadDate: true, date: this.props.route.params.date });
        }).catch((error) => {
            this.setState({
                showError: true,
                showSaving: false,
                error: error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
                    ? error.response.data
                    : "Internal server error"
            })
        })
    }

    deleteWeight = () => {
        this.setState({ showDeleting: true });
        setTimeout(() => {
            ApiRequests.delete(`weight-tracker/daily-weight/${this.props.route.params._id}`, false, true).then((response) => {
                this.setState({ showDeleting: false });
                this.props.navigation.navigate("Calendar", { reloadDate: true, date: this.props.route.params.date });
            }).catch((error) => {
                this.setState({
                    showError: true,
                    showDeleting: false,
                    error: error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
                        ? error.response.data
                        : "Internal server error"
                })
            })
        }, 500);
    }

    render() {
        return <View style={globalStyles.safeAreaView}>
            <View style={globalStyles.pageContainer}>
                <View style={globalStyles.followUpScreenTopbar}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.navigate("Calendar", { reloadDate: true, date: this.props.route.params.date })
                    }}>
                        <Ionicons name="md-arrow-back-sharp" size={25} />
                    </TouchableOpacity>
                    <Text style={globalStyles.followUpScreenTitle}>Weight</Text>
                </View>
                <View style={[styles.weightInputContainer, globalStyles.authPageInput]}>
                    <TextInput
                        keyboardType='numeric'
                        value={this.state.weight}
                        style={styles.editSectionInput}
                        placeholder="Weight:"
                        editable={!this.state.showSaving}
                        onChangeText={(val) => { this.setState({ weight: val, showError: false }) }} />
                    <Text style={styles.editSectionInput}>{WEIGHT_UNITS_LABELS[this.state.weightUnit]}</Text>
                </View>
                {
                    this.state.showError
                        ? <Text style={[globalStyles.errorBox, {
                            marginTop: 48
                        }]}>{this.state.error}</Text>
                        : null
                }
                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                    backgroundColor: cardColors.weightTracker,
                    marginTop: 16
                }]} onPress={() => {
                    if (!this.state.showSaving && !this.state.showDeleting) this.postWeight();
                }}>
                    {
                        this.state.showSaving
                            ? <ActivityIndicator
                                animating={true}
                                size="small"
                                color="#fff" />
                            : <Text style={globalStyles.authPageActionButtonText}>
                                {
                                    this.state.originalRecord
                                        ? "Update"
                                        : "Add"
                                }
                            </Text>
                    }
                </TouchableOpacity>
            </View>
        </View >;
    }
}
