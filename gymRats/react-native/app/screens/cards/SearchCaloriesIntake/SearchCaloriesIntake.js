import React, { Component } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

import ApiRequests from '../../../classes/ApiRequests';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

import { CALORIES_COUNTER_SCREEN_INTENTS, HTTP_STATUS_CODES } from '../../../../global';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './SearchCaloriesIntake.styles';

export default class SearchCaloriesIntake extends Component {

    constructor(props) {
        super(props);

        this.state = {
            query: "",
            queryResults: [],
            showError: false,
            error: ""
        }

        this.focusListener;
    }

    onFocusFunction = () => {
        this.setState({ timezoneOffset: this.props.route.params.timezoneOffset || new Date().getTimezoneOffset(), date: this.props.route.params.date, query: this.props.route.params.query || "" }, () => {
            this.searchFood();
        })
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction();
        })
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
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("CaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </TouchableOpacity>
                        <Text style={globalStyles.followUpScreenTitle}>Search food</Text>
                    </View>
                    <View style={globalStyles.topbarIconContainer}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("AddFood", {
                                timezoneOffset: this.state.timezoneOffset,
                                date: this.state.date,
                                onGoBack: () => {
                                    this.props.navigation.navigate("SearchCaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
                                }
                            })
                        }}>
                            <MaterialIcons name="library-add" size={25} color="#1f6cb0" style={{ marginRight: 12 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("BarcodeReader", {
                                meal: this.props.route.params.meal,
                                date: this.props.route.params.date,
                                timezoneOffset: this.props.route.params.timezoneOffset,
                                onGoBack: () => {
                                    this.props.navigation.navigate("SearchCaloriesIntake", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
                                }
                            })
                        }}>
                            <MaterialCommunityIcons name="barcode-scan" size={25} color="#1f6cb0" />
                        </TouchableOpacity>
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
                        <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                            {
                                this.state.queryResults?.length > 0
                                    ? this.state.queryResults.map((item, index) =>
                                        <TouchableOpacity key={index} onPress={() => {
                                            this.props.navigation.navigate("AddCaloriesIntakeItem", {
                                                intent: CALORIES_COUNTER_SCREEN_INTENTS.ADD,
                                                item: item,
                                                meal: this.props.route.params.meal,
                                                date: this.props.route.params.date,
                                                timezoneOffset: this.props.route.params.timezoneOffset
                                            })
                                        }}>
                                            <View style={styles.searchResult} key={item._id}>
                                                <Text style={styles.searchResultTitle}>{item.title}</Text>
                                                {
                                                    item.brand
                                                        ? <Text style={styles.searchResultBrand}>{item.brand}</Text>
                                                        : null
                                                }
                                                {
                                                    item.userInstance
                                                        ? <View style={styles.user}>
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
                                                        : null
                                                }
                                            </View>
                                        </TouchableOpacity>
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
