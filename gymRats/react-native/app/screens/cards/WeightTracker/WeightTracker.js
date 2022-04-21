import React, { Component } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BiArrowBack, BiCheck } from 'react-icons/bi';
import { Picker } from '@react-native-picker/picker';
import { cardColors } from '../../../../assets/styles/cardColors';
import ApiRequests from '../../../classes/ApiRequests';
import { HTTP_STATUS_CODES } from '../../../../global';

const globalStyles = require('../../../../assets/styles/global.styles');
const styles = require('./WeightTracker.styles');

export default class WeightTracker extends Component {

    state = {
        weight: null,
        weightUnit: "KILOGRAMS",
        showSaving: false,
        showError: false,
        error: "",
        originalRecord: null
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
            this.setState({ weightUnit: response.data.weightUnit });
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
                    <BiArrowBack size={25} onClick={() => {
                        this.props.navigation.navigate("Calendar", { reloadDate: true, date: this.props.route.params.date })
                    }} />
                    <Text style={globalStyles.followUpScreenTitle}>Weight</Text>
                </View>
                <View style={[styles.weightInputContainer, globalStyles.authPageInput]}>
                    <TextInput
                        value={this.state.weight}
                        style={[styles.editSectionInput, {
                            width: "80%"
                        }]}
                        placeholder="Weight:"
                        editable={!this.state.showSaving}
                        onChangeText={(val) => { this.setState({ weight: val, showError: false }) }} />
                    <Text style={styles.editSectionInput}>{this.state.weightUnit == "KILOGRAMS" ? "kgs" : "lbs"}</Text>
                </View>
                {
                    this.state.showError
                    && <Text style={[globalStyles.errorBox, {
                        marginTop: 48
                    }]}>{this.state.error}</Text>
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
