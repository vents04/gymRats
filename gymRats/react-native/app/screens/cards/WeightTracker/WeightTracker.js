import React, { Component } from 'react';
import { ActivityIndicator, BackHandler, Text, TextInput, Pressable, TouchableWithoutFeedback, View } from 'react-native';

import ApiRequests from '../../../classes/ApiRequests';
import { BackButtonHandler } from '../../../classes/BackButtonHandler';

import { HTTP_STATUS_CODES, WEIGHT_UNITS, WEIGHT_UNITS_LABELS } from '../../../../global';
import { cardColors } from '../../../../assets/styles/cardColors';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './WeightTracker.styles';
import { Ionicons } from '@expo/vector-icons';

import i18n from 'i18n-js';

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

        this.input = React.createRef();

        this.backHandler;
    }

    backAction = () => {
        BackButtonHandler.goToPageWithDataManagerCardUpdate(this.props.navigation, "Calendar", this.props.route.params.date)
        return true;
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            this.backAction
        );
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

    componentWillUnmount = () => {
        this.backHandler.remove();
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
            weight: 7888.99999,
            unit: this.state.weightUnit
        }, true).then((response) => {
            this.setState({ showSaving: false });
            this.backAction();
        }).catch((error) => {
            this.setState({
                showError: true,
                showSaving: false,
                error: error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
                    ? error.response.data
                    : i18n.t('errors')['internalServerError']
            })
        })
    }

    render() {
        return <View style={globalStyles.safeAreaView}>
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
                    <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['weightTracker']['title']}</Text>
                </View>
                <Pressable style={[styles.weightInputContainer, globalStyles.authPageInput]} onPress={() => {
                    this.input.current.focus();
                }}>
                    <TextInput
                        ref={this.input}
                        keyboardType='decimal-pad'
                        value={this.state.weight}
                        style={styles.editSectionInput}
                        placeholder="80"
                        editable={!this.state.showSaving}
                        onChangeText={(val) => {
                            let shouldNotBeAdded = false;
                            if (val.includes(".")) {
                                if (val.split(".")[0].length > 3) {
                                    shouldNotBeAdded = true;
                                }
                            }
                            else if (parseInt(val) >= 10000 || parseInt(val) < 2.1) shouldNotBeAdded = true;
                            if (!shouldNotBeAdded) this.setState({ weight: val, showError: false })
                        }} />
                    <Text style={styles.editSectionInput}>{i18n.t('constants')[WEIGHT_UNITS_LABELS[this.state.weightUnit]]}</Text>
                </Pressable>
                {
                    this.state.showError
                        ? <Text style={[globalStyles.errorBox, {
                            marginTop: 48
                        }]}>{this.state.error}</Text>
                        : null
                }
                <Pressable style={[globalStyles.authPageActionButton, {
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
                                        ? i18n.t('screens')['weightTracker']['update']
                                        : i18n.t('screens')['weightTracker']['add']
                                }
                            </Text>
                    }
                </Pressable>
            </View>
        </View >;
    }
}
