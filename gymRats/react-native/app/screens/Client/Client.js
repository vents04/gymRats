import React, { Component } from 'react'
import { ScrollView, Text, View, Image, TouchableWithoutFeedback, Pressable, BackHandler } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import WeightTrackerCard from '../../components/WeightTrackerCard/WeightTrackerCard';
import CaloriesIntakeCard from '../../components/CaloriesIntakeCard/CaloriesIntakeCard';
import LogbookCard from '../../components/LogbookCard/LogbookCard';

import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Client.styles';
import GestureRecognizer, {
    swipeDirections,
} from 'react-native-swipe-gestures';
export default class Client extends Component {

    constructor(props) {
        super(props);

        this.state = {
            client: null,
            from: null,
            dates: [],
            selectedDate: null,
            timezoneOffset: null,
            showError: false,
            error: "",
            showCalendarPicker: false
        }

        this.focusListener;
    }

    backAction = () => {
        this.props.navigation.navigate("Coaching", { tab: "myClients" })
        return true;
    }

    onFocusFunction = () => {
        this.setState({ client: this.props.route.params.client.clientInstance, from: this.props.route.params.client.from }, () => {
            this.getCurrentDate();
        });
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
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
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
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
        const timezoneOffset = currentDate.getTimezoneOffset();
        this.setState({ selectedDate: currentDate, timezoneOffset });
        this.getDate(currentDate, this.state.timezoneOffset);
    }

    incrementDate = (amount) => {
        const incrementedDate = new Date(this.state.selectedDate);
        incrementedDate.setDate(incrementedDate.getDate() + amount);
        this.setState({ selectedDate: incrementedDate });
        this.getDate(incrementedDate, this.state.timezoneOffset);
    }

    render() {
        return (
            <GestureRecognizer style={globalStyles.safeAreaView}
                onSwipe={(gestureName, gestureState) => {
                    const { SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
                    switch (gestureName) {
                        case SWIPE_LEFT:
                            this.incrementDate(1);
                            break;
                        case SWIPE_RIGHT:
                            this.incrementDate(-1);
                            break;
                        default:
                            break;
                    }
                }}>
                <View style={globalStyles.pageContainer}>
                    {
                        this.state.showCalendarPicker
                            ? <DateTimePicker
                                testID="dateTimePicker"
                                value={new Date(this.state.selectedDate)}
                                mode={"date"}
                                onChange={(event, selectedDate) => {
                                    this.setState({ showCalendarPicker: false }, () => {
                                        this.setState({ selectedDate: new Date(selectedDate) });
                                        this.getDate(new Date(selectedDate));
                                    })
                                }}
                            />
                            : null
                    }
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
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t("screens")['client']['title']}</Text>
                    </View>
                    <View style={globalStyles.topbarIconContainer}>
                        <Pressable hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.setState({ selectedDate: new Date() }, () => {
                                this.getDate(this.state.selectedDate);
                            });
                        }} style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                                marginLeft: 12
                            }
                        ]}>
                            {
                                this.state.selectedDate
                                    && new Date().toDateString() != new Date(this.state.selectedDate).toDateString()
                                    ? <View style={{
                                        backgroundColor: "#1f6cb0",
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 4,
                                        marginLeft: 8,
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        {
                                            new Date().getTime() > new Date(this.state.selectedDate).getTime()
                                                ? <Ionicons name="ios-arrow-forward-circle" size={14} color="white" />
                                                : <Ionicons name="ios-arrow-back-circle" size={14} color="white" />
                                        }
                                        <Text style={{
                                            fontFamily: "MainMedium",
                                            fontSize: 12,
                                            color: "white",
                                            marginLeft: 6
                                        }}>Today</Text>
                                    </View>
                                    : null
                            }
                        </Pressable>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={[globalStyles.errorBox, {
                                marginTop: 16
                            }]}>{this.state.error}</Text>
                            : null
                    }
                    {
                        this.state.client
                            ? <View style={styles.clientContainer}>
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
                                            ? <Text style={[globalStyles.notation, {
                                                fontSize: 12,
                                            }]}>{i18n.t("screens")['client']['clientSince']} {new Date(this.state.from).toLocaleDateString()}</Text>
                                            : null
                                    }
                                </View>
                            </View>
                            : null
                    }
                    {
                        this.state.selectedDate
                            ? <View style={globalStyles.fillEmptySpace}>
                                <View style={styles.calendarControllersContainer}>
                                    <Pressable style={styles.calendarController} onPress={() => { this.incrementDate(-1) }}>
                                        <Entypo name="chevron-left" size={14} color="#999" style={{ marginRight: 5 }} />
                                        <Text style={styles.calendarControllerText}>{i18n.t("screens")['client']['previous']}</Text>
                                    </Pressable>
                                    <Pressable hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                        this.setState({ showCalendarPicker: true })
                                    }}>
                                        <Text style={styles.calendarCurrentDate}>
                                            {this.state.selectedDate.getDate()}
                                            .
                                            {
                                                this.state.selectedDate.getMonth() + 1 < 10
                                                    ? `0${(this.state.selectedDate.getMonth() + 1)}`
                                                    : (this.state.selectedDate.getMonth() + 1)
                                            }
                                        </Text>
                                    </Pressable>
                                    <Pressable style={[styles.calendarController, { justifyContent: 'flex-end' }]} onPress={() => { this.incrementDate(1) }}>
                                        <Text style={styles.calendarControllerText}>{i18n.t("screens")['client']['next']}</Text>
                                        <Entypo name="chevron-right" style={{ marginLeft: 5 }} size={14} color="#999" />
                                    </Pressable>
                                </View>
                                <ScrollView contentContainerStyle={{
                                    ...globalStyles.fillEmptySpace,
                                    paddingBottom: 300
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
                                                            }} client={this.state.client} key={card.data._id} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} />
                                                            : card.card == 'workoutSessions'
                                                                ? <LogbookCard actionButtonFunction={() => {
                                                                    this.props.navigation.navigate("Logbook", {
                                                                        date: this.state.selectedDate,
                                                                        timezoneOffset: this.state.timezoneOffset,
                                                                        data: card.data
                                                                    });
                                                                }} client={this.state.client} key={card.data._id} data={card.data} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} />
                                                                : card.card == 'caloriesCounterDays'
                                                                    ? <CaloriesIntakeCard actionButtonFunction={() => {
                                                                        this.props.navigation.navigate("CaloriesIntake", {
                                                                            date: this.state.selectedDate,
                                                                            timezoneOffset: this.state.timezoneOffset,
                                                                            data: card.data,
                                                                        });
                                                                    }} client={this.state.client} key={card.data._id} data={card.data} date={this.state.selectedDate} {...this.props} />
                                                                    : null
                                                    )
                                                    : <Text key={date} style={[globalStyles.notation, {
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
            </GestureRecognizer>
        )
    }
}
