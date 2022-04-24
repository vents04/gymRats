import React, { Component } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import ApiRequests from '../../classes/ApiRequests';

import { BiArrowBack, BiCheck } from 'react-icons/bi';

import { HTTP_STATUS_CODES, WEIGHT_UNITS } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './ProfileDetailsEdit.styles';

export default class ProfileDetailsEdit extends Component {

    constructor(props) {
        super(props);

        this.state = {
            weightUnit: WEIGHT_UNITS.POUNDS,
            firstName: "Ventsislav",
            lastName: "Dimitrov",
            profile: {},
            showError: false,
            error: "",
            hasChanges: false,
            showSaving: false
        }
    }

    componentDidMount() {
        const profile = this.props.route.params.profile;
        this.setState({
            weightUnit: profile.weightUnit,
            firstName: profile.firstName,
            lastName: profile.lastName,
            profile: profile
        })
    }

    saveChanges = (removeProfilePicture = false) => {
        this.setState({ showSaving: true });
        setTimeout(() => {
            if (!removeProfilePicture) {
                ApiRequests.put('user', {}, {
                    firstName: this.state.firstName,
                    lastName: this.state.lastName,
                    weightUnit: this.state.weightUnit,
                }, true).then((response) => {
                    this.setState({
                        profile: {
                            firstName: this.state.firstName,
                            lastName: this.state.lastName,
                            weightUnit: this.state.weightUnit,
                            profilePicture: this.state.profile.profilePicture
                        },
                        showSaving: false,
                        hasChanges: false
                    });
                }).catch((error) => {
                    this.setState({
                        showSaving: false,
                        showError: true,
                        error: error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
                            ? error.response.data
                            : "Internal server error"
                    })
                })
            } else {
                ApiRequests.put('user', {}, {
                    profilePicture: null
                }, true).then((response) => {
                    this.setState({
                        profile: {
                            firstName: this.state.firstName,
                            lastName: this.state.lastName,
                            weightUnit: this.state.weightUnit,
                            profilePicture: null
                        },
                        showSaving: false,
                        hasChanges: false
                    });
                }).catch((error) => {
                    this.setState({
                        showSaving: false,
                        showError: true,
                        error: error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
                            ? error.response.data
                            : "Internal server error"
                    })
                })
            }
        }, 1000);
    }

    changedValue = () => {
        this.setState({
            hasChanges: this.state.profile.weightUnit != this.state.weightUnit
                || this.state.profile.firstName != this.state.firstName
                || this.state.profile.lastName != this.state.lastName
        })
    }

    render() {
        return <View style={globalStyles.safeAreaView}>
            <View style={globalStyles.pageContainer}>
                <View style={globalStyles.followUpScreenTopbar}>
                    <BiArrowBack size={25} onClick={() => {
                        this.props.navigation.navigate("Profile")
                    }} />
                    <Text style={globalStyles.followUpScreenTitle}>Profile edit</Text>
                </View>
                {
                    this.state.hasChanges
                        ? <View style={globalStyles.topbarIconContainer} onClick={() => { this.saveChanges() }}>
                            <BiCheck size={30} color="#1f6cb0" />
                        </View>
                        : null
                }
                {
                    this.state.showSaving
                        ? <View style={styles.loadingContainer}>
                            <ActivityIndicator
                                animating={true}
                                size="small"
                                color="#1f6cb0" />
                            <Text style={[globalStyles.notation, {
                                marginLeft: 10
                            }]}>Saving...</Text>
                        </View>
                        : null
                }
                {
                    this.state.showError
                        ? <Text style={[globalStyles.errorBox, {
                            marginTop: 48
                        }]}>{this.state.error}</Text>
                        : null
                }
                <ScrollView style={styles.editSectionContainer} contentContainerStyle={globalStyles.fillEmptySpace}>
                    <View style={styles.editSection}>
                        <Text style={styles.editSectionTitle}>First name</Text>
                        <TextInput
                            value={this.state.firstName}
                            style={globalStyles.authPageInput}
                            placeholder="First name:"
                            editable={!this.state.showSaving}
                            onChangeText={(val) => { this.setState({ firstName: val, showError: false }, () => { this.changedValue() }); }} />
                    </View>
                    <View style={styles.editSection}>
                        <Text style={styles.editSectionTitle}>Last name</Text>
                        <TextInput
                            value={this.state.lastName}
                            style={globalStyles.authPageInput}
                            placeholder="First name:"
                            editable={!this.state.showSaving}
                            onChangeText={(val) => { this.setState({ lastName: val, showError: false }, () => { this.changedValue() }) }} />
                    </View>
                    <View style={styles.editSection}>
                        <Text style={styles.editSectionTitle}>Weight unit</Text>
                        <Picker
                            style={styles.editSectionInput}
                            enabled={!this.state.showSaving}
                            selectedValue={this.state.weightUnit}
                            onValueChange={(value, index) =>
                                this.setState({ weightUnit: value, showError: false }, () => { this.changedValue() })
                            }>
                            <Picker.Item label="Metric system (kilograms)" value="KILOGRAMS" />
                            <Picker.Item label="Imperial system (pounds)" value="POUNDS" />
                        </Picker>
                    </View>
                    {
                        this.state.profile.profilePicture
                            ? <TouchableOpacity style={globalStyles.authPageActionButton} disabled={this.state.showSaving} onPress={() => {
                                this.saveChanges(true);
                            }}>
                                <Text style={globalStyles.authPageActionButtonText}>Remove profile picture</Text>
                            </TouchableOpacity>
                            : null
                    }
                </ScrollView>
            </View>
        </View>;
    }
}
