import React, { Component } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, Pressable, View, BackHandler } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

import { HTTP_STATUS_CODES, WEIGHT_UNITS } from '../../../global';
import { cardColors } from '../../../assets/styles/cardColors'

import globalStyles from '../../../assets/styles/global.styles';
import styles from './ProfileDetailsEdit.styles';

export default class ProfileDetailsEdit extends Component {

    constructor(props) {
        super(props);

        this.state = {
            weightUnit: WEIGHT_UNITS.POUNDS,
            firstName: "",
            lastName: "",
            profile: {},
            showError: false,
            error: "",
            hasChanges: false,
            showSaving: false
        }
    }

    backAction = () => {
        this.props.navigation.navigate("Profile")
        return true;
    }

    componentDidMount() {
        const profile = this.props.route.params.profile;
        this.setState({
            weightUnit: profile.weightUnit,
            firstName: profile.firstName,
            lastName: profile.lastName,
            profile: profile
        })
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
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
                    <Pressable style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.1 : 1,
                        }
                    ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                        this.backAction();
                    }}>
                        <Ionicons name="md-arrow-back-sharp" size={25} />
                    </Pressable>
                    <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['profileDetailsEdit']['pageTitle']}</Text>
                </View>
                {
                    this.state.hasChanges
                        ? <Pressable style={({ pressed }) => [
                            globalStyles.topbarIconContainer,
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.saveChanges()
                        }}>
                            <FontAwesome name="check" size={25} color={cardColors.caloriesIntake} />
                        </Pressable>
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
                            }]}>{i18n.t('screens')['profileDetailsEdit']['saving']}</Text>
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
                        <Text style={styles.editSectionTitle}>{i18n.t('screens')['profileDetailsEdit']['firstName']}</Text>
                        <TextInput
                            value={this.state.firstName}
                            style={globalStyles.authPageInput}
                            placeholder={i18n.t('screens')['profileDetailsEdit']['firstNamePlaceholder']}
                            editable={!this.state.showSaving}
                            onChangeText={(val) => { this.setState({ firstName: val, showError: false }, () => { this.changedValue() }); }} />
                    </View>
                    <View style={styles.editSection}>
                        <Text style={styles.editSectionTitle}>{i18n.t('screens')['profileDetailsEdit']['lastName']}</Text>
                        <TextInput
                            value={this.state.lastName}
                            style={globalStyles.authPageInput}
                            placeholder={i18n.t('screens')['profileDetailsEdit']['lastNamePlaceholder']}
                            editable={!this.state.showSaving}
                            onChangeText={(val) => { this.setState({ lastName: val, showError: false }, () => { this.changedValue() }) }} />
                    </View>
                    <View style={styles.editSection}>
                        <Text style={styles.editSectionTitle}>{i18n.t('screens')['profileDetailsEdit']['weightUnit']}</Text>
                        <Picker
                            style={styles.editSectionInput}
                            enabled={!this.state.showSaving}
                            selectedValue={this.state.weightUnit}
                            onValueChange={(value, index) =>
                                this.setState({ weightUnit: value, showError: false }, () => { this.changedValue() })
                            }>
                            <Picker.Item style={{ fontFamily: 'MainRegular' }} label={i18n.t('screens')['profileDetailsEdit']['KILLOGRAMS']} value="KILOGRAMS" />
                            <Picker.Item style={{ fontFamily: 'MainRegular' }} label={i18n.t('screens')['profileDetailsEdit']['POUNDS']} value="POUNDS" />
                        </Picker>
                    </View>
                    {
                        this.state.profile.profilePicture
                            ? <Pressable style={({ pressed }) => [
                                globalStyles.authPageActionButton,
                                {
                                    opacity: pressed ? 0.1 : 1,
                                }
                            ]} disabled={this.state.showSaving} onPress={() => {
                                this.saveChanges(true);
                            }}>
                                <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['profileDetailsEdit']['removeProfilePicture']}</Text>
                            </Pressable>
                            : null
                    }
                </ScrollView>
            </View>
        </View>;
    }
}
