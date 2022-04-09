import React, { Component } from 'react'
import { Image, Text, View } from 'react-native';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./ChatsItem.styles');

export default class ChatsItem extends Component {

    navigateToChat = () => {
        console.log("tuka", this.props);
        this.props.navigation.navigate("Chat", {chatId: this.props.chat._id})
    }

    render() {
        return (
            <View style={styles.chatItemContainer} onClick={this.navigateToChat}>
                {
                    !this.props.chat.oppositeUser.profilePicture
                        ? <View style={styles.profilePictureContainer}>
                            <Text style={styles.noProfilePictureText}>
                                {this.props.chat.oppositeUser.firstName.charAt(0)}
                                {this.props.chat.oppositeUser.lastName.charAt(0)}
                            </Text>
                        </View>
                        : <Image style={styles.profilePictureContainer}
                            source={{ uri: this.props.chat.oppositeUser.profilePicture }} />
                }
                <View style={styles.chatsItemDetailsContainer}>
                    <Text style={styles.chatsItemNames}>{this.props.chat.oppositeUser.firstName} {this.props.chat.oppositeUser.lastName}</Text>
                    {
                        this.props.chat.lastMessage && 
                        <Text style={styles.chatsItemLastMessage}>{this.props.chat.lastMessage}</Text>
                    }
                </View>
            </View>
        )
    }
}
