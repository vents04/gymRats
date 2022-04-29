import React, { Component } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from 'react-native-elements';

import ApiRequests from '../../classes/ApiRequests';

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
            "PENDING": "Your coach account is being reviewed by our team and will become active soon",
            "ACTIVE": "You do not have any clients, yet",
            "BLOCKED": "You have been blocked by our team. Contact us at support@uploy.app for more information",
        }

        this.focusListener;
    }

    onFocusFunction = () => {
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
            <View style={globalStyles.safeAreaView}>
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
                            ? <TouchableOpacity onPress={() => {
                                this.props.navigation.navigate("CoachRequests", { relations: this.state.relations });
                            }}>
                                <View style={globalStyles.topbarIconContainer}>
                                    <MaterialCommunityIcons name="inbox" size={30} color="#1f6cb0" />
                                    <Badge
                                        status="error"
                                        value={this.state.coaching.myClients.requests.length}
                                        textStyle={{ fontFamily: "MainMedium" }}
                                        containerStyle={{ position: 'absolute', top: 8, right: 8, height: 12, width: 12 }}
                                    />
                                </View>
                            </TouchableOpacity>
                            : null
                    }
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity style={styles.tabTitleContainer} onPress={() => {
                            this.setState({ activeTab: "myCoach" });
                            this.getCoachingPageState();
                        }}>
                            <Text style={[styles.tabTitle, {
                                color: this.state.activeTab == "myCoach" ? "#1f6cb0" : "#aaa"
                            }]}>Me as client</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tabTitleContainer} onPress={() => {
                            this.setState({ activeTab: "myClients" });
                            this.getCoachingPageState();
                        }}>
                            <Text style={[styles.tabTitle, {
                                color: this.state.activeTab == "myClients" ? "#1f6cb0" : "#aaa"
                            }]}>Me as coach</Text>
                        </TouchableOpacity>
                    </View>
                    {
                        this.state.coaching
                            ? this.state.activeTab == "myCoach"
                                ? <ScrollView style={styles.tabContent}>
                                    {
                                        !this.state.coaching.myCoach.hasCoaches && !this.state.coaching.myCoach.hasRelations
                                            ? <>
                                                <View style={styles.noCoachContainer}>
                                                    <View style={styles.noCoachTopbar}>
                                                        <FontAwesome5 name="dumbbell" size={25} color="#1f6cb0" />
                                                        <Text style={styles.noCoachTitle}>Get in shape with Gym Rats</Text>
                                                    </View>
                                                    <Text style={styles.noCoachDescription}>All of our coaches are:</Text>
                                                    <View style={styles.noCoachProContainer}>
                                                        <Ionicons name="shield-checkmark" size={24} color="#1f6cb0" style={styles.noCoachProIcon} />
                                                        <Text style={styles.noCoachPro}>Single handedly approved by us</Text>
                                                    </View>
                                                    <View style={styles.noCoachProContainer}>
                                                        <Ionicons name="shield-checkmark" size={24} color="#1f6cb0" style={styles.noCoachProIcon} />
                                                        <Text style={styles.noCoachPro}>Motivated and ready to help</Text>
                                                    </View>
                                                    <View style={styles.noCoachProContainer}>
                                                        <Ionicons name="shield-checkmark" size={24} color="#1f6cb0" style={styles.noCoachProIcon} />
                                                        <Text style={styles.noCoachPro}>Capable of training people with different goals</Text>
                                                    </View>
                                                    <TouchableOpacity style={[globalStyles.authPageActionButton, {
                                                        marginTop: 30
                                                    }]} onPress={() => {
                                                        this.props.navigation.navigate("CoachSearch");
                                                    }}>
                                                        <Text style={globalStyles.authPageActionButtonText}>Search coaches</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                {
                                                    this.state.coaching.myCoach.canceledRelations.length > 0
                                                        ? <>
                                                            <Text style={styles.coachingSectionTitle}>Relations without reviews</Text>
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
                                                                        }]}>This relation started at {new Date(relation.from).toLocaleDateString()}
                                                                            {
                                                                                relation.to
                                                                                    ? ` and ended at ${new Date(relation.to).toLocaleDateString()}`
                                                                                    : null
                                                                            }</Text>
                                                                        {
                                                                            !relation.hasReview
                                                                                ? <TouchableOpacity style={[globalStyles.authPageActionButton, {
                                                                                    marginTop: 12
                                                                                }]} onPress={() => {
                                                                                    this.props.navigation.navigate("PostReview", { relation })
                                                                                }}>
                                                                                    <Text style={globalStyles.authPageActionButtonText}>Leave a review</Text>
                                                                                </TouchableOpacity>
                                                                                : null
                                                                        }
                                                                    </View>
                                                                )}
                                                        </>
                                                        : null
                                                }
                                            </>
                                            : <>
                                                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                                                    marginBottom: 20
                                                }]} onPress={() => {
                                                    this.props.navigation.navigate("CoachSearch");
                                                }}>
                                                    <Text style={globalStyles.authPageActionButtonText}>Search coaches</Text>
                                                </TouchableOpacity>
                                                {
                                                    !this.state.coaching.myCoach.hasCoaches
                                                        ? <Text style={globalStyles.notation}>You still do not have any coaches</Text>
                                                        : null
                                                }
                                                {
                                                    this.state.coaching.myCoach.hasCoaches
                                                        ? <>
                                                            <Text style={styles.coachingSectionTitle}>Coaches</Text>
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
                                                                        <TouchableOpacity onPress={() => {
                                                                            this.setState({ showEndRelationModal: true, relationToBeEndedId: coach._id, statusToBeUpdated: "CANCELED" })
                                                                        }}>
                                                                            <MaterialCommunityIcons name="delete" size={25} color="#ddd" />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )}
                                                        </>
                                                        : null
                                                }
                                                {
                                                    this.state.coaching.myCoach.hasRelations
                                                        ? <>
                                                            <Text style={styles.coachingSectionTitle}>Unanswered requests</Text>
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
                                                                        <TouchableOpacity onPress={() => {
                                                                            this.deleteRequest(relation._id);
                                                                        }}>
                                                                            <MaterialCommunityIcons name="delete" size={20} color="#ddd" />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )
                                                            }
                                                        </>
                                                        : null
                                                }
                                            </>
                                    }
                                </ScrollView>
                                : <View style={styles.tabContent}>
                                    {
                                        this.state.coaching.myClients.isPersonalTrainer
                                            ? <TouchableOpacity style={[globalStyles.authPageActionButton, {
                                                marginBottom: 12
                                            }]} onPress={() => {
                                                this.props.navigation.navigate("CoachProfileEdit");
                                            }}>
                                                <Text style={globalStyles.authPageActionButtonText}>Open my coach profile</Text>
                                            </TouchableOpacity>
                                            : null
                                    }
                                    {
                                        !this.state.coaching.myClients.isPersonalTrainer
                                            ? <View style={styles.noCoachContainer}>
                                                <View style={styles.noCoachTopbar}>
                                                    <FontAwesome5 name="dumbbell" size={25} color="#1f6cb0" />
                                                    <Text style={styles.noCoachTitle}>Be a couch at Gym Rats</Text>
                                                </View>
                                                <Text style={styles.noCoachDescription}>Catch the opportunity to:</Text>
                                                <View style={styles.noCoachProContainer}>
                                                    <Ionicons name="shield-checkmark" size={24} color="#1f6cb0" style={styles.noCoachProIcon} />
                                                    <Text style={styles.noCoachPro}>Work with people locally and internationally</Text>
                                                </View>
                                                <View style={styles.noCoachProContainer}>
                                                    <Ionicons name="shield-checkmark" size={24} color="#1f6cb0" style={styles.noCoachProIcon} />
                                                    <Text style={styles.noCoachPro}>Get access to your clients' Gym Rats data (logbooks, diet, weight and etc.)</Text>
                                                </View>
                                                <View style={styles.noCoachProContainer}>
                                                    <Ionicons name="shield-checkmark" size={24} color="#1f6cb0" style={styles.noCoachProIcon} />
                                                    <Text style={styles.noCoachPro}>Get the most out of what you have earned through Gym Rats</Text>
                                                </View>
                                                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                                                    marginTop: 30
                                                }]} onPress={() => {
                                                    this.props.navigation.navigate("CoachingApplicationSubmission");
                                                }}>
                                                    <Text style={globalStyles.authPageActionButtonText}>Submit application</Text>
                                                </TouchableOpacity>
                                            </View>
                                            : <>
                                                {
                                                    this.state.coaching.myClients.clients.length > 0
                                                        && this.state.coaching.myClients.trainerObject
                                                        ? <>
                                                            <Text style={styles.coachingSectionTitle}>Clients</Text>
                                                            {
                                                                this.state.coaching.myClients.clients.map((client, index) =>
                                                                    <TouchableOpacity key={index} onPress={() => {
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
                                                                            <TouchableOpacity onPress={() => {
                                                                                this.setState({ showEndRelationModal: true, relationToBeEndedId: client._id, statusToBeUpdated: "CANCELED" })
                                                                            }}>
                                                                                <MaterialCommunityIcons name="delete" size={20} color="#ddd" />
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )
                                                            }
                                                        </>
                                                        : <>
                                                            <Text style={globalStyles.notation}>{this.personalTrainerStatusMessages[this.state.coaching.myClients.trainerObject.status]}</Text>
                                                        </>
                                                }
                                            </>
                                    }
                                </View>
                            : null
                    }
                </View>
            </View>
        )
    }
}
