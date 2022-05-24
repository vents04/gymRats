import React, { Component } from 'react'
import { Image, Text, View, ScrollView, TextInput, Pressable, BackHandler, Alert, ActivityIndicator } from 'react-native';
import { BackButtonHandler } from '../../classes/BackButtonHandler';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import socketClass from '../../classes/Socket';

import ApiRequests from '../../classes/ApiRequests';

import Message from '../../components/Message/Message';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES, SUPPORTED_MIME_TYPES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Chat.styles';

export default class Chat extends Component {

    constructor(props) {
        super(props)

        this.scrollView = React.createRef();

        this.state = {
            message: "",
            showError: false,
            isFileBeingUploaded: false,
            error: "",
            chat: null,
            chatId: null
        }

        this.focusListener;
    }

    onFocusFunction = () => {
        const chatId = this.props.route.params.chatId
        this.getChat(chatId)
        this.setState({ chatId: this.props.route.params.chatId }, () => {
            this.updateSeenStatus(chatId)
            this.receiveTextMessage()
        });
    }

    backAction = () => {
        this.props.navigation.navigate("Chats");
        return true;
    }

    sendTextMessage = (messageInfo) => {
        socketClass.getChatsRoomSocket().emit("send-text-message", { messageInfo })
        this.setState({ message: "", showError: false }, () => {
            setTimeout(() => {
                this.getChat(this.state.chatId);
            }, 500);
        });
        socketClass.getChatsRoomSocket().emit("update-last-message", {chatId: this.state.chatId});
    }

    receiveTextMessage = () => {
        socketClass.getChatsRoomSocket().on("receive-message", (data) => {
            this.getChat(this.state.chatId)
        });
    }

    disconnectUserFromChat = () => {
        socketClass.getChatsRoomSocket().close();
    }

    getChat = (id) => {
        console.log(new Date())
        ApiRequests.get(`chat/${id}`, {}, true).then((response) => {
            this.setState({ chat: response.data.chat }, () => {
                this.scrollView.current.scrollToEnd({ animated: true });
            });
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

    updateSeenStatus = (id) => {
        ApiRequests.put(`chat/${id}/seen`, {}, {}, true).catch((error) => {
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

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction();
        })
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    pickDocument = async () => {
        DocumentPicker.getDocumentAsync({ type: SUPPORTED_MIME_TYPES }).then((result) => {
            if (result.type == "success") {
                const file = {
                    uri: result.uri,
                    type: result.type,
                    name: result.name,
                    mimeType: result.mimeType,
                    size: result.size
                }
                if (file.size >= 5e+7) {
                    Alert.alert("File upload error", "The size of the file you have selected is too large")
                    return;
                }
                console.log(file.mimeType);
                if (!SUPPORTED_MIME_TYPES.includes(file.mimeType)) {
                    Alert.alert("File upload error", "This file type is not supported");
                    return;
                }
                this.setState({ isFileBeingUploaded: true }, () => {
                    this.sendFileMessage(file)
                })
            }
        });
    }

    sendFileMessage = async (file) => {
        const fileBase64 = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' });
        console.log(fileBase64.length);
        socket.emit("send-file-message", { messageInfo: { senderId: this.state.chat.user._id, base64: fileBase64, name: file.name, size: file.size, mimeType: file.mimeType, chatId: this.props.route.params.chatId } })
        this.setState({ showError: false }, () => {
            setTimeout(() => {
                this.getChat(this.state.chatId);
                this.setState({ isFileBeingUploaded: false })
            }, 1000);
        });
        socket.emit("update-last-message", {})
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                {
                    this.state.chat
                        ? <>
                            <View style={styles.chatTopbarContainer}>
                                <Pressable style={({ pressed }) => [
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                    }
                                ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                    this.backAction();
                                }}>
                                    <Ionicons name="md-arrow-back-sharp" size={25} />
                                </Pressable>
                                {
                                    !this.state.chat.oppositeUser.profilePicture
                                        ? <View style={styles.chatProfilePicture}>
                                            <Text style={styles.noProfilePictureText}>
                                                {this.state.chat.oppositeUser.firstName.charAt(0)}
                                                {this.state.chat.oppositeUser.lastName.charAt(0)}
                                            </Text>
                                        </View>
                                        : <Image source={{ uri: this.state.chat.oppositeUser.profilePicture }} style={styles.chatProfilePicture} />
                                }
                                <Text style={styles.chatProfileNames}>{this.state.chat.oppositeUser.firstName}</Text>
                            </View>
                            <ScrollView ref={this.scrollView} style={styles.chatMessagesContainer}>
                                {
                                    this.state.chat.messages.map((message, index) =>
                                        <Message key={index} message={message} user={this.state.chat.user} oppositeUser={this.state.chat.oppositeUser} {...this.props} />
                                    )
                                }
                            </ScrollView>
                            <View style={styles.chatInputContainer}>
                                {
                                    !this.state.isFileBeingUploaded
                                        ? <>
                                            <TextInput
                                                value={this.state.message}
                                                style={styles.chatInput}
                                                placeholder="Type a message..."
                                                onChangeText={(val) => { this.setState({ message: val, showError: false }) }} />
                                            <View style={styles.chatActionButtonContainer}>
                                                {
                                                    this.state.message && this.state.message.length > 0
                                                        ? <Pressable style={({ pressed }) => [
                                                            {
                                                                opacity: pressed ? 0.1 : 1,
                                                            }
                                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 15 }} onPress={() => {
                                                            this.sendTextMessage({ senderId: this.state.chat.user._id, message: this.state.message, chatId: this.props.route.params.chatId });
                                                        }}>
                                                            <Ionicons name="ios-send" size={24} color="#1f6cb0" />
                                                        </Pressable>
                                                        : <Pressable style={({ pressed }) => [
                                                            {
                                                                opacity: pressed ? 0.1 : 1,
                                                            }
                                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 15 }} onPress={() => {
                                                            this.pickDocument();
                                                        }}>
                                                            <MaterialIcons name="file-present" size={30} color="#1f6cb0" />
                                                        </Pressable>
                                                }
                                            </View>
                                        </>
                                        : <View style={styles.uploadingContainer}>
                                            <Text style={styles.uploadingText}>The file is being uploaded</Text>
                                            <ActivityIndicator size="small" color="#1f6cb0" />
                                        </View>
                                }

                            </View>
                        </>
                        : null
                }
            </View>
        )
    }
}
