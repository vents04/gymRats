import React, { Component } from 'react';

import { ScrollView, Text, TouchableHighlight, TouchableNativeFeedback, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BottomSheet from "react-native-gesture-bottom-sheet";

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import LogoBar from '../../components/LogoBar/LogoBar';
import WeightTrackerCard from '../../components/WeightTrackerCard/WeightTrackerCard';
import CaloriesIntakeCard from '../../components/CaloriesIntakeCard/CaloriesIntakeCard';
import LogbookCard from '../../components/LogbookCard/LogbookCard';

import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ACTIVE_CARDS } from '../../../global';
import { cardColors } from '../../../assets/styles/cardColors';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Calendar.styles';

export default class Calendar extends Component {

    constructor(props) {
        super(props);

        this.bottomSheet = React.createRef();

        this.state = {
            dates: [],
            doNotShow: [],
            selectedDate: null,
            timezoneOffset: null,
        }

        this.focusListener;
    }

    onFocusFunction = () => {
        console.log(this.props.route)
        if (this.props && this.props.route && this.props.route.params && this.props.route.params.reloadDate) {
            this.setState({
                selectedDate: this.props.route.params.date,
                timezoneOffset: new Date(this.props.route.params.date).getTimezoneOffset()
            }, () => {
                this.getDate(this.state.selectedDate, this.state.timezoneOffset);
            })
        } else {
            this.getCurrentDate();
        }
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
    }

    reloadDateAfterDelete = (date) => {
        this.setState({
            selectedDate: date,
            timezoneOffset: new Date(date).getTimezoneOffset()
        }, () => {
            this.getDate(this.state.selectedDate, this.state.timezoneOffset);
        })
    }

