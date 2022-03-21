import React, { Component } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { IoMdClose } from 'react-icons/io';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./CoachRequestsItem.styles');

export default class CoachRequestsItem extends Component {

    state = {
        chat: {
            user: {
                firstName: 'Ven',
                lastName: 'Dim',
                profilePicture: null
            }
        }
    }

    render() {
        return (
            <View style={styles.chatItemContainer} onClick={this.navigateToChat}>
                <View style={styles.coachRequestInfoContainer}>
                    <IoMdClose size={18} color="#aaa" style={{marginRight: 8}}/>
                    {
                        !this.state.chat.user.profilePicture
                            ? <View style={styles.profilePictureContainer}>
                                <Text style={styles.noProfilePictureText}>
                                    {this.state.chat.user.firstName.charAt(0)}
                                    {this.state.chat.user.lastName.charAt(0)}
                                </Text>
                            </View>
                            : <Image style={styles.profilePictureContainer}
                                source={{ uri: this.state.chat.user.profilePicture }} />
                    }
                    <View style={styles.chatsItemDetailsContainer}>
                        <Text style={styles.chatsItemNames}>{this.state.chat.user.firstName} {this.state.chat.user.lastName}</Text>
                    </View>
                </View>
                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                    marginTop: 14
                }]} onPress={() => {
                    
                }}>
                    <Text style={globalStyles.authPageActionButtonText}>Accept request</Text>
                </TouchableOpacity>
            </View>
        )
    }
}
