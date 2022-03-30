import React, { Component } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { HTTP_STATUS_CODES } from '../../../global';
import ApiRequests from '../../classes/ApiRequests';
import { MdOutlineFitnessCenter } from 'react-icons/md';
import { BsShieldFillCheck } from 'react-icons/bs';
import { HiInbox } from 'react-icons/hi';
import { Badge } from 'react-native-elements';
import { AiFillDelete } from 'react-icons/ai';
import ConfirmationBox from '../../components/ConfirmationBox/ConfirmationBox';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Coaching.styles')

export default class Coaching extends Component {

    state = {
        activeTab: "myCoach",
        showError: false,
        error: "",
        coaching: null,
        relations: [],
        showEndRelationModal: false,
        relationToBeEndedId: null,
        statusToBeUpdated: "CANCELED"
    }

    personalTrainerStatusMessages = {
        "PENDING": "Your coach account is being reviewed by our team and will become active soon",
        "ACTIVE": "You do not have any clients, yet",
        "BLOCKED": "You have been blocked by our team. Contact us at support@uploy.app for more information",
    }

    focusListener;

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

    componentWillUnmount() {
        if (this.focusListener) this.focusListener()
    }

    getCoachingPageState = () => {
        ApiRequests.get("coaching", {}, true).then((response) => {
            this.setState({ coaching: response.data.coaching });
            console.log(response.data.coaching);
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
            this.setState({showEndRelationModal: false});
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
        ApiRequests.get("coaching/relation", {}, true).then((response) => {
            console.log(response);
            this.setState({requests: response.data.requests});
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
        this.setState({showEndRelationModal: state});
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                {
                    this.state.showEndRelationModal
                    && <ConfirmationBox deleteCard={() => {this.updateStatus(this.state.relationToBeEndedId, this.state.statusToBeUpdated)}} toggleShowConfirmationBox={this.toggleShowEndRelationModal}/>
                }
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.pageLogoContainer}>
                        <Image style={globalStyles.pageLogo} source={require('../../../assets/img/icon.png')} />
                        <Text style={globalStyles.pageLogoText}>Gym Rats</Text>
                    </View>
                    {
                        this.state.relations.length > 0 &&
                        <View style={globalStyles.topbarIconContainer} onClick={() => { 
                            this.props.navigation.navigate("CoachRequests", {relations: this.state.relations});
                        }}>
                            <HiInbox size={30} color="#1f6cb0" />
                                <Badge
                                    status="error"
                                    value={this.state.relations.length}
                                    textStyle={{ fontFamily: "SpartanMedium" }}
                                    containerStyle={{ position: 'absolute', top: 8, right: 8, height: 12, width: 12 }}
                                />
                        </View>
                    }
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <View style={styles.tabsContainer}>
                        <Text style={[styles.tabTitle, {
                            color: this.state.activeTab == "myCoach" ? "#1f6cb0" : "#aaa"
                        }]} onClick={() => {
                            this.setState({ activeTab: "myCoach" });
                            this.getCoachingPageState();
                        }}>My couch</Text>
                        <Text style={[styles.tabTitle, {
                            color: this.state.activeTab == "myClients" ? "#1f6cb0" : "#aaa"
                        }]} onClick={() => {
                            this.setState({ activeTab: "myClients" });
                            this.getCoachingPageState();
                        }}>My clients</Text>
                    </View>
                    {
                        this.state.coaching
                            ? this.state.activeTab == "myCoach"
                                ? <View style={styles.tabContent}>
                                    {
                                        !this.state.coaching.myCoach.hasCoaches && !this.state.coaching.myCoach.hasRelations
                                            ? <View style={styles.noCoachContainer}>
                                                <View style={styles.noCoachTopbar}>
                                                    <MdOutlineFitnessCenter size={25} color="#1f6cb0" />
                                                    <Text style={styles.noCoachTitle}>Get in shape with Gym Rats</Text>
                                                </View>
                                                <Text style={styles.noCoachDescription}>All of our coaches are:</Text>
                                                <View style={styles.noCoachProContainer}>
                                                    <BsShieldFillCheck color="#1f6cb0" style={styles.noCoachProIcon} />
                                                    <Text style={styles.noCoachPro}>Single handedly approved by us</Text>
                                                </View>
                                                <View style={styles.noCoachProContainer}>
                                                    <BsShieldFillCheck color="#1f6cb0" style={styles.noCoachProIcon} />
                                                    <Text style={styles.noCoachPro}>Motivated and ready to help</Text>
                                                </View>
                                                <View style={styles.noCoachProContainer}>
                                                    <BsShieldFillCheck color="#1f6cb0" style={styles.noCoachProIcon} />
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
                                                    this.state.coaching.myCoach.hasCoaches &&
                                                    <>
                                                        <Text style={styles.coachingSectionTitle}>Coaches</Text>
                                                        {
                                                            this.state.coaching.myCoach.coaches.map((coach) => 
                                                            <View style={styles.requestItem}>
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
                                                                <AiFillDelete size={20} onClick={() => {
                                                                    this.setState({showEndRelationModal: true, relationToBeEndedId: coach._id, statusToBeUpdated: "CANCELED"})
                                                                }}/>
                                                            </View>
                                                            )}
                                                    </>
                                                }
                                                {
                                                    this.state.coaching.myCoach.hasRelations &&
                                                    <>
                                                        <Text style={styles.coachingSectionTitle}>Unanswered requests</Text>
                                                        {
                                                            this.state.coaching.myCoach.relations.map((relation) => 
                                                            <View style={styles.requestItem}>
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
                                                                <AiFillDelete size={20} onClick={() => {
                                                                    this.deleteRequest(relation._id);
                                                                }}/>
                                                            </View>
                                                        )
                                                        }
                                                    </>
                                                }
                                            </>
                                    }
                                </View>
                                : <View style={styles.tabContent}>
                                    {
                                        !this.state.coaching.myClients.isPersonalTrainer
                                            ? <View style={styles.noCoachContainer}>
                                                <View style={styles.noCoachTopbar}>
                                                    <MdOutlineFitnessCenter size={25} color="#1f6cb0" />
                                                    <Text style={styles.noCoachTitle}>Be a couch at Gym Rats</Text>
                                                </View>
                                                <Text style={styles.noCoachDescription}>Catch the opportunity to:</Text>
                                                <View style={styles.noCoachProContainer}>
                                                    <BsShieldFillCheck color="#1f6cb0" style={styles.noCoachProIcon} />
                                                    <Text style={styles.noCoachPro}>Work with people locally and internationally</Text>
                                                </View>
                                                <View style={styles.noCoachProContainer}>
                                                    <BsShieldFillCheck color="#1f6cb0" style={styles.noCoachProIcon} />
                                                    <Text style={styles.noCoachPro}>Get access to your clients' Gym Rats data (logbooks, diet, weight and etc.)</Text>
                                                </View>
                                                <View style={styles.noCoachProContainer}>
                                                    <BsShieldFillCheck color="#1f6cb0" style={styles.noCoachProIcon} />
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
                                                                this.state.coaching.myClients.clients.map((client) => 
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
                                                                    <AiFillDelete size={20} onClick={() => {
                                                                        this.setState({showEndRelationModal: true, relationToBeEndedId: client._id, statusToBeUpdated: "CANCELED"})
                                                                    }}/>
                                                                </View>
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

    /*
Be able to have access to your clients' data in Gym Rats. You can check what they are eating, what they are training and many more
Get the most of what you have earned. Gym Rats will get only 5% cut from your earnings through the app. We do not require you to receive payments through our system
    */
}
