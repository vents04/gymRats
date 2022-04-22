import React, { Component } from 'react'
import { Image, ScrollView, Text, View } from 'react-native';
import { HTTP_STATUS_CODES } from '../../../global';
import ApiRequests from '../../classes/ApiRequests';
import ChatsItem from '../../components/ChatsItem/ChatsItem';
import socket from '../Chat/Socket';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Chats.styles');

export default class Chats extends Component {

    state = {
        chats: [],
        showError: true,
        error: "",
    }

    focusListener;

    onFocusFunction = () => {
        this.getChats();
        this.updateLastMessage()
    }

    getChats = () => {
        ApiRequests.get("chat", {}, true).then((response) => {
            this.setState({ chats: response.data.chats });
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

    updateLastMessage = () => {
        socket.on("last-message-to-be-updated", () => {
            console.log("here213")
            this.getChats()
        });
    }

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.pageLogoContainer}>
                        <Image style={globalStyles.pageLogo} source={require('../../../assets/img/icon.png')} />
                        <Text style={globalStyles.pageLogoText}>Gym Rats</Text>
                    </View>
                    {
                        this.state.chats?.length > 0
                            ? <ScrollView
                                contentContainerStyle={{
                                    flexGrow: 1,
                                    flexShrink: 1,
                                }}>
                                {
                                    this.state.chats.map((chat, index) =>
                                        <ChatsItem key={index} onClick={() => {
                                            this.props.navigation.navigate("Chat", { chatId: chat._id })
                                        }} chat={chat} {...this.props} />
                                    )
                                }
                            </ScrollView>
                            : <Text style={globalStyles.notation}>Chats with clients and coaches will appear here</Text>
                    }
                </View>
            </View>
        )
    }
}
