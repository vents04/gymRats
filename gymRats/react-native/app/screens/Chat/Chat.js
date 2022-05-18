import React, { Component } from 'react'
import { Image, Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';

import socketClass from '../../classes/Socket';
const socket = socketClass.initConnection();

import ApiRequests from '../../classes/ApiRequests';

import Message from '../../components/Message/Message';

import { Ionicons } from '@expo/vector-icons';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Chat.styles';

export default class Chat extends Component {

    constructor(props) {
        super(props)

        this.scrollView = React.createRef();

        this.state = {
            message: "",
            showError: false,
            error: "",
            chat: null,
            chatId: null
        }

        this.focusListener;
    }

    onFocusFunction = () => {
        const chatId = this.props.route.params.chatId
        this.setState({ chatId: this.props.route.params.chatId }, () => {
            socket.open()
            socket.emit("join-chat-room", { chatId })
            this.updateSeenStatus(chatId)
            this.getChat(chatId)
            this.receiveTextMessage()
        });
    }

    sendTextMessage = (messageInfo) => {
        socket.emit("send-text-message", { messageInfo })
        this.setState({ message: "", showError: false }, () => {
            this.getChat(this.state.chatId);
        });
        socket.emit("update-last-message", {})
    }

    receiveTextMessage = () => {
        socket.on("receive-text-message", () => {
            this.updateSeenStatus(this.state.chatId)
            this.getChat(this.state.chatId)
        });
    }

    disconnectUserFromChat = () => {
        socket.close();
    }

    getChat = (id) => {
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
        ApiRequests.put(`chat/${id}/seen`, {}, {}, true).then((response) => {
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

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction();
        })
    }

    componentWillUnmount() {
        this.disconnectUserFromChat()
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                {
                    this.state.chat
                        ? <>
                            <View style={styles.chatTopbarContainer}>
                                <TouchableOpacity onPress={() => {
                                    this.props.navigation.navigate("Chats")
                                }}>
                                    <Ionicons name="md-arrow-back-sharp" size={25} />
                                </TouchableOpacity>
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
                                        <Message key={index} message={message} user={this.state.chat.user} oppositeUser={this.state.chat.oppositeUser} />
                                    )
                                }
                            </ScrollView>
                            <View style={styles.chatInputContainer}>
                                <TextInput
                                    value={this.state.message}
                                    style={styles.chatInput}
                                    placeholder="Type a message..."
                                    onChangeText={(val) => { this.setState({ message: val, showError: false }) }} />
                                <View style={styles.chatActionButtonContainer}>
                                    <TouchableOpacity onPress={() => {
                                        this.sendTextMessage({ senderId: this.state.chat.user._id, message: this.state.message })
                                    }}>
                                        <Ionicons name="ios-send" size={24} style={styles.chatInputButton} color="#1f6cb0" />
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </>
                        : null
                }
            </View>
        )
    }
}
