import React, { Component } from 'react';

import { DataManager } from "../../classes/DataManager";

import { Alert, BackHandler, Dimensions, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TouchableHighlight, TouchableNativeFeedback, TouchableWithoutFeedback, View } from 'react-native';
import BottomSheet from "react-native-gesture-bottom-sheet";
import DateTimePicker from '@react-native-community/datetimepicker';
import GestureRecognizer, {
    swipeDirections,
} from 'react-native-swipe-gestures';
import { default as AsyncStorage } from '@react-native-async-storage/async-storage';

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
            calendarActionButtonBucket: null,
            iosCurrentSelectedDate: null
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

    checkForCoachProfileLink = async () => {
        const coachProfileId = await AsyncStorage.getItem('@gymRats:coachProfileId');
        if (coachProfileId) {
            ApiRequests.get("coaching/coach/" + coachProfileId)
                .then(response => {
                    this.props.navigation.navigate('CoachPage', { coach: response.data.coach });
                }).catch((error) => {
                    console.log(error);
                }).finally(() => {
                    AsyncStorage.removeItem('@gymRats:coachProfileId');
                })
        }
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
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.checkForCoachProfileLink();
        })
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
        console.log(incrementedDate);
    }

    render() {
        return <GestureRecognizer style={[globalStyles.safeAreaView, { paddingTop: 32 }]}
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
                    this.state.showCalendarPicker && Platform.OS == "android"
                        ? <DateTimePicker
                            testID="dateTimePicker"
                            value={new Date(this.state.selectedDate)}
                            mode={"date"}
                            onChange={(event, selectedDate) => {
                                this.setState({ showCalendarPicker: false }, () => {
                                    if(selectedDate && new Date(selectedDate)) {
                                        console.log(selectedDate, new Date(selectedDate));
                                        this.setDate(new Date(selectedDate));
                                    }
                                })
                            }}
                        />
                        : this.state.showCalendarPicker && Platform.OS == "ios"
                            ? <Modal
                                animationType="slide"
                                transparent={true}
                                visible={true}>
                                <View style={globalStyles.centeredView}>
                                    <View style={globalStyles.modalView}>
                                        <Text style={globalStyles.modalTitle}>Select a date</Text>
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={new Date(this.state.iosCurrentSelectedDate)}
                                            mode={"date"}
                                            display={"spinner"}
                                            onChange={(event, selectedDate) => {
                                                if(selectedDate && new Date(selectedDate)) {
                                                    this.setState({ iosCurrentSelectedDate: new Date(selectedDate) })
                                                }
                                            }}
                                            style={{
                                                width: "100%",
                                            }}
                                        />
                                        <View style={globalStyles.modalActionsContainer}>
                                            <Pressable onPress={() => {
                                                this.setState({ showCalendarPicker: false })
                                            }} style={({ pressed }) => [
                                                globalStyles.confirmationBoxOption,
                                                {
                                                    opacity: pressed ? 0.1 : 1,
                                                }
                                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                                                <Text style={globalStyles.modalActionTitle}>{i18n.t('components')['confirmationBox']['denial']}</Text>
                                            </Pressable>
                                            <Pressable style={({ pressed }) => [
                                                globalStyles.confirmationBoxOption,
                                                {
                                                    opacity: pressed ? 0.1 : 1,
                                                }
                                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }}
                                                onPress={() => {
                                                    this.setState({ showCalendarPicker: false }, () => {
                                                        if (this.state.iosCurrentSelectedDate) {
                                                            this.setState({ selectedDate: this.state.iosCurrentSelectedDate });
                                                        }
                                                    })
                                                }}>
                                                <Text style={[globalStyles.modalActionTitle, {
                                                    color: "#1f6cb0"
                                                }]}>{i18n.t('components')['confirmationBox']['affirmation']}</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                            : null
                }
                <LogoBar />
                <View style={globalStyles.topbarIconContainer}>
                    <Pressable hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                        this.setDate(new Date())
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
                                <TouchableWithoutFeedback onPress={() => { this.setState({ showCalendarPicker: true, iosCurrentSelectedDate: new Date(this.state.selectedDate || new Date()) }) }}>
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
                            {/* {
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
                            } */}
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
                                    !this.state.doNotShow.includes("dailyWeights")
                                    ? <Pressable style={({ pressed }) => [
                                        {
                                            opacity: pressed ? 0.1 : 1,
                                        }
                                        ]} onPress={() => {
                                            this.bottomSheet.current.close();
                                            this.props.navigation.navigate("WeightTracker", {
                                                date: this.state.selectedDate,
                                                timezoneOffset: this.state.timezoneOffset
                                            });
                                        }}><View style={styles.addDataItemContainer}>
                                            <View style={styles.addDataItemLeft}>
                                                <FontAwesome5 name="weight" size={25} color={cardColors.weightTracker} />
                                                <View style={styles.addDataItemLabels}>
                                                    <Text style={styles.addDataItemTitle}>{i18n.t('components')['cards']['weightTracker']['cardTitle']}</Text>
                                                    <Text style={styles.addDataDescription}>Track your daily weight changes</Text>
                                                </View>
                                            </View>
                                            <Ionicons name="add-circle-sharp" size={24} color="#262626" />
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
                                        }}><View style={styles.addDataItemContainer}>
                                            <View style={styles.addDataItemLeft}>
                                                <FontAwesome5 name="book-open" size={25} color={cardColors.logbook} />
                                                <View style={styles.addDataItemLabels}>
                                                    <Text style={styles.addDataItemTitle}>{i18n.t('components')['cards']['logbook']['cardTitle']}</Text>
                                                    <Text style={styles.addDataDescription}>Track your workouts</Text>
                                                </View>
                                            </View>
                                            <Ionicons name="add-circle-sharp" size={24} color="#262626" />
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
                                        }}><View style={styles.addDataItemContainer}>
                                            <View style={styles.addDataItemLeft}>
                                                <MaterialCommunityIcons name="food-variant" size={25} color={cardColors.caloriesIntake} />
                                                <View style={styles.addDataItemLabels}>
                                                    <Text style={styles.addDataItemTitle}>{i18n.t('components')['cards']['caloriesIntake']['cardTitle']}</Text>
                                                    <Text style={styles.addDataDescription}>Track your meals throughout the day</Text>
                                                </View>
                                            </View>
                                            <Ionicons name="add-circle-sharp" size={24} color="#262626" />
                                        </View> 
                                    </Pressable>
                                    : null
                                }
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
                                        : null
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
        </GestureRecognizer>;
    }
}
