import React, { Component } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { HTTP_STATUS_CODES } from '../../../global';
import ApiRequests from '../../classes/ApiRequests';
import { MdOutlineFitnessCenter } from 'react-icons/md';
import { BsShieldFillCheck } from 'react-icons/bs';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Coaching.styles')

export default class Coaching extends Component {

    state = {
        activeTab: "myCoach",
        showError: false,
        error: "",
        coaching: null
    }

    componentDidMount() {
        this.getCoachingPageState();
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

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.pageLogoContainer}>
                        <Image style={globalStyles.pageLogo} source={require('../../../assets/img/logo.png')} />
                        <Text style={globalStyles.pageLogoText}>Gym Rats</Text>
                    </View>
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
                        this.state.activeTab == "myCoach" && this.state.coaching
                            ? <View style={styles.tabContent}>
                                {
                                    !this.state.coaching.myCoach.hasCoach
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
                                            }}>
                                                <Text style={globalStyles.authPageActionButtonText}>Search coaches</Text>
                                            </TouchableOpacity>
                                        </View>
                                        : null
                                }
                            </View>
                            : null
                    }
                </View>
            </View>
        )
    }
}
