import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BsJournalBookmarkFill } from 'react-icons/bs';
import { AiFillDelete } from 'react-icons/ai';
import ConfirmationBox from '../ConfirmationBox/ConfirmationBox';
import ApiRequests from '../../classes/ApiRequests';
import i18n from 'i18n-js';

const { cardColors } = require('../../../assets/styles/cardColors');
const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./LogbookCard.styles');

export default class LogbookCard extends Component {

    state = {
        showConfirmationBox: false,
        data: null
    }

    WEIGHT_UNITS_LABELS = {
        KILOGRAMS: "kgs",
        POUNDS: "lbs"
    }

    componentDidMount() {
        this.setState({ data: this.props.data })
        if (this.props.client) this.getClientWorkoutSession();
        setTimeout(() => {
            console.log(this.state);
        }, 2000)
    }

    toggleShowConfirmationBox = (state) => {
        this.setState({ showConfirmationBox: state });
    }

    deleteCard = () => {
        ApiRequests.delete(`logbook/workout-session?date=${this.state.data.date}&month=${this.state.data.month}&year=${this.state.data.year}`, {}, true).then((response) => {
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

    getClientWorkoutSession = () => {
        ApiRequests.get(`logbook/workout-session?date=${this.props.date.getDate()}&month=${this.props.date.getMonth() + 1}&year=${this.props.date.getFullYear()}&clientId=${this.props.client._id}`, {}, true).then((response) => {
            this.setState({ session: response.data.session })
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
                <BsJournalBookmarkFill size={25} color={cardColors.logbook} />
                <Text style={globalStyles.cardTitle}>{i18n.t('components')['cards']['logbook']['cardTitle']}</Text>
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
                {
                    this.props.data.hasWorkoutTemplateName
                        ? <Text style={styles.workoutName}>{this.props.data.workoutTemplateName}</Text>
                        : <Text style={styles.workoutName}>{i18n.t('components')['cards']['logbook']['cardTitle']}</Text>
                }
                <View style={styles.exercisesContainer}>
                    {
                        this.props.data.exercises.map((exercise, index) =>
                            <>
                                <Text key={index} style={[styles.exercise, {
                                    fontFamily: this.props.client ? "SpartanBold" : "SpartanRegular",
                                    fontSize: this.props.client ? 16 : 12
                                }]}>{exercise.sets.length} {this.props.client && (exercise.sets.length != 1 ? "sets " : "set ")}x {
                                        exercise.translations.hasOwnProperty(i18n.locale)
                                            ? exercise.translations[i18n.locale]
                                            : exercise.exerciseName
                                    }
                                </Text>
                                {
                                    this.props.client
                                    && exercise.sets.map(set =>
                                        <Text style={styles.setInfo}>
                                            {
                                                set.reps
                                                && <>
                                                    {set.reps} {set.reps != 1 ? "reps " : "rep "}
                                                </>
                                            }
                                            {
                                                set.weight && set.weight.amount
                                                && <>
                                                    with {set.weight.amount}{this.WEIGHT_UNITS_LABELS[set.weight.unit]}&nbsp;
                                                </>
                                            }
                                            {
                                                set.duration
                                                && <>
                                                    for {set.duration} seconds&nbsp;
                                                </>
                                            }
                                        </Text>
                                    )
                                }
                            </>
                        )
                    }
                </View>
                {
                    !this.props.client
                    && <TouchableOpacity style={[globalStyles.authPageActionButton, {
                        backgroundColor: cardColors.logbook,
                        marginTop: 16
                    }]} onPress={() => {
                        this.props.actionButtonFunction();
                    }}>
                        <Text style={globalStyles.authPageActionButtonText}>{i18n.t('components')['cards']['logbook']['redirectButton']}</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>;
    }
}
