import React, { Component } from 'react'
import { Image, Text, View, ScrollView, TextInput } from 'react-native';
import { BiArrowBack } from 'react-icons/bi';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Chat.styles');

import { IoIosSend } from 'react-icons/io';
import Message from '../../components/Message/Message';
import ApiRequests from '../../classes/ApiRequests';
import { HTTP_STATUS_CODES } from '../../../global';

export default class Chat extends Component {

    state = {
        message: "",
        showError: false,
        error: "",
        chat: null
    }

    sendTextMessage = () => {
        const socket = io("http://localhost:4001", {
            reconnectionDelayMax: 10000,
        });

        socket.emit("join-chat", {chatId});

       
    }

    getChat = (id) => {
        ApiRequests.get(`chat/${id}`, {}, true).then((response) => {
            console.log(response);
            this.setState({chat: response.data.chat});
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
        console.log(this.props)
        const chatId = this.props.route.params.chatId
        this.getChat(chatId)
        this.updateSeenStatus(chatId)
        const socket = io("http://localhost:4056", {
            reconnectionDelayMax: 10000,
        });

        socket.emit("join-chat", {chatId});
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                {
                    this.state.chat && 
                    <>
                        <View style={styles.chatTopbarContainer}>
                            <BiArrowBack size={25} onClick={() => {
                                    this.props.navigation.navigate("Chats")
                                }} />
                                {
                                    !this.state.chat.user.profilePicture
                                    ? <View style={styles.chatProfilePicture}>
                                        <Text style={styles.noProfilePictureText}>
                                            {this.state.chat.user.firstName.charAt(0)}
                                            {this.state.chat.user.lastName.charAt(0)}
                                        </Text>
                                    </View>
                                    : <Image style={styles.chatProfilePicture} />
                                }
                            <Text style={styles.chatProfileNames}>{this.state.chat.oppositeUser.firstName}</Text>
                        </View>
                        <ScrollView style={styles.chatMessagesContainer}>
                            {
                                this.state.chat.messages.map((message) =>
                                    <Message message={message} user={this.state.chat.user} oppositeUser={this.state.chat.oppositeUser} />
                                )
                            }
                        </ScrollView>
                        <View style={styles.chatInputContainer}>
                            <TextInput
                                value={this.state.message}
                                style={styles.chatInput}
                                placeholder="Type a message"
                                onChangeText={(val) => { this.setState({ message: val, showError: false }) }} />
                            <View style={styles.chatActionButtonContainer}>
                                <IoIosSend size={24} style={styles.chatInputButton} color="#1f6cb0"/>
                            </View>                
                        </View>
                    </>
                }
            </View>
        )
    }
}
