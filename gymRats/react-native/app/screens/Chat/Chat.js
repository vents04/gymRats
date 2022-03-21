import React, { Component } from 'react'
import { Image, Text, View, ScrollView, TextInput } from 'react-native';
import { BiArrowBack } from 'react-icons/bi';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Chat.styles');

import { IoIosSend } from 'react-icons/io';

export default class Chat extends Component {

    

    state = {
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
                    senderId: "1",
                    message: "world!",
                    createdAt: new Date(new Date().setHours(new Date().getHours() - 1))
                },
                {
                    senderId: "2",
                    message: "Hello",
                    createdAt: new Date(new Date().setHours(new Date().getHours() - 2))
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
                    
                </ScrollView>
                <View style={styles.chatInputContainer}>
                    <TextInput style={styles.chatInput} />
                    <IoIosSend size={24} style={styles.chatInputButton}/>
                </View>
            </View>
        )
    }
}
