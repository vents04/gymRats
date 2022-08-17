import React, { Component } from 'react'
import { Dimensions, Image, ScrollView, Text, TextInput, Pressable, View, ActivityIndicator, Share, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import DropDownPicker from 'react-native-dropdown-picker'

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import { FontAwesome, Ionicons } from '@expo/vector-icons';
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
            requests: [],
            friends: [],
            friendsCompetitive: [],
            showUserFromFriendsLinkModal: true,
            showUserFromFriendsLinkModalLoading: false
        }

        this.focusListener;
    }


    onFocusFunction = () => {
        this.getProgress();
        this.getFriends();
        this.getFriendsCompetitive();
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

    sendFriendRequest = (userId) => {
        this.setState({ showUserFromFriendsLinkModalLoading: true }, () => {
            ApiRequests.post("social/connection", {}, {
                receiverId: userId
            }, true).then((response) => {
                this.setState({ showUserFromFriendsLinkModal: false })
                this.getFriends();
                this.getFriendsCompetitive();
            }).catch((error) => {
                if (error.response) {
                    if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                        this.setState({ showModalError: true, error: error.response.data });
                    } else {
                        ApiRequests.showInternalServerError();
                    }
                } else if (error.request) {
                    ApiRequests.showNoResponseError();
                } else {
                    ApiRequests.showRequestSettingError();
                }
            }).finally(() => {
                this.setState({ showUserFromFriendsLinkModalLoading: false });
            })
        })
    }

    getFriends = () => {
        ApiRequests.get("social/connection", {}, true).then((response) => {
            this.setState({ friends: response.data.connections, requests: response.data.requests });
        }).catch((error) => {
            console.log(error.response.data)
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showModalError: true, error: error.response.data });
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

    deleteRequest = (id) => {
        ApiRequests.delete("social/connection/" + id, {}, true).then((response) => {
            this.getFriends();
            this.getFriendsCompetitive();
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showModalError: true, error: error.response.data });
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

    acceptRequest = (id) => {
        ApiRequests.put("social/connection/" + id + "/accept", {}, {}, true).then((response) => {
            this.getFriends();
            this.getFriendsCompetitive();
        }).catch((error) => {
            console.log(error.response.data)
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showModalError: true, error: error.response.data });
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

    getFriendsCompetitive = () => {
        ApiRequests.get("social/friends-competitive", {}, true).then((response) => {
            console.log(response.data)
            this.setState({ friendsCompetitive: response.data.competitive });
        }).catch((error) => {
            console.log(error.response.data)
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showModalError: true, error: error.response.data });
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
                {
                    this.props.route?.params?.userFromFriendsLink && this.state.showUserFromFriendsLinkModal
                        ? <Modal
                            animationType="slide"
                            transparent={true}
                            visible={true}>
                            <View style={globalStyles.centeredView}>
                                <View style={globalStyles.modalView}>
                                    <View style={styles.modalTopbar}>
                                        <Text style={[globalStyles.modalTitle, { width: "80%" }]}>
                                            {i18n.t('screens')['progress']['friendsLinkModalTitle'][0]}
                                            &nbsp;
                                            {i18n.t('screens')['progress']['friendsLinkModalTitle'][1]}
                                        </Text>
                                        <Pressable style={({ pressed }) => [
                                            styles.option,
                                            {
                                                opacity: pressed ? 0.1 : 1,
                                            }
                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                            this.setState({ showUserFromFriendsLinkModal: false })
                                        }}>
                                            <Ionicons name="close" size={24} color="#262626" style={{ marginRight: 32 }} />
                                        </Pressable>
                                    </View>
                                    {
                                        !this.props.route.params.userFromFriendsLink.profilePicture
                                            ? <View style={styles.profilePictureContainer}>
                                                <Text style={styles.noProfilePictureText}>
                                                    {this.props.route.params.userFromFriendsLink.firstName.charAt(0)}
                                                    {this.props.route.params.userFromFriendsLink.lastName.charAt(0)}
                                                </Text>
                                            </View>
                                            : <Image style={styles.profilePictureContainer}
                                                source={{ uri: this.props.route.params.userFromFriendsLink.profilePicture }} />
                                    }
                                    <Text style={styles.names}>
                                        {this.props.route.params.userFromFriendsLink.firstName}
                                        &nbsp;
                                        {this.props.route.params.userFromFriendsLink.lastName}
                                    </Text>
                                    {
                                        this.state.showModalError
                                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                                            : null
                                    }
                                    <Pressable style={({ pressed }) => [
                                        globalStyles.authPageActionButton,
                                        {
                                            opacity: pressed ? 0.1 : 1,
                                            marginTop: 16
                                        }
                                    ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                        if (this.props.route && this.props.route.params && this.props.route.params.userFromFriendsLink && !this.state.showUserFromFriendsLinkModalLoading) {
                                            this.sendFriendRequest(this.props.route.params.userFromFriendsLink._id);
                                        }
                                    }}>
                                        {
                                            !this.state.showUserFromFriendsLinkModalLoading
                                                ? <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['progress']['sendFriendRequest']}</Text>
                                                : <ActivityIndicator
                                                    animating={true}
                                                    color="#fff"
                                                    size="small" />
                                        }

                                    </Pressable>
                                    {
                                        /*
                                    <View style={globalStyles.modalActionsContainer}>
                                        <Pressable style={({ pressed }) => [
                                            styles.option,
                                            {
                                                opacity: pressed ? 0.1 : 1,
                                                flex: 2
                                            }
                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                            this.setState({ hasDeniedWorkoutTemplateCreation: true, showWorkoutTemplateModal: false })
                                            this.saveChanges();
                                        }}>
                                            <Text style={[globalStyles.modalActionTitle, {
                                                color: "#1f6cb0"
                                            }]}>{i18n.t('screens')['logbook']['workoutTemplateDeny']}</Text>
                                        </Pressable>
                                    </View>
                                        */
                                    }
                                </View>
                            </View>
                        </Modal>
                        : null
                }
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
                                                                            ? <View style = {{
                                                                                flexDirection: "row",
                                                                                justifyContent: "space-evenly",
                                                                            }}> 
                                                                                {
                                                                                    exercise.lastSessionProgressNotation
                                                                                        ? <View style={{
                                                                                            flex: 1,
                                                                                        }}>
                                                                                            < Text numberOfLines = {3} style={{
                                                                                                fontFamily: "MainMedium",
                                                                                                fontSize: 14,
                                                                                                marginTop: 12,
                                                                                                marginBottom: 8,
                                                                                                textAlign: "center",
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
                                                                                        </View>
                                                                                        : null
                                                                                }
                                                                                {
                                                                                    exercise.lastFiveSessionsProgressNotation
                                                                                        ? <View style = {{
                                                                                            flex: 1,
                                                                                        }}>
                                                                                            <Text style={{
                                                                                                fontFamily: "MainMedium",
                                                                                                fontSize: 14,
                                                                                                marginBottom: 25,
                                                                                                marginTop: 12,
                                                                                                textAlign: "center",
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
                                                                                        </View>
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
                                                                            </View>
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
                                    this.state.requests?.length == 0 && this.state.friends?.length == 0 && this.state.friendsCompetitive?.length == 0
                                        ? <View style={styles.noFriendsContainer} key={"111"}>
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
                                        : <>
                                            {
                                                this.state.requests.map((request) =>
                                                    <View style={styles.requestContainer} key={request._id}>
                                                        <View style={styles.coachRequestInfoContainer}>
                                                            <Pressable style={({ pressed }) => [
                                                                {
                                                                    opacity: pressed ? 0.1 : 1,
                                                                }
                                                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                                                this.deleteRequest(request._id)
                                                            }} >
                                                                <Ionicons name="close" size={18} color="#aaa" style={{ marginRight: 8 }} />
                                                            </Pressable>
                                                            {
                                                                !request.initiator.profilePicture
                                                                    ? <View style={styles.profilePictureContainerRequest}>
                                                                        <Text style={styles.noProfilePictureTextRequest}>
                                                                            {request.initiator.firstName.charAt(0)}
                                                                            {request.initiator.lastName.charAt(0)}
                                                                        </Text>
                                                                    </View>
                                                                    : <Image style={styles.profilePictureContainerRequest}
                                                                        source={{ uri: trequest.initiator.profilePicture }} />
                                                            }
                                                            <View style={styles.chatsItemDetailsContainer}>
                                                                <Text style={styles.chatsItemNames}>{request.initiator.firstName}&nbsp;{request.initiator.lastName}</Text>
                                                            </View>
                                                        </View>
                                                        <Pressable style={({ pressed }) => [
                                                            globalStyles.authPageActionButton,
                                                            {
                                                                opacity: pressed ? 0.1 : 1,
                                                                marginTop: 14
                                                            }
                                                        ]}
                                                            onPress={() => {
                                                                this.acceptRequest(request._id)
                                                            }}>
                                                            <Text style={globalStyles.authPageActionButtonText}>{i18n.t('components')['coachRequestItem']['acceptRequest']}</Text>
                                                        </Pressable>
                                                    </View>
                                                )
                                            }
                                            {
                                                this.state.friendsCompetitive.map((friend) =>
                                                    <View style={styles.friendContainer} key={friend._id}>
                                                        <Text style={[styles.friendProgressNotation, {
                                                            backgroundColor: friend.friend.percentageProgress > friend.me.percentageProgress
                                                                ? "#cf3333"
                                                                : "#1f6cb0"
                                                        }]}>{
                                                                friend.friend.percentageProgress > friend.me.percentageProgress
                                                                    ? i18n.t('screens')['progress']['competitiveProgressNotationWorse']
                                                                    : friend.friend.percentageProgress < friend.me.percentageProgress
                                                                        ? i18n.t('screens')['progress']['competitiveProgressNotationBetter']
                                                                        : i18n.t('screens')['progress']['competitiveProgressNotationNeutral']
                                                            }</Text>
                                                        <View style={styles.comparisonContainer}>
                                                            <View style={styles.comparisonUserContainer}>
                                                                {
                                                                    !friend.me.profilePicture
                                                                        ? <View style={styles.profilePictureContainerMini}>
                                                                            <Text style={styles.noProfilePictureTextMini}>
                                                                                {friend.me.firstName.charAt(0)}
                                                                                {friend.me.lastName.charAt(0)}
                                                                            </Text>
                                                                        </View>
                                                                        : <Image style={styles.profilePictureContainerMini}
                                                                            source={{ uri: friend.me.profilePicture }} />
                                                                }
                                                                <Text style={styles.namesMini}>
                                                                    {friend.me.firstName}
                                                                </Text>
                                                            </View>
                                                            <Text style={styles.comparisonVs}>VS</Text>
                                                            <View style={styles.comparisonUserContainer}>
                                                                {
                                                                    !friend.friend.profilePicture
                                                                        ? <View style={styles.profilePictureContainerMini}>
                                                                            <Text style={styles.noProfilePictureTextMini}>
                                                                                {friend.friend.firstName.charAt(0)}
                                                                                {friend.friend.lastName.charAt(0)}
                                                                            </Text>
                                                                        </View>
                                                                        : <Image style={styles.profilePictureContainerMini}
                                                                            source={{ uri: friend.friend.profilePicture }} />
                                                                }
                                                                <Text style={styles.namesMini}>
                                                                    {friend.friend.firstName}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.progressRateComparisonContainer}>
                                                            <View style={styles.friendProgressRate}>
                                                                {
                                                                    friend.me.percentageProgress < 0
                                                                        ? <FontAwesome name="long-arrow-down" size={14} color={cardColors.negative} />
                                                                        : <FontAwesome name="long-arrow-up" size={14} color="#1f6cb0" />
                                                                }
                                                                <Text style={styles.friendProgressRateText}>
                                                                    {
                                                                        !isNaN(Math.abs(friend.me.percentageProgress).toFixed(0))
                                                                            ? Math.abs(friend.me.percentageProgress).toFixed(0)
                                                                            : ""
                                                                    } {
                                                                        friend.me.percentageProgress < 0
                                                                            ? i18n.t('screens')['progress']['competitiveRegress']
                                                                            : i18n.t('screens')['progress']['competitiveProgress']
                                                                    }
                                                                </Text>
                                                            </View>
                                                            <View style={styles.friendProgressRate}>
                                                                {
                                                                    friend.friend.percentageProgress < 0
                                                                        ? <FontAwesome name="long-arrow-down" size={14} color={cardColors.negative} />
                                                                        : <FontAwesome name="long-arrow-up" size={14} color="#1f6cb0" />
                                                                }
                                                                <Text style={styles.friendProgressRateText}>
                                                                    {
                                                                        !isNaN(Math.abs(friend.friend.percentageProgress).toFixed(0))
                                                                            ? Math.abs(friend.friend.percentageProgress).toFixed(0)
                                                                            : ""
                                                                    } {
                                                                        friend.friend.percentageProgress < 0
                                                                            ? i18n.t('screens')['progress']['competitiveRegress']
                                                                            : i18n.t('screens')['progress']['competitiveProgress']
                                                                    }
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                )
                                            }
                                        </>
                                }
                            </ScrollView>
                    }
                </View>
            </View >
        )
    }
}
