import React, { Component } from 'react'
import { Text, View, Modal } from 'react-native'

import i18n from 'i18n-js';

import globalStyles from '../../../assets/styles/global.styles';

export default class ConfirmationBox extends Component {

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={true}
                onRequestClose={() => {
                    this.props.toggleShowConfirmationBox(false);
                }}>
                <View style={globalStyles.centeredView}>
                    <View style={globalStyles.modalView}>
                        <Text style={globalStyles.modalText}>{i18n.t('components')['confirmationBox']['question']}</Text>
                        <View style={globalStyles.modalActionsContainer}>
                            <Text style={globalStyles.modalActionTitle} onClick={() => {
                                this.props.deleteCard();
                                this.props.toggleShowConfirmationBox(false);
                            }}>{i18n.t('components')['confirmationBox']['affirmation']}</Text>
                            <Text style={[globalStyles.modalActionTitle, {
                                color: "#1f6cb0"
                            }]} onClick={() => {
                                this.props.toggleShowConfirmationBox(false);
                            }}>{i18n.t('components')['confirmationBox']['denial']}</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}
