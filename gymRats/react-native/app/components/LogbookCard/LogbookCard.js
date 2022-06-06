import React, { Component } from 'react';
import { Text, Pressable, View } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';
import { DataManager } from "../../classes/DataManager";

import i18n from 'i18n-js';

import ConfirmationBox from '../ConfirmationBox/ConfirmationBox';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

import { WEIGHT_UNITS_LABELS } from '../../../global';
import { cardColors } from '../../../assets/styles/cardColors';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './LogbookCard.styles';

export default class LogbookCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showConfirmationBox: false,
            data: null,
            showError: false,
            error: ""
        }
    }

    componentDidMount() {
        this.setState({ data: this.props.data })
        if (this.props.client) this.getClientWorkoutSession();
    }

    toggleShowConfirmationBox = (state) => {
        this.setState({ showConfirmationBox: state });
    }

    deleteCard = () => {
        ApiRequests.delete(`logbook/workout-session?date=${this.state.data.date}&month=${this.state.data.month}&year=${this.state.data.year}`, {}, true).then((response) => {
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
        return <Pressable onPress={() => {
            if (!this.state.showConfirmationBox) this.props.actionButtonFunction();
        }}><View style={globalStyles.card}>
                {
                    this.state.showConfirmationBox
                        ? <ConfirmationBox deleteCard={this.deleteCard} toggleShowConfirmationBox={this.toggleShowConfirmationBox} />
                        : null
                }
                <View style={globalStyles.cardTopbar}>
                    <FontAwesome5 name="book-open" size={25} color={cardColors.logbook} />
                    <Text style={globalStyles.cardTitle}>{i18n.t('components')['cards']['logbook']['cardTitle']}</Text>
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
                                {
                                    this.props.data.hasWorkoutTemplateName
                                        ? <Text style={styles.workoutName}>{this.props.data.workoutTemplateName}</Text>
                                        : <Text style={styles.workoutName}>{i18n.t('components')['cards']['logbook']['cardTitle']}</Text>
                                }
                                <View style={styles.exercisesContainer}>
                                    {
                                        this.props.data.exercises.map((exercise, index) =>
                                            <View key={index}>
                                                <Text style={[styles.exercise, {
                                                    fontFamily: this.props.client ? "MainBold" : "MainRegular",
                                                    fontSize: this.props.client ? 16 : 12
                                                }]}>{exercise.sets.length} {this.props.client ? (exercise.sets.length != 1 ? i18n.t('components')['sets'] : i18n.t('components')['set']) : null}x {
                                                        exercise.translations.hasOwnProperty(i18n.locale)
                                                            ? exercise.translations[i18n.locale]
                                                            : exercise.exerciseName
                                                    }
                                                </Text>
                                                {
                                                    this.props.client
                                                        ? exercise.sets.map((set, setIndex) =>
                                                            <Text style={styles.setInfo}>
                                                                {
                                                                    set.reps
                                                                        ? <>
                                                                            {set.reps} {set.reps != 1 ? i18n.t('components')['reps'] + " " : i18n.t('components')['sets'] + " "}
                                                                        </>
                                                                        : null
                                                                }
                                                                {
                                                                    set.weight && set.weight.amount
                                                                        ? <>
                                                                            {i18n.t('components')['cards']['logbook']['with']} {set.weight.amount}{WEIGHT_UNITS_LABELS[set.weight.unit]}&nbsp;
                                                                        </>
                                                                        : null
                                                                }
                                                                {
                                                                    set.duration
                                                                        ? <>
                                                                            {i18n.t('components')['cards']['logbook']['for']} {set.duration} {i18n.t('components')['cards']['logbook']['seconds']}&nbsp;
                                                                        </>
                                                                        : null
                                                                }
                                                            </Text>
                                                        )
                                                        : null
                                                }
                                            </View>
                                        )
                                    }
                                </View>
                                {
                                    !this.props.client
                                        ? <Pressable onPress={() => {
                                            this.props.actionButtonFunction();
                                        }}
                                            style={({ pressed }) => [
                                                {
                                                    backgroundColor: cardColors.logbook,
                                                    marginTop: 16
                                                },
                                                globalStyles.authPageActionButton
                                            ]}>
                                            <Text style={globalStyles.authPageActionButtonText}>{i18n.t('components')['cards']['logbook']['redirectButton']}</Text>
                                        </Pressable>
                                        : null
                                }
                            </>
                    }
                </View>
            </View>
        </Pressable>;
    }
}
