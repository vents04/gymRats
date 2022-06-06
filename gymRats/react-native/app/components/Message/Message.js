import React, { Component } from 'react'
import { Alert, Image, Linking, Pressable, Text, View } from 'react-native'
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import i18n from 'i18n-js';

import prettyBytes from 'pretty-bytes';

import styles from './Message.styles';
import globalStyles from '../../../assets/styles/global.styles';
import { AUDIO_PLAY_MIME_TYPES, IMAGE_VISUALIZATION_MIME_TYPES, ROOT_URL_API, VIDEO_VISUALIZATION_MIME_TYPES } from '../../../global';

export default class Message extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showDownloading: false
        }
    }

    download = () => {
        FileSystem.downloadAsync(
            `${ROOT_URL_API}/ugc/${this.props.message.message.file.name}.${this.props.message.message.file.extension}`,
            FileSystem.documentDirectory + this.props.message.message.file.originalName.replace(`.${this.props.message.message.file.extension}`, "") + "." + this.props.message.message.file.extension
        )
            .then(async ({ uri }) => {
                const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' })
                console.log(base64.length)
                this.saveFile(uri);
            })
            .catch((error) => {
                Alert.alert(i18n.t('components')['message']['fileDownloadErrorTitle'], i18n.t('components')['message']['fileDownloadErrorDescription']);
            }).finally(() => {
                setTimeout(() => {
                    this.setState({ showDownloading: false });
                }, 1000);
            });
    }

    saveFile = async (fileUri) => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync(false);
            if (status === 'granted') {
                const albumExists = await MediaLibrary.getAlbumAsync("Gym Rats");
                const asset = await MediaLibrary.createAssetAsync(fileUri);
                if (!albumExists) await MediaLibrary.createAlbumAsync('Gym Rats', asset, false);
                else await MediaLibrary.addAssetsToAlbumAsync(asset, albumExists.id, true)
                Alert.alert(i18n.t('components')['message']['fileDownloadSuccessTitle'], `${i18n.t('components')['message']['fileDownloadSuccessDescription'][0]} ${this.props.message.message.file.originalName.replace(`.${this.props.message.message.file.extension}`)}${i18n.t('components')['message']['fileDownloadSuccessDescription'][1]}${this.props.message.message.file.extension} ${i18n.t('components')['message']['fileDownloadSuccessDescription'][2]}`);
            }
        } catch (error) {
            Alert.alert(i18n.t('components')['message']['fileDownloadErrorTitle'], i18n.t('components')['message']['fileDownloadErrorDescription']);
        }
    };

    render() {
        return (
            <View style={[styles.messageContainer, {
                alignSelf: (this.props.user._id == this.props.message.senderId) ? "flex-end" : "flex-start",
                flexDirection: (this.props.user._id == this.props.message.senderId) ? "row-reverse" : "row"
            }]}>
                {
                    this.props.user._id == this.props.message.senderId
                        ? !this.props.user.profilePicture
                            ? <View style={styles.profilePictureContainer}>
                                <Text style={styles.noProfilePictureText}>{this.props.user.firstName.charAt(0)}{this.props.user.lastName.charAt(0)}</Text>
                            </View>
                            : <Image style={styles.profilePictureContainer}
                                source={{ uri: this.props.user.profilePicture }} />
                        : null
                }
                {
                    this.props.oppositeUser._id == this.props.message.senderId
                        ? !this.props.oppositeUser.profilePicture
                            ? <View style={styles.profilePictureContainer}>
                                <Text style={styles.noProfilePictureText}>
                                    {this.props.oppositeUser.firstName.charAt(0)}
                                    {this.props.oppositeUser.lastName.charAt(0)}
                                </Text>
                            </View>
                            : <Image style={styles.profilePictureContainer}
                                source={{ uri: this.props.oppositeUser.profilePicture }} />
                        : null
                }
                {
                    this.props.message.message.text
                        ? <View style={styles.messageContentContainer}>
                            <Text style={styles.textMessage}>{this.props.message.message.text}</Text>
                        </View>
                        : null
                }
                {
                    this.props.message.message.file
                        ? <View style={styles.fileMessage}>
                            {
                                IMAGE_VISUALIZATION_MIME_TYPES.includes(this.props.message.message.file.mimeType)
                                    || VIDEO_VISUALIZATION_MIME_TYPES.includes(this.props.message.message.file.mimeType)
                                    || AUDIO_PLAY_MIME_TYPES.includes(this.props.message.message.file.mimeType)
                                    ? <Pressable style={({ pressed }) => [
                                        {
                                            opacity: pressed ? 0.1 : 1,
                                        }
                                    ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                        this.props.navigation.navigate("FilePreview", {
                                            url: `${ROOT_URL_API}/ugc/${this.props.message.message.file.name}.${this.props.message.message.file.extension}`,
                                            name: this.props.message.message.file.originalName,
                                            mimeType: this.props.message.message.file.mimeType
                                        })
                                    }}>
                                        <Text style={styles.filePreviewText}>{i18n.t('components')['message']['clickToPreview']}</Text>
                                    </Pressable>
                                    : null
                            }
                            <Text style={styles.fileName}>{this.props.message.message.file.originalName}</Text>
                            {
                                !this.state.showDownloading
                                    ? <Pressable style={({ pressed }) => [
                                        styles.downloadContainer,
                                        {
                                            opacity: pressed ? 0.1 : 1,
                                        }
                                    ]} onPress={() => {
                                        this.setState({ showDownloading: true }, () => {
                                            this.download();
                                        })
                                    }}>
                                        <MaterialCommunityIcons name="download-circle-outline" size={24} color="#1f6cb0" />
                                        <Text style={{ ...globalStyles.notation, marginLeft: 8 }}>{i18n.t('components')['message']['download']}&nbsp;&middot;&nbsp;{prettyBytes(this.props.message.message.file.size)}
                                            {
                                                this.props.message.message.file.extension
                                                    ? <Text>&nbsp;&middot;&nbsp;{this.props.message.message.file.extension.toUpperCase()}</Text>
                                                    : null
                                            }
                                        </Text>
                                    </Pressable>
                                    : <Text style={{ ...globalStyles.notation, marginTop: 8 }}>{i18n.t('components')['message']['downloading']}</Text>
                            }
                        </View>
                        : null
                }
            </View >
        )
    }
}