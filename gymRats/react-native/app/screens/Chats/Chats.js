import React, { Component } from 'react'
import { Image, ScrollView, Text, Pressable, View } from 'react-native';

import socketClass from '../../classes/Socket';

import i18n from 'i18n-js';

import ApiRequests from '../../classes/ApiRequests';

import ChatsItem from '../../components/ChatsItem/ChatsItem';

import { HTTP_STATUS_CODES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import LogoBar from '../../components/LogoBar/LogoBar';

export default class Chats extends Component {

    constructor(props) {
        super(props);

        this.state = {
            chats: [],
            showError: true,
            error: "",
        }

        this.focusListener;
    }

    onFocusFunction = () => {
        if (this.props.route && this.props.route.params) {
            console.log(this.props)
            if (this.props.route.params.chatId) {
                this.props.navigation.navigate("Chat", { chatId: this.props.route.params.chatId })
            }
        }
        this.updateLastMessage()
        this.getChats();
    }

    getChats = () => {
        ApiRequests.get("chat", {}, true).then((response) => {
            this.setState({ chats: response.data.chats });
            console.log(response.data.chats)
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
        socketClass.getChatsRoomSocket().on("last-message-to-be-updated", () => {
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
                    <LogoBar />
                    {
                        this.state.chats?.length > 0
                            ? <ScrollView
                                contentContainerStyle={globalStyles.fillEmptySpace}>
                                {
                                    this.state.chats.map((chat, index) =>
                                        chat.oppositeUser && chat.lastMessage
                                            ?
                                            <Pressable style={({ pressed }) => [
                                                {
                                                    opacity: pressed ? 0.1 : 1,
                                                }
                                            ]} key={index} onPress={() => {
                                                this.props.navigation.navigate("Chat", { chatId: chat._id })
                                            }}>
                                                <ChatsItem chat={chat} {...this.props} />
                                            </Pressable>
                                            : null
                                    )
                                }
                            </ScrollView>
                            : <Text style={globalStyles.notation}>{i18n.t('screens')['chats']['noChats']}</Text>
                    }
                </View>
            </View>
        )
    }
}
