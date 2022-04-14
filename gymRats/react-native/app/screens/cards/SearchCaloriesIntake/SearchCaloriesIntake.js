import React, { Component } from 'react'
import { Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BiArrowBack } from 'react-icons/bi';
import ApiRequests from '../../../classes/ApiRequests';
import { HTTP_STATUS_CODES } from '../../../../global';

const globalStyles = require('../../../../assets/styles/global.styles');
const styles = require('./SearchCaloriesIntake.styles');

export default class SearchCaloriesIntake extends Component {

    state = {
        query: "",
        queryResults: [],
        showError: false,
        error: ""
    }

    componentDidMount() {
        this.searchFood();
    }

    searchFood = () => {
        ApiRequests.get(`calories-counter/search/food?query=${this.state.query.toLowerCase()}`, {}, true).then((response) => {
            if (response.data.results) this.setState({ queryResults: response.data.results.hits });
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
                        <BiArrowBack size={25} onClick={() => {
                            this.props.navigation.navigate("CaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Search food</Text>
                    </View>
                    <TextInput
                        value={this.state.query}
                        style={[globalStyles.authPageInput, {
                            marginTop: 20
                        }]}
                        placeholder="Type your search here"
                        onChangeText={(val) => {
                            this.setState({ query: val, showError: false }, () => {
                                this.searchFood();
                            })
                        }} />
                    <View style={styles.searchResultsContainer}>
                        <ScrollView contentContainerStyle={{
                            flexGrow: 1,
                            flexShrink: 1
                        }}>
                            {
                                this.state.queryResults?.length > 0
                                    ? this.state.queryResults.map((item) =>
                                        <View style={styles.searchResult} onClick={() => {
                                            this.props.navigation.navigate("AddCaloriesIntakeItem", {
                                                item: item,
                                                date: this.props.route.params.date,
                                                timezoneOffset: this.props.route.params.timezoneOffset
                                            })
                                        }} key={item._id}>
                                            <Text style={styles.searchResultTitle}>{item.fields.item_name}</Text>
                                        </View>
                                    )
                                    : <Text style={globalStyles.notation}>No results found</Text>
                            }
                        </ScrollView>
                    </View>
                </View>
            </View>
        )
    }
}
