import React, { Component } from 'react'
import { Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Progress.styles';
import LogoBar from '../../components/LogoBar/LogoBar';

export default class Progress extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: "",
            showError: false,
            progress: null
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
            console.log(response)
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
                    <LogoBar />
                </View>
            </View>
        )
    }
}
