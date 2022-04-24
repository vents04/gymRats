import React, { Component } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { IoMdClose } from 'react-icons/io';

import { RELATION_STATUSES } from '../../../global';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './CoachRequestsItem.styles';

export default class CoachRequestsItem extends Component {
    render() {
        return (
            <View style={styles.chatItemContainer} onClick={this.navigateToChat}>
                <View style={styles.coachRequestInfoContainer}>
                    <IoMdClose size={18} color="#aaa" style={{ marginRight: 8 }} onClick={() => {
                        this.props.updateRelationStatus(this.props.relation._id, RELATION_STATUSES.DECLINED);
                    }} />
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
                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                    marginTop: 14
                }]} onPress={() => {
                    this.props.updateRelationStatus(this.props.relation._id, RELATION_STATUSES.ACTIVE);
                }}>
                    <Text style={globalStyles.authPageActionButtonText}>Accept request</Text>
                </TouchableOpacity>
            </View>
        )
    }
}
