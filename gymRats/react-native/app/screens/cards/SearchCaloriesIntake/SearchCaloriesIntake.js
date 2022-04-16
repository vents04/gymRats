import React, { Component } from 'react'
import { Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BiArrowBack } from 'react-icons/bi';
import ApiRequests from '../../../classes/ApiRequests';
import { CALORIES_COUNTER_SCREEN_INTENTS, HTTP_STATUS_CODES } from '../../../../global';

const globalStyles = require('../../../../assets/styles/global.styles');
const styles = require('./SearchCaloriesIntake.styles');

export default class SearchCaloriesIntake extends Component {

    state = {
        query: "banana",
        queryResults: [],
        showError: false,
        error: ""
    }

    componentDidMount() {
        this.searchFood();
    }

    searchFood = () => {
        ApiRequests.get(`calories-counter/search/food?query=${this.state.query.toLowerCase()}`, {}, true).then((response) => {
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
                        <BiArrowBack size={25} onClick={() => {
                            this.props.navigation.navigate("CaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Search food for {this.props.route.params.meal.toLowerCase()}</Text>
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
                                                intent: CALORIES_COUNTER_SCREEN_INTENTS.ADD,
                                                item: item,
                                                meal: this.props.route.params.meal,
                                                date: this.props.route.params.date,
                                                timezoneOffset: this.props.route.params.timezoneOffset
                                            })
                                        }} key={item._id}>
                                            <Text style={styles.searchResultTitle}>{item.title}</Text>
                                            {
                                                item.brand
                                                && <Text style={styles.searchResultBrand}>{item.brand}</Text>
                                            }
                                            {
                                                item.userInstance
                                                && <View style={styles.user}>
                                                    {
                                                        !item.userInstance.profilePicture
                                                            ? <View style={styles.profilePictureContainer}>
                                                                <Text style={styles.noProfilePictureText}>
                                                                    {item.userInstance.firstName.charAt(0)}
                                                                    {item.userInstance.lastName.charAt(0)}
                                                                </Text>
                                                            </View>
                                                            : <Image style={styles.profilePictureContainer}
                                                                source={{ uri: item.userInstance.profilePicture }} />
                                                    }
                                                    <Text style={styles.names}>
                                                        {item.userInstance.firstName}
                                                        &nbsp;
                                                        {item.userInstance.lastName}
                                                    </Text>
                                                </View>
                                            }
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
