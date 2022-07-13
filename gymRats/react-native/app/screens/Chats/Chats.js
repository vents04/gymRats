import React, { Component } from 'react'
import { Image, ScrollView, Text, Pressable, View } from 'react-native';

import socketClass from '../../classes/Socket';

import i18n from 'i18n-js';

import ApiRequests from '../../classes/ApiRequests';

import ChatsItem from '../../components/ChatsItem/ChatsItem';

import { HTTP_STATUS_CODES } from '../../../global';

import { default as AsyncStorage } from '@react-native-async-storage/async-storage';

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
        let chatsRoomSocket = socketClass.getChatsRoomSocket();
        if (!chatsRoomSocket) {
            chatsRoomSocket = socketClass.initConnection();
            socketClass.setChatsRoomSocket(chatsRoomSocket);
        }
        socketClass.joinChatsRoom();

        if (this.props.route && this.props.route.params) {
            if (this.props.route.params.chatId) {
                this.props.navigation.navigate("Chat", { chatId: this.props.route.params.chatId })
            }
        }
        this.getChats();
    }

    swap = (arr, i, j) => {
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    partition = (arr, low, high, pivot) => {
        let i = (low - 1);
     
        for (let j = low; j <= high - 1; j++) {
            if(!arr[j].lastMessage && !pivot.lastMessage) {
                if(new Date(arr[j].createdDt).getTime() > new Date(pivot.createdDt).getTime()) {
                    i++;
                    swap(arr, i, j);
                }
            }
            else if(!arr[j].lastMessage && new Date(arr[j].createdDt).getTime() > new Date(pivot.lastMessage.createdDt)) {
                i++;
                swap(arr, i, j);
            }
            else if(!pivot.lastMessage && new Date(arr[j].createdDt).getTime() > new Date(pivot.lastMessage.createdDt)){
                i++;
                swap(arr, i, j);
            }
            else if(arr[j].lastMessage && pivot.lastMessage) {
                if(new Date(arr[j].lastMessage.createdDt).getTime() > new Date(pivot.lastMessage.createdDt)) {
                    i++;
                    swap(arr, i, j);
               }
            }

        }
        swap(arr, i + 1, high);
        return (i + 1);
    }
    sortChatsBySeen = (arr, low, high) => {
        if (low < high) {
            let pivot = arr[high];
    
            let pi = partition(arr, low, high, pivot);
            sortChatsBySeen(arr, low, pi - 1);
            sortChatsBySeen(arr, pi + 1, high);
        }
    }

    getChats = () => {
        ApiRequests.get("chat", {}, true).then((response) => {
            response.data.chats = this.sortChatsBySeen(response.data.chats, 0, response.data.chats.length - 1);
            this.setState({ chats: response.data.chats });
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
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

    joinRooms = async () => {
        const user = await AsyncStorage.getItem("@gymrats:user");
        if (user) {
            const userData = JSON.parse(user);
            socketClass.getChatsRoomSocket().emit("join-chats-room", { userId: userData._id });
            return
        }
        this.props.navigation.navigate("Chats");
    }


    updateLastMessage = () => {
        console.log("vika li se")
        socketClass.getChatsRoomSocket().on("update-last-message", (data) => {
            console.log("TEST ZA UPDATE LAST MESSAGE", data)
            try {
                let chats = this.state.chats
                for (let chat of chats) {
                    if (chat._id == data.message.chatId) {
                        chat.lastMessage = { text: data.message.message.text || i18n.t('screens')['chats']['fileMessage'] };
                        break;
                    }
                }
                chats = this.sortChatsBySeen(chats, 0, chats.length - 1);
                this.setState({ chats });
            } catch (error) {
                console.log(error);
            }
        });
    }

    updateSeen = (id) => {
        const chats = this.state.chats;
        for (let chat of chats) {
            console.log(chat._id, id)
            if (chat._id == id) {
                console.log("ALALALAL")
                chat.lastMessage.seen = true;
                break;
            }
        }
        this.setState({ chats });
    }

    componentDidMount() {
        this.joinRooms();
        this.updateLastMessage();
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
    }

    render() {
        return (
            <View style={[globalStyles.safeAreaView, { paddingTop: 32 }]}>
                <View style={globalStyles.pageContainer}>
                    <LogoBar />
                    {
                        this.state.chats?.length > 0
                            ? <ScrollView
                                contentContainerStyle={globalStyles.fillEmptySpace}>
                                {
                                    this.state.chats.map((chat, index) =>
                                        chat.oppositeUser
                                            ? <ChatsItem key={index} updateSeen={() => { this.updateSeen }} chat={chat} {...this.props} />
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
