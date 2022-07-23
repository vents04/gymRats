import React, { Component } from 'react'
import { Dimensions, Image, ScrollView, Text, TextInput, Pressable, View, ActivityIndicator, Share } from 'react-native';
import { WebView } from 'react-native-webview';
import DropDownPicker from 'react-native-dropdown-picker'

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

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

import noFriendsImage from '../../../assets/img/no-friends.jpg'

export default class Progress extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showLoading: true,
            error: "",
            showError: false,
            progress: null,
            currentExercise: null,
            exercises: [],
            exerciseDropdownOpened: false,
            activeTab: "friends",
            friends: [],
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
        }).finally(() => {
            this.setState({ showLoading: false });
        })
    }

    shareFriendsLink = async () => {
        ApiRequests.get("user/friends-link", {}, true).then(async (response) => {
            const url = `https://gymrats.uploy.app/friends-link/${response.data.linkId}`
            await Share.share({
                message: `Compete with ${response.data.firstName} on Gym Rats!\n${url}`,
            });
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
        return (
            <View style={[globalStyles.safeAreaView, { paddingTop: 32 }]}>
                <View style={globalStyles.pageContainer}>
                    <LogoBar />
                    <View style={styles.tabsContainer}>
                        <Pressable style={({ pressed }) => [
                            styles.tabTitleContainer,
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.setState({ activeTab: "myProgress" });
                        }}>
                            <Text style={[styles.tabTitle, {
                                color: this.state.activeTab == "myProgress" ? "#1f6cb0" : "#aaa"
                            }]}>{i18n.t('screens')['progress']['myProgress']}</Text>
                        </Pressable>
                        <Pressable style={({ pressed }) => [
                            styles.tabTitleContainer,
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.setState({ activeTab: "friends" });
                        }}>
                            <Text style={[styles.tabTitle, {
                                color: this.state.activeTab == "friends" ? "#1f6cb0" : "#aaa"
                            }]}>{i18n.t('screens')['progress']['friends']}</Text>
                        </Pressable>
                    </View>
                    {
                                    this.state.activeTab == 'myProgress'
                                    ? <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}
                                        scrollEnabled={!this.state.exerciseDropdownOpened}>
                                        {
                                            this.state.progress && !this.state.showLoading
                                            ? <>
                                                {
                                                    this.state.progress.weightTrackerProgress
                                                        ? <View style={styles.progressCardContainer}>
                                                            <View style={styles.progressCardHeaderContainer}>
                                                                <FontAwesome5 name="weight" size={20} color={cardColors.weightTracker} />
                                                                <Text style={styles.progressCardHeader}>{i18n.t('screens')['progress']['weightTracker']}</Text>
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
                                                                            ? i18n.t('screens')['progress']['minorWeightLoss']
                                                                            : this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.SUFFICIENT_WEIGHT_LOSS
                                                                                ? i18n.t('screens')['progress']['efficientWeightLoss']
                                                                                : this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.SUFFICIENT_WEIGHT_GAIN
                                                                                    ? i18n.t('screens')['progress']['efficientWeightGain']
                                                                                    : this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.RAPID_WEIGHT_LOSS
                                                                                        ? i18n.t('screens')['progress']['tooRapidWeightLoss']
                                                                                        : this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.RAPID_WEIGHT_GAIN
                                                                                            ? i18n.t('screens')['progress']['tooRapidWeightGain']
                                                                                            : this.state.progress.weightTrackerProgress.notation == PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_GAIN
                                                                                                ? i18n.t('screens')['progress']['minorWeightGain']
                                                                                                : null
    
                                                                    }
                                                                </Text>
                                                            </Pressable>
                                                            <View style={styles.progressCardTips}>
                                                                <Text style={styles.progressCardTipsTitle}>{i18n.t('screens')['progress']['tipsToImproove']}</Text>
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
                                                        ? <View style={[styles.progressCardContainer]}>
                                                            {/* up styles minHeight: this.state.exerciseDropdownOpened ? 275 : 0 */}
                                                            <View style={styles.progressCardHeaderContainer}>
                                                                <FontAwesome5 name="dumbbell" size={20} color={cardColors.logbook} />
                                                                <Text style={styles.progressCardHeader}>{i18n.t('screens')['progress']['logbook']}</Text>
                                                            </View>
                                                            <DropDownPicker
                                                                placeholder={i18n.t('screens')['progress']['selectExercise']}
                                                                maxHeight={100}
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
                                                                onChangeItem={item => { }}
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
                                                                                                }}>{i18n.t('screens')['progress']['trendFromLastSession']}</Text>
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
                                                                                                                ? i18n.t('screens')['progress']['rapidStrengthGain']
                                                                                                                : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_GAIN
                                                                                                                    ? i18n.t('screens')['progress']['strengthGain']
                                                                                                                    : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_GAIN
                                                                                                                        ? i18n.t('screens')['progress']['slightStrengthGain']
                                                                                                                        : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.NO_CHANGE
                                                                                                                            ? i18n.t('screens')['progress']['noNotableChange']
                                                                                                                            : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_LOSS
                                                                                                                                ? i18n.t('screens')['progress']['slightStrengthLoss']
                                                                                                                                : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_LOSS
                                                                                                                                    ? i18n.t('screens')['progress']['strengthLoss']
                                                                                                                                    : exercise.lastSessionProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_LOSS
                                                                                                                                        ? i18n.t('screens')['progress']['rapidStrengthLoss']
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
                                                                                                }}>{i18n.t('screens')['progress']['generalTrend']}</Text>
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
                                                                                                                ? i18n.t('screens')['progress']['rapidStrengthGain']
                                                                                                                : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_GAIN
                                                                                                                    ? i18n.t('screens')['progress']['strengthGain']
                                                                                                                    : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_GAIN
                                                                                                                        ? i18n.t('screens')['progress']['slightStrengthGain']
                                                                                                                        : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.NO_CHANGE
                                                                                                                            ? i18n.t('screens')['progress']['noNotableChange']
                                                                                                                            : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.SLIGHT_STRENGTH_LOSS
                                                                                                                                ? i18n.t('screens')['progress']['slightStrengthLoss']
                                                                                                                                : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.STRENGTH_LOSS
                                                                                                                                    ? i18n.t('screens')['progress']['strengthLoss']
                                                                                                                                    : exercise.lastFiveSessionsProgressNotation == LOGBOOK_PROGRESS_NOTATIONS.RAPID_STRENGTH_LOSS
                                                                                                                                        ? i18n.t('screens')['progress']['rapidStrengthLoss']
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
                                                                                                <Text style={globalStyles.notation}>{i18n.t('screens')['progress']['atLeastTwoSessions']}</Text>
                                                                                                {
                                                                                                    !this.state.progress.hasAddedWorkoutSession
                                                                                                        ? <Pressable style={({ pressed }) => [
                                                                                                            globalStyles.authPageActionButton, {
                                                                                                                opacity: pressed ? 0.1 : 1,
                                                                                                                marginTop: 12
                                                                                                            }
                                                                                                        ]} onPress={() => {
                                                                                                            this.props.navigation.navigate("Calendar", {
                                                                                                            });
                                                                                                        }}>
                                                                                                            <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['progress']['addWorkoutSession']}</Text>
                                                                                                        </Pressable>
                                                                                                        : null
                                                                                                }
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
                                                                    ? <Text style={globalStyles.notation}>{i18n.t('screens')['progress']['selectExercise']}</Text>
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
                                                                <Text style={styles.unknownSourceCaloriesIncentiveText}>{i18n.t('screens')['progress']['messageToUser']}</Text>
                                                                <Pressable style={({ pressed }) => [
                                                                    globalStyles.authPageActionButton,
                                                                    {
                                                                        opacity: pressed ? 0.1 : 1,
                                                                    }
                                                                ]} onPress={() => {
                                                                    this.props.navigation.navigate("Calendar");
                                                                }}>
                                                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['progress']['letsUnlockThisTab']}</Text>
                                                                </Pressable>
                                                            </View>
                                                        </>
                                                        : null
                                                }
                                            </>
                                            : <ActivityIndicator style={{
                                                width: '100%',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }} size="large" color="#777" />
                                    }
                                    </ScrollView>
                                : <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                                    {
                                        this.state.friends?.length == 0
                                        ?<View style={styles.noFriendsContainer}>
                                            <Image style={styles.noFriendsImage} source={noFriendsImage}></Image>
                                            <Text style={styles.noFriendsText}>{i18n.t('screens')['progress']['noFriendsText']}</Text>
                                            <Pressable style={({ pressed }) => [
                                                globalStyles.authPageActionButton, {
                                                    opacity: pressed ? 0.1 : 1,
                                                    marginTop: 24
                                                }
                                            ]} onPress={() => {
                                                this.shareFriendsLink();
                                            }}>
                                                <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['progress']['noFriendsIncentive']}</Text>
                                            </Pressable>
                                        </View>
                                        : null
                                    }
                                </ScrollView>
                    }
                </View>
            </View >
        )
    }
}
