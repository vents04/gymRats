import React, { Component } from 'react'
import { Image, Text, View } from 'react-native';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./ChatsItem.styles');

export default class ChatsItem extends Component {

    state = {
        chat: {
            profilePicture: null,
            firstName: "Ventsislav",
            lastName: "Dimitrov",
            lastMessage: "Last message"
        }
    }

    render() {
        return (
            <View style={styles.chatItemContainer}>
                {
                    !this.state.chat.profilePicture
                        ? <View style={styles.profilePictureContainer}>
                            <Text style={styles.noProfilePictureText}>
                                {this.state.chat.firstName.charAt(0)}
                                {this.state.chat.lastName.charAt(0)}
                            </Text>
                        </View>
                        : <Image style={styles.profilePictureContainer}
                            source={{ uri: result.user.profilePicture }} />
                }
                <View style={styles.chatsItemDetailsContainer}>
                    <Text style={styles.chatsItemNames}>{this.state.chat.firstName} {this.state.chat.lastName}</Text>
                    <Text style={styles.chatsItemLastMessage}>{this.state.chat.lastMessage}</Text>
                </View>
            </View>
        )
    }
}
