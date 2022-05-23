import React, { Component } from 'react'
import { Image, Text, View, ScrollView, TextInput, Pressable, BackHandler, Alert, ActivityIndicator, Button } from 'react-native';
import { BackButtonHandler } from '../../classes/BackButtonHandler';
import { Video, AVPlaybackStatus } from 'expo-av';
import { Audio } from 'expo-av';

import ApiRequests from '../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';

import { AUDIO_PLAY_MIME_TYPES, HTTP_STATUS_CODES, IMAGE_VISUALIZATION_MIME_TYPES, SUPPORTED_MIME_TYPES, VIDEO_VISUALIZATION_MIME_TYPES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './FilePreview.styles';

export default class FilePreview extends Component {

    constructor(props) {
        super(props);

        this.state = {
            videoStatus: {},
            sound: undefined,
            isAudioPlaying: false
        }

        this.video = React.createRef(null)
    }

    backAction = () => {
        if (this.video && this.video.current) this.video.current.pauseAsync();
        this.props.navigation.goBack();
        return true;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
        if (this.state.sound) {
            this.state.sound.unloadAsync();
            this.setState({ sound: undefined, isAudioPlaying: false })
        }
    }

    playSound = async () => {
        if (!this.state.sound) {
            const { sound } = await Audio.Sound.createAsync({ uri: this.props.route.params.url });
            this.setState({ sound, isAudioPlaying: true })
            await this.state.sound.playAsync();
        } else {
            (this.state.isAudioPlaying)
                ? this.state.sound.pauseAsync()
                : this.state.sound.playAsync();
            this.setState({ isAudioPlaying: !this.state.isAudioPlaying });
        }
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.backAction();
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} color={
                                IMAGE_VISUALIZATION_MIME_TYPES.includes(this.props.route.params.mimeType) ? "white" : "black"
                            } style={{
                                textShadowColor: "black"
                            }} />
                        </Pressable>
                        <Text style={[globalStyles.followUpScreenTitle, {
                            fontSize: 14,
                            color: IMAGE_VISUALIZATION_MIME_TYPES.includes(this.props.route.params.mimeType) ? "white" : "#262626",
                            textShadowColor: IMAGE_VISUALIZATION_MIME_TYPES.includes(this.props.route.params.mimeType) ? "#777" : null,
                            textShadowRadius: IMAGE_VISUALIZATION_MIME_TYPES.includes(this.props.route.params.mimeType) ? 4 : null
                        }]}>{this.props.route.params.name}</Text>
                    </View>
                    {
                        IMAGE_VISUALIZATION_MIME_TYPES.includes(this.props.route.params.mimeType)
                            ? <Image style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                left: 0,
                                height: "100%",
                                zIndex: -9
                            }} source={{ uri: this.props.route.params.url }} />
                            : VIDEO_VISUALIZATION_MIME_TYPES.includes(this.props.route.params.mimeType)
                                ? <>
                                    <Video
                                        ref={this.video}
                                        style={styles.video}
                                        source={{
                                            uri: this.props.route.params.url,
                                        }}
                                        resizeMode="cover"
                                        isLooping
                                        onPlaybackStatusUpdate={status => { this.setState({ videoStatus: status }) }}
                                    />
                                    <Pressable style={({ pressed }) => [
                                        globalStyles.authPageActionButton, {
                                            position: "absolute",
                                            bottom: 32,
                                            alignSelf: "center",
                                            opacity: pressed ? 0.1 : 1,
                                        }
                                    ]} onPress={() => {
                                        this.state.videoStatus.isPlaying ? this.video.current.pauseAsync() : this.video.current.playAsync()
                                    }}>
                                        <Text style={globalStyles.authPageActionButtonText}>{this.state.videoStatus.isPlaying ? 'Pause' : 'Play'}</Text>
                                    </Pressable>
                                </>
                                : AUDIO_PLAY_MIME_TYPES.includes(this.props.route.params.mimeType)
                                    ? <>
                                        <Pressable style={({ pressed }) => [
                                            globalStyles.authPageActionButton, {
                                                alignSelf: "center",
                                                opacity: pressed ? 0.1 : 1,
                                            }
                                        ]} onPress={() => {
                                            this.playSound();
                                        }}>
                                            <Text style={globalStyles.authPageActionButtonText}>Play/pause audio</Text>
                                        </Pressable>
                                    </>
                                    : null
                    }
                </View>
            </View>
        )
    }
}
