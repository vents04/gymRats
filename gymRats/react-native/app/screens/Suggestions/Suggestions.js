import React, { Component } from 'react'
import { Image, Text, View, ScrollView, TextInput, Pressable, BackHandler, ActivityIndicator } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import i18n from 'i18n-js';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Suggestions.styles';
import LogoBar from '../../components/LogoBar/LogoBar';

export default class Suggestions extends Component {

    constructor(props) {
        super(props);

        this.state = {
            suggestions: [],
            suggestion: "",
            showSending: false
        }

        this.scrollView = React.createRef();

        this.suggestionStatusTitles = {
            PENDING_REVIEW: i18n.t('screens')['suggestions']['pendingReview'],
            ANSWERED: i18n.t('screens')['suggestions']['answered'],
        }

        this.focusListener;
    }

    backAction = () => {
        this.props.navigation.goBack();
    }

    onFocusFunction = () => {
        this.getSuggestions();
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    postSuggestion = () => {
        this.setState({ showSending: true }, () => {
            ApiRequests.post(`user/suggestion`, {}, {
                suggestion: this.state.suggestion
            }, true).then((response) => {
                this.setState({ suggestion: "" });
                this.getSuggestions();
                this.scrollView.current.scrollToEnd({ animated: true });
            }).catch((error) => {
                if (error.response) {
                    if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
                        ApiRequests.alert("Error", error.response.data);
                    } else {
                        ApiRequests.showInternalServerError();
                    }
                } else if (error.request) {
                    ApiRequests.showNoResponseError();
                } else {
                    ApiRequests.showRequestSettingError();
                }
            }).finally(() => {
                this.setState({ showSending: false })
            })
        });
    }

    getSuggestions = () => {
        ApiRequests.get(`user/suggestion`, {}, true).then((response) => {
            this.setState({ suggestions: response.data.suggestions })
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
                    ApiRequests.alert("Error", error.response.data);
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
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['suggestions']['pageTitle']}</Text>
                    </View>
                    <Text style={styles.descriptionText}>{i18n.t('screens')['suggestions']['incentive']}</Text>
                    <ScrollView ref={this.scrollView} style={[styles.chatMessagesContainer, {
                        marginTop: 16
                    }]}>
                        {
                            this.state.suggestions.map((suggestion, index) =>
                                <View style={styles.suggestionContainer} key={index}>
                                    <Text style={styles.suggestionStatus}>{this.suggestionStatusTitles[suggestion.status]}</Text>
                                    <Text style={styles.suggestion}>{suggestion.suggestion}</Text>
                                </View>
                            )
                        }
                    </ScrollView>
                </View>
                <View style={styles.chatInputContainer}>
                    <TextInput
                        value={this.state.suggestion}
                        style={styles.chatInput}
                        placeholder={i18n.t('screens')['suggestions']['placeholder']}
                        onChangeText={(val) => { this.setState({ suggestion: val }) }} />
                    <View style={styles.chatActionButtonContainer}>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 15 }} onPress={() => {
                            if (!this.state.showSending) this.postSuggestion();
                        }}>
                            {
                                !this.state.showSending
                                    ? <Ionicons name="ios-send" size={24} style={styles.chatInputButton} color="#1f6cb0" />
                                    : <ActivityIndicator
                                        size="small"
                                        color="#1f6cb0"
                                        animating={true} />
                            }
                        </Pressable>
                    </View>

                </View>
            </View>
        )
    }
}
