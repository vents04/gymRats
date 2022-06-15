import React, { Component } from 'react'
import { Image, ScrollView, Text, Pressable, View } from 'react-native';
import { Badge } from 'react-native-elements';

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import ConfirmationBox from '../../components/ConfirmationBox/ConfirmationBox';

import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Coaching.styles';
import LogoBar from '../../components/LogoBar/LogoBar';

export default class Coaching extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeTab: "myCoach",
            showError: false,
            error: "",
            coaching: null,
            relations: [],
            showEndRelationModal: false,
            relationToBeEndedId: null,
            statusToBeUpdated: "CANCELED"
        }

        this.personalTrainerStatusMessages = {
            "PENDING": i18n.t('screens')['coaching']['personalTrainerStatusMessagesPending'],
            "ACTIVE": i18n.t('screens')['coaching']['personalTrainerStatusMessagesActive'],
            "BLOCKED": i18n.t('screens')['coaching']['personalTrainerStatusMessagesBlocked'],
        }

        this.focusListener;
    }

    onFocusFunction = () => {
        this.setState({ showError: false, error: "" })
        if (this.props && this.props.route && this.props.route.params && this.props.route.params.tab) {
            this.setState({ activeTab: this.props.route.params.tab });
        }
        this.getCoachingPageState();
        this.getRequests();
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
    }

    getCoachingPageState = () => {
        ApiRequests.get("coaching", {}, true).then((response) => {
            this.setState({ coaching: response.data.coaching });
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

    deleteRequest = (id) => {
        ApiRequests.delete(`coaching/relation/${id}`, {}, true).then((response) => {
            this.getCoachingPageState();
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

    updateStatus = (id, status) => {
        ApiRequests.put(`coaching/relation/${id}/status`, {}, { status: status }, true).then((response) => {
            this.getCoachingPageState();
        }).catch((error) => {
            this.setState({ showEndRelationModal: false });
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

    getRequests = () => {
        ApiRequests.get("coaching/requests", {}, true).then((response) => {
            this.setState({ requests: response.data.requests });
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

    toggleShowEndRelationModal = (state) => {
        this.setState({ showEndRelationModal: state });
    }

    render() {
        return (
            <View style={[globalStyles.safeAreaView, { paddingTop: 32 }]}>
                {
                    this.state.showEndRelationModal
                        ? <ConfirmationBox deleteCard={() => { this.updateStatus(this.state.relationToBeEndedId, this.state.statusToBeUpdated) }} toggleShowConfirmationBox={this.toggleShowEndRelationModal} />
                        : null
                }
                <View style={globalStyles.pageContainer}>
                    <LogoBar />
                    {
                        this.state.coaching &&
                            this.state.coaching.myClients.requests.length > 0
                            ? <Pressable style={({ pressed }) => [
                                globalStyles.topbarIconContainer,
                                {
                                    opacity: pressed ? 0.1 : 1,
                                }
                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                this.props.navigation.navigate("CoachRequests", { relations: this.state.relations });
                            }}>
                                <View>
                                    <MaterialCommunityIcons name="inbox" size={30} color="#1f6cb0" />
                                    <Badge
                                        status="error"
                                        value={this.state.coaching.myClients.requests.length}
                                        textStyle={{ fontFamily: "MainMedium" }}
                                        containerStyle={{ position: 'absolute', left: 20, height: 12, width: 12 }}
                                    />
                                </View>
                            </Pressable>
                            : null
                    }
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <View style={styles.tabsContainer}>
                        <Pressable style={({ pressed }) => [
                            styles.tabTitleContainer,
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.setState({ activeTab: "myCoach" });
                            this.getCoachingPageState();
                        }}>
                            <Text style={[styles.tabTitle, {
                                color: this.state.activeTab == "myCoach" ? "#1f6cb0" : "#aaa"
                            }]}>{i18n.t('screens')['coaching']['meAsClient']}</Text>
                        </Pressable>
                        <Pressable style={({ pressed }) => [
                            styles.tabTitleContainer,
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.setState({ activeTab: "myClients" });
                            this.getCoachingPageState();
                        }}>
                            <Text style={[styles.tabTitle, {
                                color: this.state.activeTab == "myClients" ? "#1f6cb0" : "#aaa"
                            }]}>{i18n.t('screens')['coaching']['meAsCoach']}</Text>
                        </Pressable>
                    </View>
                    {
                        this.state.coaching
                            ? this.state.activeTab == "myCoach"
                                ? <ScrollView contentContainerStyle={[globalStyles.fillEmptySpace, {
                                    paddingVertical: 30
                                }]}>
                                    {
                                        !this.state.coaching.myCoach.hasCoaches && !this.state.coaching.myCoach.hasRelations
                                            ? <>
                                                <View style={styles.noCoachContainer}>
                                                    <View style={styles.noCoachTopbar}>
                                                        <FontAwesome5 name="dumbbell" size={25} color="#1f6cb0" />
                                                        <Text style={styles.noCoachTitle}>{i18n.t('screens')['coaching']['getInShape']}</Text>
                                                    </View>
                                                    <Text style={styles.noCoachDescription}>{i18n.t('screens')['coaching']['ourCoaches']}</Text>
                                                    <View style={styles.noCoachProContainer}>
                                                        <View style={styles.noCoachNumberContainer}>
                                                            <Text style={styles.noCoachNumber}>1</Text>
                                                        </View>
                                                        <Text style={styles.noCoachPro}>{i18n.t('screens')['coaching']['singleHandedly']}</Text>
                                                    </View>
                                                    <View style={styles.noCoachProContainer}>
                                                        <View style={styles.noCoachNumberContainer}>
                                                            <Text style={styles.noCoachNumber}>2</Text>
                                                        </View>
                                                        <Text style={styles.noCoachPro}>{i18n.t('screens')['coaching']['motivatedAndReady']}</Text>
                                                    </View>
                                                    <View style={styles.noCoachProContainer}>
                                                        <View style={styles.noCoachNumberContainer}>
                                                            <Text style={styles.noCoachNumber}>3</Text>
                                                        </View>
                                                        <Text style={styles.noCoachPro}>{i18n.t('screens')['coaching']['capableOfTraining']}</Text>
                                                    </View>
                                                    <Pressable style={({ pressed }) => [
                                                        globalStyles.authPageActionButton,
                                                        {
                                                            opacity: pressed ? 0.1 : 1,
                                                            marginTop: 30
                                                        }
                                                    ]} onPress={() => {
                                                        this.props.navigation.navigate("CoachSearch");
                                                    }}>
                                                        <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['coaching']['searchCoaches']}</Text>
                                                    </Pressable>
                                                </View>
                                                {
                                                    this.state.coaching.myCoach.canceledRelations.length > 0
                                                        ? <>
                                                            <Text style={styles.coachingSectionTitle}>{i18n.t('screens')['coaching']['relationsWithoutReviews']}</Text>
                                                            {
                                                                this.state.coaching.myCoach.canceledRelations.map((relation, index) =>
                                                                    <View key={index} style={[styles.requestItem, {
                                                                        flexDirection: "column",
                                                                        alignItems: "flex-start",
                                                                    }]}>
                                                                        <View style={styles.requestItemProfile}>
                                                                            {
                                                                                !relation.coach.profilePicture
                                                                                    ? <View style={styles.profilePictureContainer}>
                                                                                        <Text style={styles.noProfilePictureText}>
                                                                                            {relation.coach.firstName.charAt(0)}
                                                                                            {relation.coach.lastName.charAt(0)}
                                                                                        </Text>
                                                                                    </View>
                                                                                    : <Image style={styles.profilePictureContainer}
                                                                                        source={{ uri: relation.coach.profilePicture }} />
                                                                            }
                                                                            <Text style={styles.names}>
                                                                                {relation.coach.firstName}
                                                                                &nbsp;
                                                                                {relation.coach.lastName}
                                                                            </Text>
                                                                        </View>
                                                                        <Text style={[globalStyles.notation, {
                                                                            marginTop: 12
                                                                        }]}>{i18n.t('screens')['coaching']['startOfRelation']} {new Date(relation.from).toLocaleDateString()}
                                                                            {
                                                                                relation.to
                                                                                    ? i18n.t('screens')['coaching']['endOfRelation'] + new Date(relation.to).toLocaleDateString()
                                                                                    : null
                                                                            }</Text>
                                                                        {
                                                                            !relation.hasReview
                                                                                ? <Pressable style={({ pressed }) => [
                                                                                    globalStyles.authPageActionButton,
                                                                                    {
                                                                                        opacity: pressed ? 0.1 : 1,
                                                                                        marginTop: 12
                                                                                    }
                                                                                ]} onPress={() => {
                                                                                    this.props.navigation.navigate("PostReview", { relation })
                                                                                }}>
                                                                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['coaching']['leaveAReview']}</Text>
                                                                                </Pressable>
                                                                                : null
                                                                        }
                                                                    </View>
                                                                )}
                                                        </>
                                                        : null
                                                }
                                            </>
                                            : <>
                                                <Pressable style={({ pressed }) => [
                                                    globalStyles.authPageActionButton,
                                                    {
                                                        opacity: pressed ? 0.1 : 1,
                                                        marginBottom: 20
                                                    }
                                                ]} onPress={() => {
                                                    this.props.navigation.navigate("CoachSearch");
                                                }}>
                                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['coaching']['searchCoaches']}</Text>
                                                </Pressable>
                                                {
                                                    !this.state.coaching.myCoach.hasCoaches
                                                        ? <Text style={globalStyles.notation}>{i18n.t('screens')['coaching']['stillNoCoaches']}</Text>
                                                        : null
                                                }
                                                {
                                                    this.state.coaching.myCoach.hasCoaches
                                                        ? <>
                                                            <Text style={styles.coachingSectionTitle}>{i18n.t('screens')['coaching']['coaches']}</Text>
                                                            {
                                                                this.state.coaching.myCoach.coaches.map((coach, index) =>
                                                                    <View key={index} style={styles.requestItem}>
                                                                        <View style={styles.requestItemProfile}>
                                                                            {
                                                                                !coach.coachUser.profilePicture
                                                                                    ? <View style={styles.profilePictureContainer}>
                                                                                        <Text style={styles.noProfilePictureText}>
                                                                                            {coach.coachUser.firstName.charAt(0)}
                                                                                            {coach.coachUser.lastName.charAt(0)}
                                                                                        </Text>
                                                                                    </View>
                                                                                    : <Image style={styles.profilePictureContainer}
                                                                                        source={{ uri: coach.coachUser.profilePicture }} />
                                                                            }
                                                                            <Text style={styles.names}>
                                                                                {coach.coachUser.firstName}
                                                                                &nbsp;
                                                                                {coach.coachUser.lastName}
                                                                            </Text>
                                                                        </View>
                                                                        <Pressable style={({ pressed }) => [
                                                                            {
                                                                                opacity: pressed ? 0.1 : 1,
                                                                            }
                                                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                                                            this.setState({ showEndRelationModal: true, relationToBeEndedId: coach._id, statusToBeUpdated: "CANCELED" })
                                                                        }}>
                                                                            <MaterialCommunityIcons name="delete" size={25} color="#ddd" />
                                                                        </Pressable>
                                                                    </View>
                                                                )}
                                                        </>
                                                        : null
                                                }
                                                {
                                                    this.state.coaching.myCoach.hasRelations
                                                        ? <>
                                                            <Text style={styles.coachingSectionTitle}>{i18n.t('screens')['coaching']['unansweredRequests']}</Text>
                                                            {
                                                                this.state.coaching.myCoach.relations.map((relation, index) =>
                                                                    <View key={index} style={styles.requestItem}>
                                                                        <View style={styles.requestItemProfile}>
                                                                            {
                                                                                !relation.coach.profilePicture
                                                                                    ? <View style={styles.profilePictureContainer}>
                                                                                        <Text style={styles.noProfilePictureText}>
                                                                                            {relation.coach.firstName.charAt(0)}
                                                                                            {relation.coach.lastName.charAt(0)}
                                                                                        </Text>
                                                                                    </View>
                                                                                    : <Image style={styles.profilePictureContainer}
                                                                                        source={{ uri: relation.coach.profilePicture }} />
                                                                            }
                                                                            <Text style={styles.names}>
                                                                                {relation.coach.firstName}
                                                                                &nbsp;
                                                                                {relation.coach.lastName}
                                                                            </Text>
                                                                        </View>
                                                                        <Pressable style={({ pressed }) => [
                                                                            {
                                                                                opacity: pressed ? 0.1 : 1,
                                                                            }
                                                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                                                            this.deleteRequest(relation._id);
                                                                        }}>
                                                                            <MaterialCommunityIcons name="delete" size={20} color="#ddd" />
                                                                        </Pressable>
                                                                    </View>
                                                                )
                                                            }
                                                        </>
                                                        : null
                                                }
                                            </>
                                    }
                                </ScrollView>
                                : <ScrollView contentContainerStyle={[globalStyles.fillEmptySpace, {
                                    paddingVertical: 30
                                }]}>
                                    {
                                        this.state.coaching.myClients.isPersonalTrainer
                                            && this.state.coaching.myClients.trainerObject
                                            && this.state.coaching.myClients.trainerObject.status
                                            && this.state.coaching.myClients.trainerObject.status == "ACTIVE"
                                            ? <Pressable style={({ pressed }) => [
                                                globalStyles.authPageActionButton,
                                                {
                                                    opacity: pressed ? 0.1 : 1,
                                                    marginBottom: 12
                                                }
                                            ]} onPress={() => {
                                                this.props.navigation.navigate("CoachProfileEdit");
                                            }}>
                                                <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['coaching']['openMyCoachProfile']}</Text>
                                            </Pressable>
                                            : null
                                    }
                                    {
                                        !this.state.coaching.myClients.isPersonalTrainer
                                            ? <View style={styles.noCoachContainer}>
                                                <View style={styles.noCoachTopbar}>
                                                    <FontAwesome5 name="dumbbell" size={25} color="#1f6cb0" />
                                                    <Text style={styles.noCoachTitle}>{i18n.t('screens')['coaching']['beACoach']}</Text>
                                                </View>
                                                <Text style={styles.noCoachDescription}>{i18n.t('screens')['coaching']['catchTheOpportunity']}</Text>
                                                <View style={styles.noCoachProContainer}>
                                                    <View style={styles.noCoachNumberContainer}>
                                                        <Text style={styles.noCoachNumber}>1</Text>
                                                    </View>
                                                    <Text style={styles.noCoachPro}>{i18n.t('screens')['coaching']['workWithPeople']}</Text>
                                                </View>
                                                <View style={styles.noCoachProContainer}>
                                                    <View style={styles.noCoachNumberContainer}>
                                                        <Text style={styles.noCoachNumber}>2</Text>
                                                    </View>
                                                    <Text style={styles.noCoachPro}>{i18n.t('screens')['coaching']['getAccessToClientData']}</Text>
                                                </View>
                                                <View style={styles.noCoachProContainer}>
                                                    <View style={styles.noCoachNumberContainer}>
                                                        <Text style={styles.noCoachNumber}>3</Text>
                                                    </View>
                                                    <Text style={styles.noCoachPro}>{i18n.t('screens')['coaching']['getTheMost']}</Text>
                                                </View>
                                                <Pressable style={({ pressed }) => [
                                                    globalStyles.authPageActionButton,
                                                    {
                                                        opacity: pressed ? 0.1 : 1,
                                                        marginTop: 30
                                                    }
                                                ]} onPress={() => {
                                                    this.props.navigation.navigate("CoachingApplicationSubmission");
                                                }}>
                                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['coaching']['submitApplication']}</Text>
                                                </Pressable>
                                            </View>
                                            : <>
                                                {
                                                    this.state.coaching.myClients.clients.length > 0
                                                        && this.state.coaching.myClients.trainerObject
                                                        ? <>
                                                            <Text style={styles.coachingSectionTitle}>{i18n.t('screens')['coaching']['clients']}</Text>
                                                            {
                                                                this.state.coaching.myClients.clients.map((client, index) =>
                                                                    <Pressable style={({ pressed }) => [
                                                                        {
                                                                            opacity: pressed ? 0.1 : 1,
                                                                        }
                                                                    ]} key={index} onPress={() => {
                                                                        this.props.navigation.navigate("Client", {
                                                                            client
                                                                        })
                                                                    }}>
                                                                        <View style={styles.requestItem}>
                                                                            <View style={styles.requestItemProfile}>
                                                                                {
                                                                                    !client.clientInstance.profilePicture
                                                                                        ? <View style={styles.profilePictureContainer}>
                                                                                            <Text style={styles.noProfilePictureText}>
                                                                                                {client.clientInstance.firstName.charAt(0)}
                                                                                                {client.clientInstance.lastName.charAt(0)}
                                                                                            </Text>
                                                                                        </View>
                                                                                        : <Image style={styles.profilePictureContainer}
                                                                                            source={{ uri: client.clientInstance.profilePicture }} />
                                                                                }
                                                                                <Text style={styles.names}>
                                                                                    {client.clientInstance.firstName}
                                                                                    &nbsp;
                                                                                    {client.clientInstance.lastName}
                                                                                </Text>
                                                                            </View>
                                                                            <Pressable style={({ pressed }) => [
                                                                                {
                                                                                    opacity: pressed ? 0.1 : 1,
                                                                                }
                                                                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                                                                this.setState({ showEndRelationModal: true, relationToBeEndedId: client._id, statusToBeUpdated: "CANCELED" })
                                                                            }}>
                                                                                <MaterialCommunityIcons name="delete" size={20} color="#ddd" />
                                                                            </Pressable>
                                                                        </View>
                                                                    </Pressable>
                                                                )
                                                            }
                                                        </>
                                                        : <>
                                                            {
                                                                this.state.coaching.myClients.trainerObject.status == "PENDING"
                                                                    || this.state.coaching.myClients.trainerObject.status == "BLOCKED"
                                                                    ? <View style={styles.coachProfileNotationContainer}>
                                                                        <Text style={[styles.coachProfileStatus, {
                                                                            color: this.state.coaching.myClients.trainerObject.status == "PENDING"
                                                                                ? "#1f6cb0"
                                                                                : this.state.coaching.myClients.trainerObject.status == "BLOCKED"
                                                                                    ? "red"
                                                                                    : "black"
                                                                        }]}>
                                                                            {
                                                                                this.state.coaching.myClients.trainerObject.status == "PENDING"
                                                                                    ? "UNDER REVIEW"
                                                                                    : this.state.coaching.myClients.trainerObject.status == "BLOCKED"
                                                                                        ? "BLOCKED"
                                                                                        : "ACTIVE"
                                                                            }
                                                                        </Text>
                                                                        <Text style={globalStyles.notation}>{this.personalTrainerStatusMessages[this.state.coaching.myClients.trainerObject.status]}</Text>
                                                                    </View>
                                                                    : <Text style={globalStyles.notation}>{this.personalTrainerStatusMessages[this.state.coaching.myClients.trainerObject.status]}</Text>

                                                            }
                                                        </>
                                                }
                                            </>
                                    }
                                </ScrollView>
                            : null
                    }
                </View>
            </View>
        )
    }
}
