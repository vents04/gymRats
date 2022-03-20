import React, { Component } from 'react'
import { Image, Text, View } from 'react-native';
import { BiArrowBack } from 'react-icons/bi';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Chat.styles');

export default class Chat extends Component {

    state = {
        chat: {
            user: {
                profilePicture: null,
                firstName: 'Alexander',
                lastName: 'Zlatkov',
            }
        }
    }

    // 



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
                    <Text style={styles.chatProfileNames}>Alexander</Text>
                </View>
            </View>
        )
    }
}
