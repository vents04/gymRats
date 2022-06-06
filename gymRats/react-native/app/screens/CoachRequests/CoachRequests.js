import React, { Component } from 'react'
import { ScrollView, Text, Pressable, View, BackHandler } from 'react-native'

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import CoachRequestsItem from '../../components/CoachRequestsItem/CoachRequestsItem';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';

export default class CoachRequests extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showError: false,
            error: "",
            relations: []
        }
    }

    backAction = () => {
        this.props.navigation.navigate("Coaching")
        return true;
    }

    componentDidMount() {
        this.getRequests();
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    getRequests = () => {
        ApiRequests.get("coaching/requests", {}, true).then((response) => {
            this.setState({ relations: response.data.relations });
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

    updateRelationStatus = (id, status) => {
        ApiRequests.put(`coaching/relation/${id}/status`, {}, {
            status: status
        }, true).then((response) => {
            this.getRequests();
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
                    <View style={globalStyles.followUpScreenTopbar}>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.backAction();
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </Pressable>
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['coachRequests']['pageTitle']}</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    {
                        this.state.relations?.length > 0
                            ? <>
                                <ScrollView style={{ marginTop: 14 }}>
                                    {
                                        this.state.relations.map((relation, index) =>
                                            <CoachRequestsItem key={index} relation={relation} updateRelationStatus={this.updateRelationStatus} />
                                        )
                                    }
                                </ScrollView>
                            </>
                            : <Text style={globalStyles.notation}>{i18n.t('screens')['coachRequests']['pageDescriptor']}</Text>
                    }
                </View>
            </View>
        )
    }
}
