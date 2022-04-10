import { Image, Text, View } from 'react-native'
import React, { Component } from 'react'

const styles = require('./Message.styles');

export default class Message extends Component {

    componentDidMount() {
    }

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
                        <Text style={styles.noProfilePictureText}>
                            {this.props.user.firstName.charAt(0)}
                            {this.props.user.lastName.charAt(0)}
                        </Text>
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
        <View style={styles.messageContentContainer}>
            {
                this.props.message.text
                && <Text style={styles.textMessage}>{this.props.message.text}</Text>
            }
            {
                this.props.message.file
                && <Text style={styles.fileMessage}>File</Text>
            }
        </View>
      </View>
    )
  }
}