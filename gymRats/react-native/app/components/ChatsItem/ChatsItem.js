import React, { Component } from 'react'
import { Image, Text, TouchableWithoutFeedback, View } from 'react-native';
import i18n from 'i18n-js';

import styles from './ChatsItem.styles';

export default class ChatsItem extends Component {

    render() {
        return (
            <TouchableWithoutFeedback onPress={() => {
                this.props.updateSeen(this.props.chat._id)
                this.props.navigation.navigate("Chat", { chatId: this.props.chat._id })
            }}>
                <View style={styles.chatItemContainer}>
                    {
                        this.props.chat
                            ? <>
                                {
                                    this.props.chat.oppositeUser
                                        ? <>
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
                                        </>
                                        : null
                                }
                                <View style={styles.chatsItemDetailsContainer}>
                                    <Text style={styles.chatsItemNames}>{this.props.chat.oppositeUser.firstName}&nbsp;{this.props.chat.oppositeUser.lastName}</Text>
                                    {
                                        this.props.chat.lastMessage
                                            && (this.props.chat.lastMessage.text || this.props.chat.lastMessage.file)
                                            ? <>
                                                <Text style={[styles.chatsItemLastMessage, {
                                                    fontFamily: !this.props.chat.lastMessage.seen && this.props.chat.user._id != this.props.chat.lastMessage.senderId
                                                        ? 'MainBold'
                                                        : 'MainRegular'
                                                }]}>{
                                                        this.props.chat.lastMessage.text
                                                            ? this.props.chat.lastMessage.text
                                                            : i18n.t('screens')['chats']['fileMessage']}</Text>
                                            </>
                                            : null
                                    }
                                </View>
                            </>
                            : null
                    }
                </View>
            </TouchableWithoutFeedback>
        )
    }
}
