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

        this.query = "";

        this.typingTimeout = null

        this.state = {
            query: "",
            queryResults: [],
            recent: [],
            showError: false,
            error: ""
        }

        this.focusListener;

        this.searchInputRef = React.createRef();
    }

    onFocusFunction = () => {
        this.setState({ timezoneOffset: this.props.route.params.timezoneOffset || new Date().getTimezoneOffset(), date: this.props.route.params.date, query: this.props.route.params.query || "" }, () => {
            this.getRecent();
            this.searchFood();
        })
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction();
        })
    }

    searchFood = () => {
        ApiRequests.get(`calories-counter/search/food?words=${this.query.toLowerCase()}`, {}, true).then((response) => {
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

    getRecent = () => {
        ApiRequests.get(`calories-counter/recent`, {}, true).then((response) => {
            this.setState({ recent: response.data.items });
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

    changeQuery = (value) => {
        this.query = value;

        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.typingTimeout = setTimeout(() => {
            this.searchFood();
        }, 600);
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
                    <View style={styles.searchContainer}>
                        <TextInput
                            ref={this.searchInputRef}
                            style={[globalStyles.authPageInput, {
                                width: "90%"
                            }]}
                            placeholder="Type your search here"
                            onChangeText={this.changeQuery} />
                        <TouchableOpacity onPress={() => {
                            this.query = "";
                            this.searchInputRef.current.value = ""
                            this.searchFood();
                        }} style={{ width: "10%", marginLeft: 12 }}>
                            <Ionicons name="close" size={24} color="#1f6cb0" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.searchResultsContainer}>
                        <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                            {
                                this.state.queryResults.length <= 0
                                    ? <Text style={[globalStyles.notation, { marginBottom: 16 }]}>No results found</Text>
                                    : null
                            }
                            {
                                this.state.recent?.length > 0 && this.query.length <= 0
                                    ? <>
                                        <Text style={[globalStyles.modalText, { textAlign: "left", fontFamily: "MainBlack", color: "#1f6cb0" }]}>Recent foods</Text>
                                        {
                                            this.state.recent.map((item, index) =>
                                                <TouchableOpacity key={"_" + index} onPress={() => {
                                                    this.props.navigation.navigate("AddCaloriesIntakeItem", {
                                                        intent: CALORIES_COUNTER_SCREEN_INTENTS.ADD,
                                                        item: item.itemInstance,
                                                        meal: this.props.route.params.meal,
                                                        date: this.props.route.params.date,
                                                        timezoneOffset: this.props.route.params.timezoneOffset,
                                                        amount: item.amount
                                                    })
                                                }}>
                                                    <View style={styles.searchResult} key={item._id}>
                                                        <Text style={styles.searchResultTitle}>{item.itemInstance.title}</Text>
                                                        {
                                                            item.itemInstance.brand
                                                                ? <Text style={styles.searchResultBrand}>{item.itemInstance.brand}</Text>
                                                                : null
                                                        }
                                                        {
                                                            item.itemInstance.userInstance
                                                                ? <View style={styles.user}>
                                                                    {
                                                                        !item.itemInstance.userInstance.profilePicture
                                                                            ? <View style={styles.profilePictureContainer}>
                                                                                <Text style={styles.noProfilePictureText}>
                                                                                    {item.itemInstance.userInstance.firstName.charAt(0)}
                                                                                    {item.itemInstance.userInstance.lastName.charAt(0)}
                                                                                </Text>
                                                                            </View>
                                                                            : <Image style={styles.profilePictureContainer}
                                                                                source={{ uri: item.itemInstance.userInstance.profilePicture }} />
                                                                    }
                                                                    <Text style={styles.names}>
                                                                        {item.itemInstance.userInstance.firstName}
                                                                        &nbsp;
                                                                        {item.itemInstance.userInstance.lastName}
                                                                    </Text>
                                                                </View>
                                                                : null
                                                        }
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        }
                                        <View style={{ borderWidth: 0.75, borderColor: "#e7e7e7", marginVertical: 16 }}></View>
                                    </>
                                    : null
                            }
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
                                    : null
                            }
                        </ScrollView>
                    </View>
                </View>
            </View>
        )
    }
}
