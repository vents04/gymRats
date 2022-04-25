import React, { Component } from 'react'
import { ScrollView, Text, View } from 'react-native'

import ApiRequests from '../../classes/ApiRequests';

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

    componentDidMount() {
        this.getRequests();
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
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("Coaching")
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </TouchableOpacity>
                        <Text style={globalStyles.followUpScreenTitle}>Unanswered requests</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    {
                        this.state.relations?.length > 0
                            ? <>
                                <Text style={[globalStyles.notation, { marginTop: 24 }]}>Users that have requested to be coached by you:</Text>
                                <ScrollView style={{ marginTop: 14 }}>
                                    {
                                        this.state.relations.map((relation, index) =>
                                            <CoachRequestsItem key={index} relation={relation} updateRelationStatus={this.updateRelationStatus} />
                                        )
                                    }
                                </ScrollView>
                            </>
                            : <Text style={globalStyles.notation}>You do not have any requests from potential clients</Text>
                    }
                </View>
            </View>
        )
    }
}
