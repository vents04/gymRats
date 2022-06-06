import React, { Component } from 'react';

import { DataManager } from "../../classes/DataManager";

import { BackHandler, Dimensions, Pressable, RefreshControl, ScrollView, Text, TouchableHighlight, TouchableNativeFeedback, TouchableWithoutFeedback, View } from 'react-native';
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
import { ABTesting, campaigns } from '../../classes/ABTesting';

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
            calendarActionButtonBucket: null
        }

        this.focusListener;
    }

    getCalendarActionButtonBucket = async () => {
        let calendarActionButtonBucket = campaigns.calendarActionButton[1]
        ABTesting.getBucketByCampaign('calendarActionButton').then(bucket => {
            calendarActionButtonBucket = bucket;
        }).finally(() => {
            this.setState({ calendarActionButtonBucket });
        });
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

    closeBottomSheet = () => {
        this.bottomSheet.current.close();
        return true;
    }

    componentDidMount() {
        this.mounted = true;
        if (this.state.selectedDate && !this.subscription) {
            this.subscription = DataManager.subscribeForDateCards(this.state.selectedDate, this.onData, this.onError);
        }
        this.getCalendarActionButtonBucket();
        this.backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            this.closeBottomSheet
        );
    }

    componentWillUnmount() {
        this.mounted = false;
        if (this.subscription) {
            DataManager.unsubscribeForDateCards(this.subscription);
            this.subscription = null;
        }
        this.backHandler = BackHandler.removeEventListener(
            "hardwareBackPress",
            this.closeBottomSheet
        );
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
        return <View style={globalStyles.safeAreaView}
            onTouchStart={e => this.touchX = e.nativeEvent.pageX}
            onTouchEnd={e => {
                if (this.touchX - e.nativeEvent.pageX > 20)
                    this.incrementDate(1);
                else if (e.nativeEvent.pageX - this.touchX > 20)
                    this.incrementDate(-1)
            }}>
            <View style={globalStyles.pageContainer}>
                {
                    this.state.showCalendarPicker
                        ? <DateTimePicker
                            testID="dateTimePicker"
                            value={new Date(this.state.selectedDate)}
                            mode={"date"}
                            onChange={(event, selectedDate) => {
                                this.setDate(new Date(selectedDate));
                                this.setState({ showCalendarPicker: false })
                            }}
                        />
                        : null
                }
                <LogoBar />
                <View style={globalStyles.topbarIconContainer}>
                    <Pressable onPress={() => {
                        this.props.navigation.navigate("Suggestions")
                    }} style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.1 : 1,
                        }
                    ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                        <FontAwesome5 name="lightbulb" size={24} color={"#1f6cb0"} />
                    </Pressable>
                </View>
                {
                    this.state.selectedDate
                        ? <View style={[globalStyles.fillEmptySpace, { flexShrink: 1 }]}>
                            <View style={styles.calendarControllersContainer}>
                                <Pressable style={({ pressed }) => [
                                    styles.calendarController,
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                        paddingVertical: 8
                                    }
                                ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }}
                                    onPress={() => { this.incrementDate(-1) }}>
                                    <Entypo name="chevron-left" size={14} color="#999" style={{ marginRight: 5 }} />
                                    <Text style={styles.calendarControllerText}>{i18n.t('screens')['calendar']['calendarControllerBack']}</Text>
                                </Pressable>
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
                                <Pressable style={({ pressed }) => [
                                    styles.calendarController,
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                        justifyContent: 'flex-end',
                                        paddingVertical: 8
                                    }
                                ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }}
                                    onPress={() => { this.incrementDate(1) }}>
                                    <Text style={styles.calendarControllerText}>{i18n.t('screens')['calendar']['calendarControllerNext']}</Text>
                                    <Entypo name="chevron-right" style={{ marginLeft: 5 }} size={14} color="#999" />
                                </Pressable>
                            </View>
                            {
                                this.state.calendarActionButtonBucket
                                    ? this.state.calendarActionButtonBucket == campaigns.calendarActionButton[1]
                                        ? <View>
                                            <Pressable style={({ pressed }) => [
                                                globalStyles.authPageActionButton,
                                                {
                                                    opacity: pressed ? 0.1 : 1,
                                                    marginBottom: 16
                                                }
                                            ]} onPress={() => {
                                                this.bottomSheet.current.show()
                                            }}>
                                                <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['calendar']['addData']}</Text>
                                            </Pressable>
                                        </View>
                                        : this.state.calendarActionButtonBucket == campaigns.calendarActionButton[0]
                                            ? <View style={{ marginBottom: this.state.doNotShow.length == 3 ? 0 : 16 }}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                }}>
                                                    {
                                                        !this.state.doNotShow.includes("dailyWeights")
                                                            ? <Pressable style={({ pressed }) => [
                                                                {
                                                                    opacity: pressed ? 0.1 : 1,
                                                                    flex: 1,
                                                                    display: "flex",
                                                                    flexDirection: "row",
                                                                    justifyContent: "center"
                                                                }
                                                            ]} onPress={() => {
                                                                this.props.navigation.navigate("WeightTracker", {
                                                                    date: this.state.selectedDate,
                                                                    timezoneOffset: this.state.timezoneOffset
                                                                });
                                                            }}>
                                                                <View style={{
                                                                    ...globalStyles.authPageActionButton,
                                                                    width: "95%",
                                                                    display: "flex",
                                                                    flexDirection: "row",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    backgroundColor: cardColors.weightTracker
                                                                }}>
                                                                    <FontAwesome5 name="weight" size={18} color="#fff" />
                                                                </View>
                                                            </Pressable>
                                                            : null
                                                    }
                                                    {
                                                        !this.state.doNotShow.includes("workoutSessions")
                                                            ? <Pressable style={({ pressed }) => [
                                                                {
                                                                    opacity: pressed ? 0.1 : 1,
                                                                    flex: 1,
                                                                    display: "flex",
                                                                    flexDirection: "row",
                                                                    justifyContent: "center",
                                                                }
                                                            ]} onPress={() => {
                                                                this.props.navigation.navigate("Logbook", {
                                                                    date: this.state.selectedDate,
                                                                    timezoneOffset: this.state.timezoneOffset
                                                                });
                                                            }}>
                                                                <View style={{
                                                                    ...globalStyles.authPageActionButton,
                                                                    width: "95%",
                                                                    display: "flex",
                                                                    flexDirection: "row",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    backgroundColor: cardColors.logbook
                                                                }}>
                                                                    <FontAwesome5 name="book-open" size={18} color="#fff" />
                                                                </View>
                                                            </Pressable>
                                                            : null
                                                    }
                                                    {
                                                        !this.state.doNotShow.includes("caloriesCounterDays")
                                                            ? <Pressable style={({ pressed }) => [
                                                                {
                                                                    opacity: pressed ? 0.1 : 1,
                                                                    flex: 1,
                                                                    display: "flex",
                                                                    flexDirection: "row",
                                                                    justifyContent: "center"
                                                                }
                                                            ]} onPress={() => {
                                                                this.props.navigation.navigate("CaloriesIntake", {
                                                                    date: this.state.selectedDate,
                                                                    timezoneOffset: this.state.timezoneOffset
                                                                });
                                                            }}>
                                                                <View style={{
                                                                    ...globalStyles.authPageActionButton,
                                                                    width: "95%",
                                                                    display: "flex",
                                                                    flexDirection: "row",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    backgroundColor: cardColors.caloriesIntake
                                                                }}>
                                                                    <MaterialCommunityIcons name="food-variant" size={18} color="#fff" />
                                                                </View>
                                                            </Pressable>
                                                            : null
                                                    }
                                                </View>
                                            </View>
                                            : null
                                    : null
                            }
                            <ScrollView
                                overScrollMode={"never"}
                                fadingEdgeLength={150}
                                showsVerticalScrollIndicator={false}
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
                    <Pressable style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.1 : 1,
                        }
                    ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                        this.bottomSheet.current.close();
                    }}>
                        <Ionicons name="close" size={30} />
                    </Pressable>
                </View>
                <ScrollView style={styles.cardsContainer}>
                    {
                        this.state.doNotShow.length == Object.keys(ACTIVE_CARDS).length
                            ? <Text style={globalStyles.notation}>{i18n.t('screens')['calendar']['bottomSheetNoCards']}</Text>
                            : null
                    }
                    {
                        !this.state.doNotShow.includes("dailyWeights")
                            ? <Pressable style={({ pressed }) => [
                                {
                                    opacity: pressed ? 0.1 : 1,
                                }
                            ]} onPress={() => {
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
                            </Pressable>
                            : null
                    }
                    {
                        !this.state.doNotShow.includes("workoutSessions")
                            ? <Pressable style={({ pressed }) => [
                                {
                                    opacity: pressed ? 0.1 : 1,
                                }
                            ]} onPress={() => {
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
                            </Pressable>
                            : null
                    }
                    {
                        !this.state.doNotShow.includes("caloriesCounterDays")
                            ? <Pressable style={({ pressed }) => [
                                {
                                    opacity: pressed ? 0.1 : 1,
                                }
                            ]} onPress={() => {
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
                                        <Text style={styles.cardTitle}>{i18n.t('components')['cards']['caloriesIntake']['cardTitle']}</Text>
                                    </View>
                                </View>
                            </Pressable>
                            : null
                    }
                </ScrollView>
            </BottomSheet>
        </View >;
    }
}
