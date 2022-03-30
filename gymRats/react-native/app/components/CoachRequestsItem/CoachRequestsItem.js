import React, { Component } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { IoMdClose } from 'react-icons/io';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./CoachRequestsItem.styles');

export default class CoachRequestsItem extends Component {
    render() {
        return (
            <View style={styles.chatItemContainer} onClick={this.navigateToChat}>
                <View style={styles.coachRequestInfoContainer}>
                    <IoMdClose size={18} color="#aaa" style={{marginRight: 8}} onClick={() => {
                        this.props.updateRequestStatus(this.props.relation._id, "DECLINED");
                    }}/>
                    {
                        !this.props.relation.initiator.profilePicture
                            ? <View style={styles.profilePictureContainer}>
                                <Text style={styles.noProfilePictureText}>
                                    {this.props.relation.initiator.firstName.charAt(0)}
                                    {this.props.relation.initiator.lastName.charAt(0)}
                                </Text>
                            </View>
                            : <Image style={styles.profilePictureContainer}
                                source={{ uri: this.props.relation.initiator.profilePicture }} />
                    }
                    <View style={styles.chatsItemDetailsContainer}>
                        <Text style={styles.chatsItemNames}>{this.props.relation.initiator.firstName} {this.props.relation.initiator.lastName}</Text>
                    </View>
                </View>
                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                    marginTop: 14
                }]} onPress={() => {
                    this.props.updateRequestStatus(this.props.relation._id, "ACCEPTED");
                }}>
                    <Text style={globalStyles.authPageActionButtonText}>Accept request</Text>
                </TouchableOpacity>
            </View>
        )
    }
}
