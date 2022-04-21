import React, { Component } from 'react'
import { Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import { BiArrowBack } from 'react-icons/bi';
import ApiRequests from '../../classes/ApiRequests';
import { HTTP_STATUS_CODES } from '../../../global';
import i18n from 'i18n-js';
import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from 'react-icons/io';
import WeightTrackerCard from '../../components/WeightTrackerCard/WeightTrackerCard';
import CaloriesIntakeCard from '../../components/CaloriesIntakeCard/CaloriesIntakeCard';
import LogbookCard from '../../components/LogbookCard/LogbookCard';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Client.styles');

export default class Client extends Component {

    state = {
        client: null,
        from: null,
        dates: [],
        selectedDate: null,
        timezoneOffset: null,
        showError: false,
        error: ""
    }

    focusListener;

    onFocusFunction = () => {
        this.setState({ client: this.props.route.params.client.clientInstance, from: this.props.route.params.client.from }, () => {
            this.getCurrentDate();
        });
    }

    async componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
    }

    componentWillUnmount() {
        if (this.focusListener) this.focusListener()
    }

    getDate = (selectedDate) => {
        ApiRequests.get(`coaching/client/${this.state.client._id}/date?date=${selectedDate.getDate()}&month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}`, false, true).then((response) => {
            const dates = [...this.state.dates];
            for (let index = 0; index < dates.length; index++) {
                if (dates[index].date.getTime() == selectedDate.getTime()) {
                    dates.splice(index, 1);
                }
            }
            dates.push({ date: selectedDate, cards: response.data.cards });
            this.setState({ dates: dates });
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

    getCurrentDate = () => {
        const currentDate = new Date();
        this.setState({ selectedDate: currentDate, timezoneOffset: new Date().getTimezoneOffset() }, () => {
            this.getDate(this.state.selectedDate, this.state.timezoneOffset);
        });
    }

    incrementDate = (amount) => {
        const incrementedDate = new Date(this.state.selectedDate);
        incrementedDate.setDate(incrementedDate.getDate() + amount);
        this.setState({ selectedDate: incrementedDate }, () => {
            this.getDate(this.state.selectedDate, this.state.timezoneOffset)
        })
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <BiArrowBack size={25} onClick={() => {
                            this.props.navigation.navigate("Coaching", { tab: "myClients" })
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Client profile</Text>
                    </View>
                    {
                        this.state.showError
                        && <Text style={[globalStyles.errorBox, {
                            marginTop: 16
                        }]}>{this.state.error}</Text>
                    }
                    {
                        this.state.client
                        && <View style={styles.clientContainer}>
                            {
                                !this.state.client.profilePicture
                                    ? <View style={styles.profilePictureContainer}>
                                        <Text style={styles.noProfilePictureText}>
                                            {this.state.client.firstName.charAt(0)}
                                            {this.state.client.lastName.charAt(0)}
                                        </Text>
                                    </View>
                                    : <Image style={styles.profilePictureContainer}
                                        source={{ uri: this.state.client.profilePicture }} />
                            }
                            <View style={styles.clientInfoContainer}>
                                <Text style={styles.names}>
                                    {this.state.client.firstName}
                                    &nbsp;
                                    {this.state.client.lastName}
                                </Text>
                                {
                                    this.state.from
                                    && <Text style={[globalStyles.notation, {
                                        fontSize: 12,
                                    }]}>Client since {new Date(this.state.from).toLocaleDateString()}</Text>
                                }
                            </View>
                        </View>
                    }
                    {
                        this.state.selectedDate
                            ? <View style={{
                                flexGrow: 1,
                                flexShrink: 1
                            }}>
                                <View style={styles.calendarControllersContainer}>
                                    <View style={styles.calendarController} onClick={() => { this.incrementDate(-1) }}>
                                        <IoIosArrowBack style={{ marginRight: 5 }} size={14} color="#999" />
                                        <Text style={styles.calendarControllerText}>Previous</Text>
                                    </View>
                                    <Text style={styles.calendarCurrentDate} onClick={() => { this.setState({ showDatePicker: true }) }}>
                                        {this.state.selectedDate.getDate()}
                                        .
                                        {
                                            this.state.selectedDate.getMonth() + 1 < 10
                                                ? `0${(this.state.selectedDate.getMonth() + 1)}`
                                                : (this.state.selectedDate.getMonth() + 1)
                                        }
                                    </Text>
                                    <View style={[styles.calendarController, { justifyContent: 'flex-end' }]} onClick={() => { this.incrementDate(1) }}>
                                        <Text style={styles.calendarControllerText}>Next</Text>
                                        <IoIosArrowForward style={{ marginLeft: 5 }} size={14} color="#999" />
                                    </View>
                                </View>
                                <ScrollView contentContainerStyle={{
                                    flexGrow: 1,
                                    flexShrink: 1
                                }}>
                                    {
                                        this.state.dates.map((date) =>
                                            date.date.getTime() == this.state.selectedDate.getTime()
                                                ? date.cards.length > 0
                                                    ? date.cards.map((card) =>
                                                        card.card == "dailyWeights"
                                                            ? <WeightTrackerCard data={card.data} actionButtonFunction={() => {
                                                                this.props.navigation.navigate("WeightTracker", {
                                                                    date: this.state.selectedDate,
                                                                    timezoneOffset: this.state.timezoneOffset,
                                                                    weight: card.data.weight,
                                                                    weightUnit: card.data.unit,
                                                                    _id: card.data._id
                                                                });
                                                            }} key={card.data._id} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} />
                                                            : card.card == 'workoutSessions'
                                                                ? <LogbookCard actionButtonFunction={() => {
                                                                    this.props.navigation.navigate("Logbook", {
                                                                        date: this.state.selectedDate,
                                                                        timezoneOffset: this.state.timezoneOffset,
                                                                        data: card.data
                                                                    });
                                                                }} data={card.data} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} />
                                                                : card.card == 'caloriesCounterDays'
                                                                    ? <CaloriesIntakeCard actionButtonFunction={() => {
                                                                        this.props.navigation.navigate("CaloriesIntake", {
                                                                            date: this.state.selectedDate,
                                                                            timezoneOffset: this.state.timezoneOffset,
                                                                            data: card.data,
                                                                        });
                                                                    }} client={this.state.client} data={card.data} date={this.state.selectedDate} {...this.props} />
                                                                    : null
                                                    )
                                                    : <Text style={[globalStyles.notation, {
                                                        marginTop: 16
                                                    }]}>{i18n.t('screens')['calendar']['noData']}</Text>
                                                : null
                                        )
                                    }
                                </ScrollView>
                            </View>
                            : null
                    }
                </View>
            </View>
        )
    }
}
