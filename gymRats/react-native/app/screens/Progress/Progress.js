import React, { Component } from 'react'
import { Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

import { HTTP_STATUS_CODES, PROGRESS_NOTATION } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import { cardColors } from '../../../assets/styles/cardColors';
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
            this.setState({ progress: response.data });
        }).catch((error) => {
            console.log(error.response.data);
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
                                            <TouchableOpacity style={{ ...styles.progressFlagContainer, backgroundColor: cardColors.weightTracker }} onPress={() => { }}>
                                                <Text style={styles.progressFlag}>
                                                    {
                                                        this.state.progress.weightTrackerProgress == PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_LOSS
                                                            || this.state.progress.weightTrackerProgress == PROGRESS_NOTATION.INSUFFICIENT_WEIGHT_GAIN
                                                            ? "No change"
                                                            : this.state.progress.weightTrackerProgress == PROGRESS_NOTATION.SUFFICIENT_WEIGHT_LOSS
                                                                ? "Efficient weight loss"
                                                                : this.state.progress.weightTrackerProgress == PROGRESS_NOTATION.SUFFICIENT_WEIGHT_GAIN
                                                                    ? "Efficient weight gain"
                                                                    : this.state.progress.weightTrackerProgress == PROGRESS_NOTATION.RAPID_WEIGHT_LOSS
                                                                        ? "Too rapid weight loss"
                                                                        : this.state.progress.weightTrackerProgress == PROGRESS_NOTATION.RAPID_WEIGHT_GAIN
                                                                            ? "Too rapid weight gain"
                                                                            : null

                                                    }
                                                </Text>
                                                <Entypo name="info-with-circle" size={18} color="white" />
                                            </TouchableOpacity>
                                            <View style={styles.progressCardTips}>
                                                <Text style={styles.progressCardTipsTitle}>Tips to improve</Text>
                                                <View style={styles.progressCardTipContainer}>
                                                    <AntDesign style={styles.progressCardTipIcon} name="checkcircle" size={16} color={cardColors.weightTracker} />
                                                    <Text style={styles.progressCardTip}>Fasting 16 hours a day may help you lose weight quicker</Text>
                                                </View>
                                            </View>
                                        </View>
                                        : null
                                }
                            </>
                            : null
                    }
                </View>
            </View>
        )
    }
}
