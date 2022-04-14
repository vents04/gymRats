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
const styles = require('./CaloriesIntakeCard.styles');

export default class CaloriesIntakeCard extends Component {

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
        ApiRequests.delete(`calories-counter/${this.state.data._id}`).then((response) => {
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
                <Text style={globalStyles.cardTitle}>Calories intake</Text>
                <View style={globalStyles.cardTopbarIcon}>
                    <AiFillDelete size={25} color="#ddd" onClick={() => {
                        this.setState({ showConfirmationBox: true })
                    }} />
                </View>
            </View>
            <View>
                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                    backgroundColor: cardColors.weightTracker,
                    marginTop: 16
                }]} onPress={() => {
                    this.props.actionButtonFunction();
                }}>
                    <Text style={globalStyles.authPageActionButtonText}>Update</Text>
                </TouchableOpacity>
            </View>
        </View>;
    }
}
