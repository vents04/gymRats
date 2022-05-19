import React, { Component } from 'react'
import { Image, Text, View, ScrollView, TextInput, Pressable } from 'react-native';

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Suggestions.styles';
import LogoBar from '../../components/LogoBar/LogoBar';

export default class Suggestions extends Component {

    constructor(props) {
        super(props);

        this.state = {
            suggestions: [],
            suggestion: ""
        }

        this.scrollView = React.createRef();

        this.suggestionStatusTitles = {
            PENDING_REVIEW: "Pending review",
            ANSWERED: "Answered"
        }

        this.focusListener;
    }

    onFocusFunction = () => {
        this.getSuggestions();
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
    }

    postSuggestion = () => {
        ApiRequests.post(`user/suggestion`, {}, {
            suggestion: this.state.suggestion
        }, true).then((response) => {
            this.setState({ suggestion: "" });
            this.getSuggestions();
            this.scrollView.current.scrollToEnd({ animated: true });
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
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

    getSuggestions = () => {
        ApiRequests.get(`user/suggestion`, {}, true).then((response) => {
            this.setState({ suggestions: response.data.suggestions })
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
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
                            this.props.navigation.goBack();
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </Pressable>
                        <Text style={globalStyles.followUpScreenTitle}>Suggestions</Text>
                    </View>
                    <Text style={styles.descriptionText}>Gym Rats values your opinion and that is why you can message us about bugs, suggestions and wanted features.</Text>
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
                        placeholder="Type here..."
                        onChangeText={(val) => { this.setState({ suggestion: val }) }} />
                    <View style={styles.chatActionButtonContainer}>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 15 }} onPress={() => {
                            this.postSuggestion();
                        }}>
                            <Ionicons name="ios-send" size={24} style={styles.chatInputButton} color="#1f6cb0" />
                        </Pressable>
                    </View>

                </View>
            </View>
        )
    }
}
