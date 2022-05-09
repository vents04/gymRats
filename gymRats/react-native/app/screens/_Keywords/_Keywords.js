import { Ionicons } from '@expo/vector-icons';
import React, { Component } from 'react'
import { Text, View, TextInput, Button, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import globalStyles from '../../../assets/styles/global.styles';
import ApiRequests from '../../classes/ApiRequests';

export default class _Keywords extends Component {


    state = {
        from: 1,
        to: 8757,
        current: 1,
        currentInstance: null
    }

    componentDidMount() {
        this.getKeyword();
    }

    getKeyword = () => {
        ApiRequests.get(this.state.current, {}, false).then(async (response) => {
            const currentInstance = response.data.food;
            this.setState({ to: response.data["length"] })
            if (currentInstance.hasBeenSubmitted) {
                this.setState({ current: parseInt(this.state.current) + 1 }, () => {
                    this.getKeyword();
                });
            } else {
                this.setState({ currentInstance })
            }
        }).catch((error) => {
            Alert.alert("Error", error);
        })
    }

    postValue = () => {
        ApiRequests.post(this.state.currentInstance._id, {}, {
            keywords: this.state.currentInstance.keywords,
            title: this.state.currentInstance.title
        }, false).then(async (response) => {
            this.setState({ current: parseInt(this.state.current) + 1 }, () => {
                this.getKeyword();
            })
        }).catch((error) => {
            Alert.alert("Error", error);
        })
    }

    deleteValue = () => {
        ApiRequests.delete(this.state.currentInstance._id, {}, false).then(async (response) => {
            this.getKeyword();
        }).catch((error) => {
            Alert.alert("Error", error);
        })
    }

    render() {
        return (
            <View>
                <Text>From which nth to which nth element would you like to loop. Whenever you change these values the page will refresh</Text>
                <TextInput style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,
                    padding: 8,
                }} placeholder={"From: min(1), max(" + this.state.to + ")"} value={this.state.from} onChangeText={(val) => { this.setState({ from: val, current: parseInt(val) }, () => { this.getKeyword() }) }} />
                <TextInput style={{
                    marginTop: 6,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,
                    padding: 8,
                }} placeholder={"From: min(1), max(" + this.state.to + ")"} value={this.state.to} onChangeText={(val) => { this.setState({ to: val }, () => { this.getKeyword() }) }} />
                <Text>Current n: {this.state.current}</Text>
                {
                    this.state.from < this.state.to && this.state.currentInstance
                        ? <View style={{ marginTop: 32 }}>
                            <Text>Food to edit:</Text>
                            <TextInput style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 4,
                                padding: 8,
                            }} value={this.state.currentInstance.title ?? ""} onChangeText={(val) => {
                                const currentInstance = this.state.currentInstance;
                                currentInstance.title = val;
                                this.setState({ currentInstance })
                            }} />
                            <View style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 32,
                                marginBottom: 16
                            }}>
                                <Text>Keyword:</Text>
                                <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => {
                                    let currentInstance = this.state.currentInstance;
                                    currentInstance.keywords.push("");
                                    this.setState({ currentInstance })
                                }}>
                                    <Text style={globalStyles.actionText}>Add keyword</Text>
                                </TouchableOpacity>
                            </View>
                            {
                                this.state.currentInstance.keywords.map((keyword, index) =>
                                    <View key={index} style={{
                                        marginTop: 12,
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                        <TextInput style={{
                                            borderWidth: 1,
                                            borderColor: "#ccc",
                                            borderRadius: 4,
                                            padding: 8,
                                        }} value={keyword ?? ""} onChangeText={(val) => {
                                            let currentInstance = this.state.currentInstance;
                                            currentInstance.keywords[index] = val;
                                            this.setState({ currentInstance })
                                        }} />
                                        <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => {
                                            let currentInstance = this.state.currentInstance;
                                            currentInstance.keywords.splice(currentInstance.keywords.indexOf(keyword), 1);
                                            this.setState({ currentInstance })
                                        }}>
                                            <Text style={globalStyles.actionText}>Remove keyword</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                            <TouchableOpacity style={[globalStyles.authPageActionButton, {
                                marginTop: 32
                            }]} onPress={() => {
                                this.postValue();
                            }}>
                                <Text style={globalStyles.authPageActionButtonText}>Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[globalStyles.authPageActionButton, {
                                marginTop: 64
                            }]} onPress={() => {
                                this.deleteValue();
                            }}>
                                <Text style={globalStyles.authPageActionButtonText}>Delete food</Text>
                            </TouchableOpacity>
                        </View>
                        : <Text>You have looped through all of the elements</Text>
                }
            </View>
        )
    }
}
