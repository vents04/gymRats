import React, { Component } from 'react'
import { Image, Text, View, ScrollView, TextInput } from 'react-native';
import { BiArrowBack } from 'react-icons/bi';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Chat.styles');

import { IoIosSend } from 'react-icons/io';
import Message from '../../components/Message/Message';
import ApiRequests from '../../classes/ApiRequests';
import { HTTP_STATUS_CODES } from '../../../global';
import socket from './Socket';

export default class Chat extends Component {

    constructor(props) {
        super(props)
        this.scrollView = React.createRef();
    }

    state = {
        message: "",
        showError: false,
        error: "",
        chat: null,
        chatId: null
    }

    sendTextMessage = (messageInfo) => {
        socket.emit("send-text-message", {messageInfo})
        this.setState({ message: "", showError: false }, ()=>{
            this.getChat(this.state.chatId);
        }); 
        //socket.emit("update-last-message", {})
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
            this.setState({chat: response.data.chat}, ()=>{
                this.scrollView.current.scrollToEnd({animated: true});
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
        const chatId = this.props.route.params.chatId
        this.setState({chatId: this.props.route.params.chatId}, ()=>{
            socket.open()
            socket.emit("join-chat", {chatId})
            this.updateSeenStatus(chatId)
            this.getChat(chatId)
            this.receiveTextMessage()
        });
    }

    componentWillUnmount(){
        this.disconnectUserFromChat()
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
                        <ScrollView ref={this.scrollView} style={styles.chatMessagesContainer}>
                            {
                                this.state.chat.messages.map((message) =>
                                    <Message message={message.message} user={this.state.chat.user} oppositeUser={this.state.chat.oppositeUser} />
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
                                <IoIosSend onClick={() => {this.sendTextMessage({senderId: this.state.chat.user._id, message: this.state.message})}} size={24} style={styles.chatInputButton} color="#1f6cb0"/>
                            </View>                
                        </View>
                    </>
                }
            </View>
        )
    }
}
