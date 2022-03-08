import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BsJournalBookmarkFill } from 'react-icons/bs';
import { AiFillDelete } from 'react-icons/ai';
import ConfirmationBox from '../ConfirmationBox/ConfirmationBox';
import ApiRequests from '../../classes/ApiRequests';

const { cardColors } = require('../../../assets/styles/cardColors');
const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./LogbookCard.styles');

export default class LogbookCard extends Component {

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
        const date = new Date(this.state.data.year, this.state.data.month - 1, this.state.data.date);
        ApiRequests.delete(`logbook/workout-session/${date}/${new Date().getTimezoneOffset()}`, {}, true).then((response) => {
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
                <BsJournalBookmarkFill size={25} color={cardColors.logbook} />
                <Text style={globalStyles.cardTitle}>Workout</Text>
                <View style={globalStyles.cardTopbarIcon}>
                    <AiFillDelete size={25} color="#ddd" onClick={() => {
                        this.setState({ showConfirmationBox: true })
                    }} />
                </View>
            </View>
            <View>
                {
                    this.props.data.hasWorkoutTemplateName
                        ? <Text style={styles.workoutName}>{this.props.data.workoutTemplateName}</Text>
                        : <Text style={styles.workoutName}>Workout</Text>
                }
                <View style={styles.exercisesContainer}>
                    {
                        this.props.data.exercises.map((exercise) =>
                            <Text style={styles.exercise}>{exercise.sets.length} x {exercise.exerciseName}</Text>
                        )
                    }
                </View>
                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                    backgroundColor: cardColors.logbook,
                    marginTop: 16
                }]} onPress={() => {
                    this.props.actionButtonFunction();
                }}>
                    <Text style={globalStyles.authPageActionButtonText}>Info and progress</Text>
                </TouchableOpacity>
            </View>
        </View>;
    }
}
