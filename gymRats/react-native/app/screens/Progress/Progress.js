import React, { Component } from 'react'
import { Dimensions, Image, ScrollView, Text, TextInput, Pressable, View } from 'react-native';
import { WebView } from 'react-native-webview';
import DropDownPicker from 'react-native-dropdown-picker'

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

import { HTTP_STATUS_CODES, LOGBOOK_PROGRESS_NOTATIONS, PROGRESS_NOTATION } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import { cardColors } from '../../../assets/styles/cardColors';
import styles from './Progress.styles';
import LogoBar from '../../components/LogoBar/LogoBar';
import { Picker } from '@react-native-picker/picker';

const data = [
    {
        timestamp: 1625945400000,
        value: 33575.25,
    },
    {
        timestamp: 1625946300000,
        value: 33545.25,
    },
    {
        timestamp: 1625947200000,
        value: 33510.25,
    },
    {
        timestamp: 1625948100000,
        value: 33215.25,
    },
];

export default class Progress extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: "",
            showError: false,
            progress: null,
            currentExercise: null,
            exercises: [],
            exerciseDropdownOpened: false
        }

        this.focusListener;
    }


    onFocusFunction = () => {
        this.getProgress();
    }

    componentDidMount = () => {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction();
        })
    }

    getProgress = () => {
        ApiRequests.get(`progress/page`, {}, true).then((response) => {
            let exercises = [];
            if (response.data.logbookProgress && response.data.logbookProgress.length > 0) {
                for (let exercise of response.data.logbookProgress) {
                    exercises.push({ "label": exercise.exerciseInstance.title, "value": exercise.exerciseInstance._id })
                }
            }
            this.setState({ progress: response.data, exercises, currentExercise: exercises.length > 0 ? exercises[0].value : null });
        }).catch((error) => {
            console.log(error)
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
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <LogoBar />
                    <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                        {
                            this.state.progress
                                ? <>
                                    {
                                        this.state.progress.weightTrackerProgress
                                            ? <View style={styles.progressCardContainer}>
                                                <View style={styles.progressCardHeaderContainer}>
                                                    <FontAwesome5 name="weight" size={20} color={cardColors.weightTracker} />
                                                    <Text style={styles.progressCardHeader}>Weight tracker</Text>
                                                </View>
                                                <Pressable style={({ pressed }) => [
                                                    styles.progressFlagContainer,
                                                    {
                                                        opacity: pressed ? 0.1 : 1,
                                                        backgroundColor: cardColors.weightTracker
                                                    }
                                                ]} onPress={() => {
                                                }}>
                                                    <Text style={styles.progressFlag}>
                                                        {
                                                            this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_LOSS
                                                                ? "Minor weight loss"
                                                                : this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.SUFFICIENT_WEIGHT_LOSS
                                                                    ? "Efficient weight loss"
                                                                    : this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.SUFFICIENT_WEIGHT_GAIN
                                                                        ? "Efficient weight gain"
                                                                        : this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.RAPID_WEIGHT_LOSS
                                                                            ? "Too rapid weight loss"
                                                                            : this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.RAPID_WEIGHT_GAIN
                                                                                ? "Too rapid weight gain"
                                                                                : this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_GAIN
                                                                                    ? "Minor weight gain"
                                                                                    : null

                                                        }
                                                    </Text>
                                                </Pressable>
                                                <View style={styles.progressCardTips}>
                                                    <Text style={styles.progressCardTipsTitle}>Tips to improve</Text>
                                                    {
                                                        this.state.progress.weightTrackerProgress.tips.map((tip, index) =>
                                                            <View style={styles.progressCardTipContainer} key={"wtp" + index}>
                                                                <AntDesign style={styles.progressCardTipIcon} name="checkcircle" size={16} color={cardColors.weightTracker} />
                                                                <Text style={styles.progressCardTip}>{tip}</Text>
                                                            </View>
                                                        )
                                                    }
                                                </View>
                                            </View>
                                            : null
                                    }
                                    {
                                        this.state.progress.logbookProgress
                                            && this.state.progress.logbookProgress.length > 0
                                            ? <View style={[styles.progressCardContainer, { minHeight: this.state.exerciseDropdownOpened ? 275 : 0 }]}>
                                                <View style={styles.progressCardHeaderContainer}>
                                                    <FontAwesome5 name="weight" size={20} color={cardColors.logbook} />
                                                    <Text style={styles.progressCardHeader}>Logbook</Text>
                                                </View>
                                                <DropDownPicker
                                                    placeholder="Select an exercise"
                                                    maxHeight={150}
                                                    open={this.state.exerciseDropdownOpened}
                                                    setOpen={(value) => {
                                                        this.setState({ exerciseDropdownOpened: value })
                                                    }}
                                                    value={this.state.currentExercise}
                                                    setValue={(callback) => {
                                                        this.setState(state => ({
                                                            currentExercise: callback(state.value)
                                                        }));
                                                    }}
                                                    items={this.state.exercises}
                                                    setItems={(callback) => {
                                                        this.setState(state => ({
                                                            exercises: callback(state.items)
                                                        }));
                                                    }}
                                                    onChangeItem={item => console.log(item.label, item.value)}
                                                    zIndex={10000}
                                                    textStyle={{
                                                        fontFamily: 'MainMedium',
                                                        fontSize: 14,
                                                    }}
                                                    dropDownContainerStyle={{
                                                        borderColor: "#ccc",
                                                    }}
                                                    style={{
                                                        borderColor: "#ccc",
                                                        marginBottom: 16
                                                    }}
                                                />
                                                {
                                                    this.state.progress.logbookProgress.map((exercise, index) =>
                                                        <View key={"lp" + index}>
                                                            {
                                                                this.state.currentExercise == exercise.exerciseInstance._id
                                                                    ? <>
                                                                        {
                                                                            exercise.lastSessionProgressNotation
                                                                                ? <>
                                                                                    <Text style={{
                                                                                        fontFamily: "MainMedium",
                                                                                        fontSize: 14,
                                                                                        marginBottom: 8,
                                                                                    }}>Trend from last session:</Text>
                                                                                    <Pressable style={({ pressed }) => [
                                                                                        styles.progressFlagContainer,
                                                                                        {
                                                                                            opacity: pressed ? 0.1 : 1,
                                                                                            backgroundColor: cardColors.logbook
                                                                                        }
                                                                                    ]} onPress={() => {
                                                                                    }}>
                                                                                        <Text style={styles.progressFlag}>
                                                                                            {
                                                                                                exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_GAIN
                                                                                                    ? "Rapid strength gain"
                                                                                                    : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_GAIN
                                                                                                        ? "Strength gain"
                                                                                                        : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_GAIN
                                                                                                            ? "Slight strength gain"
                                                                                                            : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.NO_CHANGE
                                                                                                                ? "No notable change"
                                                                                                                : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_LOSS
                                                                                                                    ? "Slight strength loss"
                                                                                                                    : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_LOSS
                                                                                                                        ? "Strength loss"
                                                                                                                        : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_LOSS
                                                                                                                            ? "Rapid strength loss"
                                                                                                                            : null

                                                                                            }
                                                                                        </Text>
                                                                                        {/* <Entypo name="info-with-circle" size={18} color="white" /> */}
                                                                                    </Pressable>
                                                                                </>
                                                                                : null
                                                                        }
                                                                        {
                                                                            exercise.lastFiveSessionsProgressNotation
                                                                                ? <>
                                                                                    <Text style={{
                                                                                        fontFamily: "MainMedium",
                                                                                        fontSize: 14,
                                                                                        marginBottom: 8,
                                                                                        marginTop: 12
                                                                                    }}>General trend:</Text>
                                                                                    <Pressable style={({ pressed }) => [
                                                                                        styles.progressFlagContainer,
                                                                                        {
                                                                                            opacity: pressed ? 0.1 : 1,
                                                                                            backgroundColor: cardColors.logbook
                                                                                        }
                                                                                    ]} onPress={() => {
                                                                                    }}>
                                                                                        <Text style={styles.progressFlag}>
                                                                                            {
                                                                                                exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_GAIN
                                                                                                    ? "Rapid strength gain"
                                                                                                    : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_GAIN
                                                                                                        ? "Strength gain"
                                                                                                        : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_GAIN
                                                                                                            ? "Slight strength gain"
                                                                                                            : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.NO_CHANGE
                                                                                                                ? "No notable change"
                                                                                                                : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_LOSS
                                                                                                                    ? "Slight strength loss"
                                                                                                                    : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_LOSS
                                                                                                                        ? "Strength loss"
                                                                                                                        : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_LOSS
                                                                                                                            ? "Rapid strength loss"
                                                                                                                            : null

                                                                                            }
                                                                                        </Text>
                                                                                        {/* <Entypo name="info-with-circle" size={18} color="white" /> */}
                                                                                    </Pressable>
                                                                                </>
                                                                                : null
                                                                        }
                                                                        {
                                                                            !exercise.lastSessionProgressNotation && !exercise.lastFiveSessionsProgressNotation
                                                                                ? <>
                                                                                    <Text style={globalStyles.notation}>Finish at least two sessions with this exercise to unlock the progress functionality</Text>
                                                                                    <Pressable style={({ pressed }) => [
                                                                                        globalStyles.authPageActionButton, {
                                                                                            opacity: pressed ? 0.1 : 1,
                                                                                            marginTop: 12
                                                                                        }
                                                                                    ]} onPress={() => {
                                                                                        this.props.navigation.navigate("Logbook", {
                                                                                            date: new Date(),
                                                                                            timezoneOffset: new Date().getTimezoneOffset()
                                                                                        });
                                                                                    }}>
                                                                                        <Text style={globalStyles.authPageActionButtonText}>Add a workout session</Text>
                                                                                    </Pressable>
                                                                                </>
                                                                                : null
                                                                        }
                                                                    </>
                                                                    : null
                                                            }
                                                        </View>
                                                    )
                                                }
                                                {
                                                    !this.state.currentExercise
                                                        ? <Text style={globalStyles.notation}>Please, select an exercise to show progress charts for.</Text>
                                                        : null
                                                }
                                            </View>
                                            : null
                                    }
                                    {
                                        !this.state.progress.weightTrackerProgress
                                            && this.state.progress.logbookProgress.length <= 0
                                            ? <>
                                                <View style={styles.unknownSourceCaloriesIncentiveContainer}>
                                                    <Text style={styles.unknownSourceCaloriesIncentiveText}>After adding some data you will have the ability to monitor your progress from this tab as well as get software-based suggestions on how to improve your fitness.</Text>
                                                    <Pressable style={({ pressed }) => [
                                                        globalStyles.authPageActionButton,
                                                        {
                                                            opacity: pressed ? 0.1 : 1,
                                                        }
                                                    ]} onPress={() => {
                                                        this.props.navigation.navigate("Calendar");
                                                    }}>
                                                        <Text style={globalStyles.authPageActionButtonText}>Let's unlock this tab</Text>
                                                    </Pressable>
                                                </View>
                                            </>
                                            : null
                                    }
                                </>
                                : null
                        }
                    </ScrollView>
                </View>
            </View>
        )
    }
}
