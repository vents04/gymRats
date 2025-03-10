import React, { Component } from 'react'
import { Image, Text, Pressable, View, ActivityIndicator } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import i18n from 'i18n-js';

import { RELATION_STATUSES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './CoachRequestsItem.styles';

export default class CoachRequestsItem extends Component {
    render() {
        return (
            <View style={styles.chatItemContainer}>
                <View style={styles.coachRequestInfoContainer}>
                    <Pressable style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.1 : 1,
                        }
                    ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                        this.props.updateRelationStatus(this.props.relation._id, RELATION_STATUSES.DECLINED);
                    }} >
                        <Ionicons name="close" size={18} color="#aaa" style={{ marginRight: 8 }} />
                    </Pressable>
                    {
                        !this.props.relation.client.profilePicture
                            ? <View style={styles.profilePictureContainer}>
                                <Text style={styles.noProfilePictureText}>
                                    {this.props.relation.client.firstName.charAt(0)}
                                    {this.props.relation.client.lastName.charAt(0)}
                                </Text>
                            </View>
                            : <Image style={styles.profilePictureContainer}
                                source={{ uri: this.props.relation.client.profilePicture }} />
                    }
                    <View style={styles.chatsItemDetailsContainer}>
                        <Text style={styles.chatsItemNames}>{this.props.relation.client.firstName}&nbsp;{this.props.relation.client.lastName}</Text>
                    </View>
                </View>
                <Pressable style={({ pressed }) => [
                    globalStyles.authPageActionButton,
                    {
                        opacity: pressed ? 0.1 : 1,
                        marginTop: 14
                    }
                ]}
                    onPress={() => {
                        this.props.updateRelationStatus(this.props.relation._id, RELATION_STATUSES.ACTIVE);
                    }}>
                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('components')['coachRequestItem']['acceptRequest']}</Text>
                </Pressable>
            </View>
        )
    }
}
