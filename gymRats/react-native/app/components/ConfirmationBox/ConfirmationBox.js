import React, { Component } from 'react'
import { Text, View, Modal, TouchableOpacity } from 'react-native'

import i18n from 'i18n-js';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './ConfirmationBox.styles';

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
                            <TouchableOpacity style={styles.confirmationBoxOption} onPress={() => {
                                this.props.deleteCard();
                                this.props.toggleShowConfirmationBox(false);
                            }}>
                                <Text style={globalStyles.modalActionTitle}>{i18n.t('components')['confirmationBox']['affirmation']}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmationBoxOption} onPress={() => {
                                this.props.toggleShowConfirmationBox(false);
                            }}>
                                <Text style={[globalStyles.modalActionTitle, {
                                    color: "#1f6cb0"
                                }]}>{i18n.t('components')['confirmationBox']['denial']}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}