    getDate = (selectedDate) => {
        ApiRequests.get(`date?date=${selectedDate.getDate()}&month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}`, false, true).then((response) => {
            const dates = [...this.state.dates];
            for (let index = 0; index < dates.length; index++) {
                if (dates[index].date.getTime() == selectedDate.getTime()) {
                    dates.splice(index, 1);
                }
            }
            dates.push({ date: selectedDate, cards: response.data.cards });
            this.setState({ dates: dates, doNotShow: response.data.doNotShow });
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
        return <View style={globalStyles.safeAreaView}>
            <View style={globalStyles.pageContainer}>
                <LogoBar />
                {
                    this.state.selectedDate
                        ? <View style={[globalStyles.fillEmptySpace, { flexShrink: 1 }]}>
                            <View style={styles.calendarControllersContainer}>
                                <TouchableWithoutFeedback onPress={() => { this.incrementDate(-1) }}>
                                    <View style={styles.calendarController}>
                                        <Entypo name="chevron-left" size={14} color="#999" style={{ marginRight: 5 }} />
                                        <Text style={styles.calendarControllerText}>{i18n.t('screens')['calendar']['calendarControllerBack']}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <Text style={styles.calendarCurrentDate}>
                                    {this.state.selectedDate.getDate()}
                                    .
                                    {
                                        this.state.selectedDate.getMonth() + 1 < 10
                                            ? `0${(this.state.selectedDate.getMonth() + 1)}`
                                            : (this.state.selectedDate.getMonth() + 1)
                                    }
                                </Text>
                                <TouchableWithoutFeedback onPress={() => { this.incrementDate(1) }}>
                                    <View style={[styles.calendarController, { justifyContent: 'flex-end' }]}>
                                        <Text style={styles.calendarControllerText}>{i18n.t('screens')['calendar']['calendarControllerNext']}</Text>
                                        <Entypo name="chevron-right" style={{ marginLeft: 5 }} size={14} color="#999" />
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View>
                                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                                    marginBottom: 16,
                                }]} onPress={() => {
                                    this.bottomSheet.current.show()
                                }}>
                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['calendar']['addData']}</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                                {
                                    this.state.dates.map((date) =>
                                        date.date.getTime() == this.state.selectedDate.getTime()
                                            ? date.cards.length > 0
                                                ? date.cards.map((card, index) =>
                                                    card.card == "dailyWeights"
                                                        ? <WeightTrackerCard key={"_" + index} actionButtonFunction={() => {
                                                            this.props.navigation.navigate("WeightTracker", {
                                                                date: this.state.selectedDate,
                                                                timezoneOffset: this.state.timezoneOffset,
                                                                weight: card.data.weight,
                                                                weightUnit: card.data.unit,
                                                                _id: card.data._id
                                                            });
                                                        }} data={card.data} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} {...this.props} />
                                                        : card.card == 'workoutSessions'
                                                            ? <LogbookCard key={"_" + index} actionButtonFunction={() => {
                                                                this.props.navigation.navigate("Logbook", {
                                                                    date: this.state.selectedDate,
                                                                    timezoneOffset: this.state.timezoneOffset,
                                                                    data: card.data
                                                                });
                                                            }} data={card.data} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} {...this.props} />
                                                            : card.card == 'caloriesCounterDays'
                                                                ? <CaloriesIntakeCard key={"_" + index} actionButtonFunction={() => {
                                                                    this.props.navigation.navigate("CaloriesIntake", {
                                                                        date: this.state.selectedDate,
                                                                        timezoneOffset: this.state.timezoneOffset,
                                                                        data: card.data
                                                                    });
                                                                }} data={card.data} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} {...this.props} />
                                                                : null
                                                )
                                                : <Text key={date} style={globalStyles.notation}>{i18n.t('screens')['calendar']['noData']}</Text>
                                            : null
                                    )
                                }
                            </ScrollView>
                        </View>
                        : null
                }
            </View>
            <BottomSheet ref={this.bottomSheet} height={400} draggable={false}>
                <View style={styles.bottomSheetTopbar}>
                    <Text style={styles.bottomSheetTitle}>{i18n.t('screens')['calendar']['bottomSheetTitle']}</Text>
                    <TouchableOpacity onPress={() => {
                        this.bottomSheet.current.close();
                    }}>
                        <Ionicons name="close" size={30} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.cardsContainer}>
                    {
                        this.state.doNotShow.length == Object.keys(ACTIVE_CARDS).length
                            ? <Text style={globalStyles.notation}>{i18n.t('screens')['calendar']['bottomSheetNoCards']}</Text>
                            : null
                    }
                    {
                        !this.state.doNotShow.includes("dailyWeights")
                            ? <TouchableOpacity onPress={() => {
                                this.bottomSheet.current.close();
                                this.props.navigation.navigate("WeightTracker", {
                                    date: this.state.selectedDate,
                                    timezoneOffset: this.state.timezoneOffset
                                });
                            }}>
                                <View style={[styles.card, {
                                    backgroundColor: cardColors.weightTracker
                                }]}>
                                    <View style={styles.cardTopbar}>
                                        <FontAwesome5 name="weight" size={25} color="#fff" />
                                        <Text style={styles.cardTitle}>{i18n.t('components')['cards']['weightTracker']['cardTitle']}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            : null
                    }
                    {
                        !this.state.doNotShow.includes("workoutSessions")
                            ? <TouchableOpacity onPress={() => {
                                this.bottomSheet.current.close();
                                this.props.navigation.navigate("Logbook", {
                                    date: this.state.selectedDate,
                                    timezoneOffset: this.state.timezoneOffset
                                });
                            }}>
                                <View style={[styles.card, {
                                    backgroundColor: cardColors.logbook
                                }]}>
                                    <View style={styles.cardTopbar}>
                                        <FontAwesome5 name="book-open" size={25} color="#fff" />
                                        <Text style={styles.cardTitle}>{i18n.t('components')['cards']['logbook']['cardTitle']}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            : null
                    }
                    {
                        !this.state.doNotShow.includes("caloriesCounterDays")
                            ? <TouchableOpacity onPress={() => {
                                this.bottomSheet.current.close();
                                this.props.navigation.navigate("CaloriesIntake", {
                                    date: this.state.selectedDate,
                                    timezoneOffset: this.state.timezoneOffset
                                });
                            }}>
                                <View style={[styles.card, {
                                    backgroundColor: cardColors.caloriesIntake
                                }]}>
                                    <View style={styles.cardTopbar}>
                                        <MaterialCommunityIcons name="food-variant" size={25} color="#fff" />
                                        <Text style={styles.cardTitle}>Calories intake</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            : null
                    }
                </ScrollView>
            </BottomSheet>
        </View >;
    }
}
