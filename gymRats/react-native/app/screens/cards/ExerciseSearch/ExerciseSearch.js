import React, { Component } from 'react'
import { ScrollView, Text, TextInput, Pressable, View, BackHandler, Image } from 'react-native'
import i18n from 'i18n-js';

import ApiRequests from '../../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../../global';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './ExerciseSearch.styles';

export default class ExerciseSearch extends Component {

    constructor(props) {
        super(props);

        this.typingTimeout = null

        this.query = ""

        this.state = {
            queryResults: [],
            showError: false,
            error: ""
        }

        this.scrollV = React.createRef();
    }

    backAction = () => {
        this.props.navigation.navigate("Logbook", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
        return true;
    }

    componentDidMount() {
        this.searchExercises();
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    searchExercises = () => {
        ApiRequests.get(`logbook/search?words=${this.query.toLowerCase()}`, {}, true).then((response) => {
            if (response.data.results) this.setState({ queryResults: response.data.results });
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
                    this.setState({ showError: true, error: error.response.data });
                } else {
                    ApiRequests.showInternalServerError();
                }
            } else if (error.request) {
                ApiRequests.showNoResponseError();
            } else {
                ApiRequests.showRequestSettingError();
            }
        });
    }

    changeQuery = (value) => {
        this.query = value.trim();

        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.typingTimeout = setTimeout(() => {
            this.searchExercises();
        }, 600);
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
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['exerciseSearch']['title']}</Text>
                    </View>
                    <TextInput
                        style={[globalStyles.authPageInput, {
                            marginTop: 20
                        }]}
                        placeholder={i18n.t('screens')['exerciseSearch']['searchInputPlaceholder']}
                        onChangeText={this.changeQuery} />
                    <View style={styles.searchResultsContainer}>
                        <ScrollView ref={this.scrollV} contentContainerStyle={globalStyles.fillEmptySpace}>
                            {
                                this.state.queryResults.map((exercise, index) =>
                                    <Pressable style={({ pressed }) => [
                                        {
                                            opacity: pressed ? 0.1 : 1,
                                        }
                                    ]} key={index} onPress={() => {
                                        this.props.navigation.navigate("Logbook", {
                                            exercise: exercise,
                                            date: this.props.route.params.date,
                                            timezoneOffset: this.props.route.params.timezoneOffset
                                        })
                                    }}>
                                        <View style={styles.searchResult}>
                                            <Image source={{ uri: exercise.video }} style={styles.exerciseGif} />
                                            <View style={styles.searchResultRight}>
                                                <Text style={styles.searchResultTitle}>{exercise.title}</Text>
                                                <Text style={styles.searchResultStats}>{i18n.t('screens')['exerciseSearch']['usageStat'][0]} {exercise.timesUsed ? exercise.timesUsed : 0} {i18n.t('screens')['exerciseSearch']['usageStat'][1]}</Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                )
                            }
                        </ScrollView>
                    </View>
                </View>
            </View>
        )
    }
}
