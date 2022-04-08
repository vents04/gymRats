import React, { Component } from 'react'
import { Image, ScrollView, Text, View } from 'react-native';
import ChatsItem from '../../components/ChatsItem/ChatsItem';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Chats.styles');

export default class Chats extends Component {

    state = {
        chats: [
            {
                _id: "1",
                user: {
                    profilePicture: null,
                    firstName: "Alexander",
                    lastName: "Zlatkov"
                },
                lastMessage: "Test"
            },
            {
                _id: "2",
                user: {
                    profilePicture: null,
                    firstName: "Ventsislav",
                    lastName: "Dimitrov"
                },
                lastMessage: null
            }
        ],
        showError: true,
        error: "",
    }

    componentDidMount() {
        this.props.navigation.navigate("Chat");
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
                                    this.state.chats.map((chat) => 
                                        <ChatsItem chat={chat} {...this.props}/>                                    
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
