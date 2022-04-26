import React, { Component } from 'react';
import { Image, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import ApiRequests from '../../classes/ApiRequests';

import LogoBar from '../../components/LogoBar/LogoBar';

import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES, WEIGHT_UNITS } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Profile.styles';
import Auth from '../../classes/Auth';

export default class Profile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showLoadProfileError: false,
            profile: null,
            showSaving: false,
            showError: false,
            error: ""
        }

        this.focusListener;
    }

    onFocusFunction = () => {
        this.loadProfile();
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
    }

    loadProfile = () => {
        ApiRequests.get('user', {}, true).then((response) => {
            this.setState({ profile: response.data.user });
        }).catch((error) => {
            this.setState({ showLoadProfileError: true });
        });
    }

    navigateToProfileDetailsEdit = () => {
        this.props.navigation.navigate('ProfileDetailsEdit', {
            profile: this.state.profile
        });
    }

    pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.cancelled) {
            this.uploadProfilePicture(result);
        }
    };

    uploadProfilePicture = (result) => {
        ApiRequests.put('user', {}, {
            profilePicture: result.uri,
        }, true).then((response) => {
            this.loadProfile();
        }).catch((error) => {
            this.setState({
                showError: true,
                error: error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
                    ? "There was a problem uploading the profile picture. Please try again or contact support at support@uploy.app"
                    : "Internal server error"
            })
        })
    }

    logout = async () => {
        await Auth.removeToken();
        this.props.navigation.reset({
            index: 0,
            routes: [{ name: "Auth" }],
        });
    }

    render() {
        return <View style={[globalStyles.safeAreaView]}>
            <View style={globalStyles.pageContainer}>
                <LogoBar />
                <TouchableOpacity style={globalStyles.topbarIconContainer} onPress={() => {
                    this.navigateToProfileDetailsEdit();
                }}>
                    <Feather name="edit" size={30} color="#1f6cb0" />
                </TouchableOpacity>
                {
                    this.state.showError
                        ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                        : null
                }
                {
                    this.state.showLoadProfileError
                        ? <Text style={globalStyles.errorBox}>There was a problem loading your profile. Try again or contact support on office@uploy.app</Text>
                        : null
                }
                {
                    this.state.profile != null
                        ? <View style={styles.profileContainer}>
                            <View style={styles.profileContainerTopbar}>
                                <TouchableOpacity onPress={() => {
                                    if (!this.state.showSaving) this.pickImage()
                                }}>
                                    {
                                        !this.state.profile.profilePicture
                                            ? <View style={styles.profilePictureContainer}>
                                                <Text style={styles.noProfilePictureText}>
                                                    {this.state.profile.firstName.charAt(0)}
                                                    {this.state.profile.lastName.charAt(0)}
                                                </Text>
                                            </View>
                                            : <Image style={styles.profilePictureContainer}
                                                source={{ uri: this.state.profile.profilePicture }} />
                                    }
                                </TouchableOpacity>
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
                                <Text style={styles.names}>
                                    {this.state.profile.firstName}
                                    &nbsp;
                                    {this.state.profile.lastName}
                                </Text>
                                <Text style={styles.email}>{this.state.profile.email}</Text>
                                <TouchableOpacity onPress={() => {
                                    this.logout();
                                }}>
                                    <Text style={styles.highlightedText}>Logout</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.commonDataContainer}>
                                <View style={styles.commonDataSection}>
                                    <View>
                                        <Text style={styles.commonDataSectionTitle}>Weight unit</Text>
                                        <Text style={styles.commonDataSectionValue}>
                                            {
                                                this.state.profile.weightUnit == WEIGHT_UNITS.KILOGRAMS
                                                    ? "Metric system (kilograms)"
                                                    : "Imperial system (pounds)"
                                            }
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => {
                                        this.navigateToProfileDetailsEdit();
                                    }}>
                                        <MaterialIcons name="edit" size={25} color="#1f6cb0" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        : !this.state.showLoadProfileError
                            ? <Text style={globalStyles.notation}>Loading...</Text>
                            : null
                }
            </View>
        </View>;
    }
}
