import React, { Component } from 'react'
import { Image, Text, View, ScrollView, TextInput } from 'react-native';
import { BiArrowBack } from 'react-icons/bi';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Chat.styles');

import { IoIosSend } from 'react-icons/io';
import Message from '../../components/Message/Message';

export default class Chat extends Component {

    state = {
        message: "",
        showError: false,
        error: "",
        chat: {
            user: {
                _id: "1",
                profilePicture: null,
                firstName: "Ventsislav",
                lastName: "Dimitrov"
            },
            oppositeUser: {
                _id: "2",
                profilePicture: null,
                firstName: 'Alexander',
                lastName: 'Zlatkov',
            },
            messages: [
                {
                    senderId: "2",
                    text: "Hello",
                    file: null,
                },
                {
                    senderId: "1",
                    text: "world!",
                    file: null,
                },
                {
                    senderId: "2",
                    text: "Hello",
                    file: null,
                },
                {
                    senderId: "1",
                    text: "world!",
                    file: null,
                },
                {
                    senderId: "2",
                    text: "Hello",
                    file: null,
                },
                {
                    senderId: "1",
                    text: "world!",
                    file: null,
                },
                {
                    senderId: "2",
                    text: "Hello",
                    file: null,
                },
                {
                    senderId: "1",
                    text: "world!",
                    file: null,
                },
                {
                    senderId: "2",
                    text: "Hello",
                    file: null,
                },
                {
                    senderId: "1",
                    text: "world!",
                    file: null,
                },
                {
                    senderId: "2",
                    text: "Hello",
                    file: null,
                },
                {
                    senderId: "1",
                    text: "world!",
                    file: null,
                },
                {
                    senderId: "2",
                    text: "Hello",
                    file: null,
                },
                {
                    senderId: "1",
                    text: "world!",
                    file: null,
                },
            ]
        }
    }

    componentDidMount() {
        console.log(this.props)
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
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
            </View>
        )
    }
}
