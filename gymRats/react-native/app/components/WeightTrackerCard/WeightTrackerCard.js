import React, { Component } from 'react';
import { Text, Pressable, View } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';
import { DataManager } from "../../classes/DataManager";

import i18n from 'i18n-js';

import ConfirmationBox from '../ConfirmationBox/ConfirmationBox';

import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES, WEIGHT_UNITS_LABELS } from '../../../global';
import { cardColors } from '../../../assets/styles/cardColors';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './WeightTrackerCard.styles';

export default class WeightTrackerCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showConfirmationBox: false,
            data: null,
            showError: false,
            error: null
        }
    }

    componentDidMount() {
        this.setState({ data: this.props.data })
    }

    toggleShowConfirmationBox = (state) => {
        this.setState({ showConfirmationBox: state });
    }

    deleteCard = () => {
        ApiRequests.delete(`weight-tracker/daily-weight/${this.props.data._id}`, {}, true).then((response) => {
            this.toggleShowConfirmationBox(false);
            DataManager.onDateCardChanged(this.props.date);
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
            <Pressable onPress={() => {
                if (!this.state.showConfirmationBox) this.props.actionButtonFunction();
            }} unstable_pressDelay={150}            ><View style={globalStyles.card}>
                    {
                        this.state.showConfirmationBox
                            ? <ConfirmationBox deleteCard={this.deleteCard} toggleShowConfirmationBox={this.toggleShowConfirmationBox} />
                            : null
                    }
                    <View style={globalStyles.cardTopbar}>
                        <FontAwesome5 name="weight" size={25} color={cardColors.weightTracker} />
                        <Text style={globalStyles.cardTitle}>{i18n.t('components')['cards']['weightTracker']['cardTitle']}</Text>
                        {
                            !this.props.client
                                ? <Pressable style={({ pressed }) => [
                                    globalStyles.cardTopbarIcon,
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                    }
                                ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                    this.setState({ showConfirmationBox: true })
                                }}>
                                    <MaterialCommunityIcons name="delete" size={25} color="#ddd" />
                                </Pressable>
                                : null
                        }
                    </View>
                    <View>
                        {
                            this.state.showError
                                ? <Text style={[globalStyles.errorBox, {
                                    marginTop: 16
                                }]}>{this.state.error}</Text>
                                : <>
                                    <Text style={styles.weight}>
                                        {this.props.data.weight}
                                        &nbsp;
                                        {WEIGHT_UNITS_LABELS[this.props.data.unit]}
                                    </Text>
                                    {
                                        this.props.data.trend != 0
                                            ? this.props.data.trend < 0
                                                ? <View style={styles.statsContainer}>
                                                    <FontAwesome name="long-arrow-down" size={20} color={cardColors.negative} />
                                                    <Text style={styles.weightTrend}>
                                                        {Math.abs(this.props.data.trend)}
                                                        &nbsp;
                                                        {WEIGHT_UNITS_LABELS[this.props.data.unit]}
                                                        &nbsp;
                                                        {i18n.t('components')['cards']['weightTracker']['lostWeight']}
                                                    </Text>
                                                </View>
                                                : <View style={styles.statsContainer}>
                                                    <FontAwesome name="long-arrow-up" size={20} color={cardColors.weightTracker} />
                                                    <Text style={styles.weightTrend}>
                                                        {this.props.data.trend}
                                                        &nbsp;
                                                        {WEIGHT_UNITS_LABELS[this.props.data.unit]}
                                                        &nbsp;
                                                        {i18n.t('components')['cards']['weightTracker']['gainedWeight']}
                                                    </Text>
                                                </View>
                                            : null
                                    }
                                    {
                                        !this.props.client
                                            ? <Pressable onPress={() => {
                                                this.props.actionButtonFunction();
                                            }} style={({ pressed }) => [
                                                globalStyles.authPageActionButton,
                                                {
                                                    backgroundColor: cardColors.weightTracker,
                                                    marginTop: 16
                                                }
                                            ]}>
                                                <Text style={globalStyles.authPageActionButtonText}>{i18n.t('components')['cards']['weightTracker']['redirectButton']}</Text>
                                            </Pressable>
                                            : null
                                    }
                                </>
                        }
                    </View>
                </View>
            </Pressable>
        )
    }
}
