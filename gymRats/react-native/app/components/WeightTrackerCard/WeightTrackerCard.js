import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { FaWeight, FaLongArrowAltUp, FaLongArrowAltDown } from 'react-icons/fa';
import { AiFillDelete } from 'react-icons/ai';
import ApiRequests from '../../classes/ApiRequests';
import ConfirmationBox from '../ConfirmationBox/ConfirmationBox';
import { HTTP_STATUS_CODES } from '../../../global';
import i18n from 'i18n-js';

const { cardColors } = require('../../../assets/styles/cardColors');
const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./WeightTrackerCard.styles');

export default class WeightTrackerCard extends Component {

    state = {
        showConfirmationBox: false,
        data: null
    }

    componentDidMount() {
        this.setState({ data: this.props.data })
    }

    toggleShowConfirmationBox = (state) => {
        this.setState({ showConfirmationBox: state });
    }

    deleteCard = () => {
        ApiRequests.delete(`weight-tracker/daily-weight?date=${this.state.data.date}&month=${this.state.data.month}&year=${this.state.data.year}`, {}, true).then((response) => {
            this.toggleShowConfirmationBox(false);
            this.props.rerender(this.props.date);
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
        return <View style={globalStyles.card}>
            {this.state.showConfirmationBox && <ConfirmationBox deleteCard={this.deleteCard} toggleShowConfirmationBox={this.toggleShowConfirmationBox} />}
            <View style={globalStyles.cardTopbar}>
                <FaWeight size={25} color={cardColors.weightTracker} />
                <Text style={globalStyles.cardTitle}>{i18n.t('components')['cards']['weightTracker']['cardTitle']}</Text>
                {
                    !this.props.client
                    && <View style={globalStyles.cardTopbarIcon}>
                        <AiFillDelete size={25} color="#ddd" onClick={() => {
                            this.setState({ showConfirmationBox: true })
                        }} />
                    </View>
                }
            </View>
            <View>
                <Text style={styles.weight}>
                    {this.props.data.weight}
                    &nbsp;
                    {
                        this.props.data.unit == "KILOGRAMS"
                            ? "kgs"
                            : "lbs"
                    }
                </Text>
                {
                    this.props.data.trend != 0
                        ? this.props.data.trend < 0
                            ? <View style={styles.statsContainer}>
                                <FaLongArrowAltDown size={20} color={cardColors.negative} />
                                <Text style={styles.weightTrend}>
                                    {Math.abs(this.props.data.trend)}
                                    &nbsp;
                                    {
                                        this.props.data.unit == "KILOGRAMS"
                                            ? "kgs"
                                            : "lbs"
                                    }
                                    &nbsp;
                                    {i18n.t('components')['cards']['weightTracker']['lostWeight']}</Text>
                            </View>
                            : <View style={styles.statsContainer}>
                                <FaLongArrowAltUp size={20} color={cardColors.weightTracker} />
                                <Text style={styles.weightTrend}>
                                    {this.props.data.trend}
                                    &nbsp;
                                    {
                                        this.props.data.unit == "KILOGRAMS"
                                            ? "kgs"
                                            : "lbs"
                                    }
                                    &nbsp;
                                    {i18n.t('components')['cards']['weightTracker']['gainedWeight']}</Text>
                            </View>
                        : null
                }
                {
                    !this.props.client
                    && <TouchableOpacity style={[globalStyles.authPageActionButton, {
                        backgroundColor: cardColors.weightTracker,
                        marginTop: 16
                    }]} onPress={() => {
                        this.props.actionButtonFunction();
                    }}>
                        <Text style={globalStyles.authPageActionButtonText}>{i18n.t('components')['cards']['weightTracker']['redirectButton']}</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>;
    }
}
