import React, { Component } from 'react'
import { Text, View, Modal, Pressable } from 'react-native'
import { cardColors } from '../../../assets/styles/cardColors';
import { HTTP_STATUS_CODES } from '../../../global';
import ApiRequests from '../../classes/ApiRequests';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./ConfirmationBox.styles');

export default class ConfirmationBox extends Component {

    state = {
        data: null
    }

    componentDidMount() {
        this.setState({ data: this.props.data }, () => {
            console.log(this.props);
        })
    }

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={true}
                onRequestClose={() => {
                    this.props.toggleShowConfirmationBox(false);
                }}
            >
                <View style={globalStyles.centeredView}>
                    <View style={globalStyles.modalView}>
                        <Text style={globalStyles.modalText}>Are you sure you want to delete this item?</Text>
                        <View style={globalStyles.modalActionsContainer}>
                            <Text style={globalStyles.modalActionTitle} onClick={() => {
                                this.props.deleteCard()
                            }}>Yes</Text>
                            <Text style={[globalStyles.modalActionTitle, {
                                color: "#1f6cb0"
                            }]} onClick={() => {
                                this.props.toggleShowConfirmationBox(false);
                            }}>No</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}
