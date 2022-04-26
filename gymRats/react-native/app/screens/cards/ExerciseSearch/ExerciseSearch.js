import React, { Component } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

import ApiRequests from '../../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../../global';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './ExerciseSearch.styles';

export default class ExerciseSearch extends Component {

    constructor(props) {
        super(props);

        this.state = {
            query: "",
            queryResults: [],
            showError: false,
            error: ""
        }

        this.scrollV = React.createRef();
    }

    componentDidMount() {
        this.searchExercises();
        setTimeout(() => {
            console.log(this.scrollV.current.offsetWidth)
            console.log(this.scrollV.current.offsetHeight)
        }, 5000);
    }

    searchExercises = () => {
        ApiRequests.get(`logbook/search?words=${this.state.query.toLowerCase()}`, {}, true).then((response) => {
            if (response.data.results) this.setState({ queryResults: response.data.results });
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
        });
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("Logbook", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </TouchableOpacity>
                        <Text style={globalStyles.followUpScreenTitle}>Exercise search</Text>
                    </View>
                    <TextInput
                        value={this.state.query}
                        style={[globalStyles.authPageInput, {
                            marginTop: 20
                        }]}
                        placeholder="Type your search here"
                        onChangeText={(val) => {
                            this.setState({ query: val, showError: false }, () => {
                                this.searchExercises();
                            })
                        }} />
                    <View style={styles.searchResultsContainer}>
                        <ScrollView ref={this.scrollV} contentContainerStyle={globalStyles.fillEmptySpace}>
                            {
                                this.state.queryResults.map((exercise, index) =>
                                    <TouchableOpacity key={index} onPress={() => {
                                        this.props.navigation.navigate("Logbook", {
                                            exercise: exercise,
                                            date: this.props.route.params.date,
                                            timezoneOffset: this.props.route.params.timezoneOffset
                                        })
                                    }}>
                                        <View style={styles.searchResult}>
                                            <Text style={styles.searchResultTitle}>{exercise.title}</Text>
                                            <Text style={styles.searchResultStats}>Used in {exercise.sessionsCount} workout sessions</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }
                        </ScrollView>
                    </View>
                </View>
            </View>
        )
    }
}
