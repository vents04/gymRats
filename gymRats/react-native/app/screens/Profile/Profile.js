import React, { Component } from 'react';
import { Image, Text, View, ActivityIndicator, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import ApiRequests from '../../classes/ApiRequests';
import socketClass from '../../classes/Socket';

import i18n from 'i18n-js';

import LogoBar from '../../components/LogoBar/LogoBar';

import { Feather, FontAwesome5 } from '@expo/vector-icons';
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
            base64: true,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.cancelled) {
            this.uploadProfilePicture(result.base64);
        }
    };

    uploadProfilePicture = (base64) => {
        ApiRequests.put('user', {}, {
            profilePicture: `data:image/jpg;base64,${base64}`,
        }, true).then((response) => {
            this.loadProfile();
        }).catch((error) => {
            this.setState({
                showError: true,
                error: error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")
                    ? i18n.ti18n.t('errors')['profilePictureUploadError']
                    : i18n.ti18n.t('errors')['internalServerError']
            })
        })
    }

    logout = async () => {
        await Auth.removeToken();

        let chatsRoomSocket = socketClass.getChatsRoomSocket();
        if(chatsRoomSocket){
          socketClass.getChatsRoomSocket().emit("disconnectUser")
          socketClass.setChatsRoomSocket(null);
        } 

        this.props.navigation.reset({
            index: 0,
            routes: [{ name: "Auth" }],
        });
    }

    render() {
        return <View style={[globalStyles.safeAreaView, { paddingTop: 32 }]}>
            <View style={globalStyles.pageContainer}>
                <LogoBar />
                <View style={globalStyles.topbarIconContainer}>
                    <Pressable hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }} onPress={() => {
                        this.props.navigation.navigate("Suggestions")
                    }} style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.1 : 1,
                        }
                    ]}>
                        <FontAwesome5 name="lightbulb" size={24} color={"#1f6cb0"} />
                    </Pressable>
                    <Pressable style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.1 : 1,
                            marginLeft: 24
                        }
                    ]} hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }} onPress={() => {
                        this.navigateToProfileDetailsEdit();
                    }}>
                        <Feather name="edit" size={30} color="#1f6cb0" />
                    </Pressable>
                </View>
                {
                    this.state.showError
                        ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                        : null
                }
                {
                    this.state.showLoadProfileError
                        ? <Text style={globalStyles.errorBox}>{i18n.t('errors')['loadProfileError']}</Text>
                        : null
                }
                {
                    this.state.profile != null
                        ? <View style={styles.profileContainer}>
                            <View style={styles.profileContainerTopbar}>
                                <Pressable style={({ pressed }) => [
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                    }
                                ]} onPress={() => {
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
                                </Pressable>
                                {
                                    this.state.showSaving
                                        ? <View style={styles.loadingContainer}>
                                            <ActivityIndicator
                                                animating={true}
                                                size="small"
                                                color="#1f6cb0" />
                                            <Text style={[globalStyles.notation, {
                                                marginLeft: 10
                                            }]}>{i18n.t('screens')['profile']['saving']}</Text>
                                        </View>
                                        : null
                                }
                                <Text style={styles.names}>
                                    {this.state.profile.firstName}
                                    &nbsp;
                                    {this.state.profile.lastName}
                                </Text>
                                <Text style={styles.email}>{this.state.profile.email}</Text>
                                <Pressable style={({ pressed }) => [
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                    }
                                ]} onPress={() => {
                                    this.logout();
                                }}>
                                    <Text style={styles.highlightedText}>{i18n.t('screens')['profile']['logout']}</Text>
                                </Pressable>
                            </View>
                            <View style={styles.commonDataContainer}>
                                <View style={styles.commonDataSection}>
                                    <View>
                                        <Text style={styles.commonDataSectionTitle}>{i18n.t('screens')['profile']['weightUnit']}</Text>
                                        <Text style={styles.commonDataSectionValue}>
                                            {
                                                this.state.profile.weightUnit == WEIGHT_UNITS.KILOGRAMS
                                                    ? i18n.t('screens')['profile']['KILOGRAMS']
                                                    : i18n.t('screens')['profile']['POUNDS']
                                            }
                                        </Text>
                                    </View>
                                    <Pressable style={({ pressed }) => [
                                        {
                                            opacity: pressed ? 0.1 : 1,
                                        }
                                    ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                        this.navigateToProfileDetailsEdit();
                                    }}>
                                        <MaterialIcons name="edit" size={25} color="#1f6cb0" />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                        : !this.state.showLoadProfileError
                            ? <Text style={globalStyles.notation}>{i18n.t('screens')['profile']['loading']}</Text>
                            : null
                }
            </View>
        </View>;
    }
}
