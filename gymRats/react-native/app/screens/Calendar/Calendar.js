import React, { Component } from 'react';

import { DataManager } from "../../classes/DataManager";

import { Dimensions, RefreshControl, ScrollView, Text, TouchableHighlight, TouchableNativeFeedback, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BottomSheet from "react-native-gesture-bottom-sheet";
import DateTimePicker from '@react-native-community/datetimepicker';

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
        this.subscription = null;
        this.mounted = false;

        this.state = {
            _this: this,
            cards: [],
            doNotShow: [],
            selectedDate: new Date(),
            timezoneOffset: null,
            showCalendarPicker: false,
            cardsRefreshing: false,
        }

        this.focusListener;
    }

    setDate = (date) => {
        if (!this.state.selectedDate || (this.state.selectedDate.getTime() != date.getTime())) {
            if (this.subscription) {
                DataManager.unsubscribeForDateCards(this.subscription);
                this.subscription = null;
            }
            if (this.mounted) {
                this.subscription = DataManager.subscribeForDateCards(date, this.onData, this.onError);
            }

            this.setState((state, props) => {
                if (!state.selectedDate || (state.selectedDate.getTime() !== date.getTime())) {
                    return { selectedDate: date };
                }
            });
        }
    }

    onData = (data) => {
        this.setState({ cards: data.cards, doNotShow: data.doNotShow });
    }

    onError = (error) => {
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
    }

    componentDidMount() {
        this.mounted = true;
        if (this.state.selectedDate && !this.subscription) {
            this.subscription = DataManager.subscribeForDateCards(this.state.selectedDate, this.onData, this.onError);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        if (this.subscription) {
            DataManager.unsubscribeForDateCards(this.subscription);
            this.subscription = null;
        }
    }

    reloadDateAfterDelete = (date) => {
        DataManager.onDateCardChanged(date);
    }

    incrementDate = (amount) => {
        const incrementedDate = new Date(this.state.selectedDate);
        incrementedDate.setDate(incrementedDate.getDate() + amount);
        this.setDate(incrementedDate);
    }

    render() {
        return <View style={globalStyles.safeAreaView} >
            <View style={globalStyles.pageContainer}>
                {
                    this.state.showCalendarPicker
                        ? <DateTimePicker
                            testID="dateTimePicker"
                            value={new Date(this.state.selectedDate)}
                            mode={"date"}
                            onChange={(event, selectedDate) => {
                                this.setDate(new Date(selectedDate));
                            }}
                        />
                        : null
                }
                <LogoBar />
                <View style={globalStyles.topbarIconContainer}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.navigate("Suggestions")
                    }}>
                        <FontAwesome5 name="lightbulb" size={24} color={"#1f6cb0"} />
                    </TouchableOpacity>
                </View>
                {
                    this.state.selectedDate
                        ? <View style={[globalStyles.fillEmptySpace, { flexShrink: 1 }]}>
                            <View style={styles.calendarControllersContainer}>
                                <TouchableOpacity style={[styles.calendarController, { paddingVertical: 8 }]} onPress={() => { this.incrementDate(-1) }}>
                                    <Entypo name="chevron-left" size={14} color="#999" style={{ marginRight: 5 }} />
                                    <Text style={styles.calendarControllerText}>{i18n.t('screens')['calendar']['calendarControllerBack']}</Text>
                                </TouchableOpacity>
                                <TouchableWithoutFeedback onPress={() => { this.setState({ showCalendarPicker: true }) }}>
                                    <Text style={styles.calendarCurrentDate}>
                                        {this.state.selectedDate.getDate()}
                                        .
                                        {
                                            this.state.selectedDate.getMonth() + 1 < 10
                                                ? `0${(this.state.selectedDate.getMonth() + 1)}`
                                                : (this.state.selectedDate.getMonth() + 1)
                                        }
                                    </Text>
                                </TouchableWithoutFeedback>
                                <TouchableOpacity style={[styles.calendarController, { justifyContent: 'flex-end', paddingVertical: 8 }]} onPress={() => { this.incrementDate(1) }}>
                                    <Text style={styles.calendarControllerText}>{i18n.t('screens')['calendar']['calendarControllerNext']}</Text>
                                    <Entypo name="chevron-right" style={{ marginLeft: 5 }} size={14} color="#999" />
                                </TouchableOpacity>
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
                            <ScrollView
                                contentContainerStyle={{ ...globalStyles.fillEmptySpace, paddingBottom: 25 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.cardsRefreshing}
                                        onRefresh={() => {
                                            this.setState({ cardsRefreshing: true });
                                            DataManager.onDateCardChanged(this.state.selectedDate);
                                            setTimeout(() => {
                                                this.setState({ cardsRefreshing: false });
                                            }, 1000)
                                        }}
                                    />
                                }>
                                {
                                    !this.state.cardsRefreshing
                                        ? <>
                                            {
                                                this.state.cards.length > 0
                                                    ? this.state.cards.map((card, index) =>
                                                        card.card == "dailyWeights"
                                                            ? <WeightTrackerCard key={"_" + index} actionButtonFunction={() => {
                                                                this.props.navigation.navigate("WeightTracker", {
                                                                    date: this.state.selectedDate,
                                                                    timezoneOffset: this.state.timezoneOffset,
                                                                    weight: card.data.weight,
                                                                    weightUnit: card.data.unit,
                                                                    _id: card.data._id
                                                                });
                                                            }} data={card.data} date={this.state.selectedDate} {...this.props} />
                                                            : card.card == 'workoutSessions'
                                                                ? <LogbookCard key={"_" + index} actionButtonFunction={() => {
                                                                    this.props.navigation.navigate("Logbook", {
                                                                        date: this.state.selectedDate,
                                                                        timezoneOffset: this.state.timezoneOffset,
                                                                        data: card.data
                                                                    });
                                                                }} data={card.data} date={this.state.selectedDate} {...this.props} />
                                                                : card.card == 'caloriesCounterDays'
                                                                    ? <CaloriesIntakeCard key={"_" + index} actionButtonFunction={() => {
                                                                        this.props.navigation.navigate("CaloriesIntake", {
                                                                            date: this.state.selectedDate,
                                                                            timezoneOffset: this.state.timezoneOffset,
                                                                            data: card.data
                                                                        });
                                                                    }} data={card.data} date={this.state.selectedDate} {...this.props} />
                                                                    : null
                                                    )
                                                    : <Text style={globalStyles.notation}>{i18n.t('screens')['calendar']['noData']}</Text>
                                            }
                                        </>
                                        : <Text style={globalStyles.notation}>Cards refreshing...</Text>
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
