import React, { Component } from 'react'
import { Text, View, Modal, Pressable } from 'react-native'

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
                            <Pressable onPress={() => {
                                this.props.deleteCard();
                                this.props.toggleShowConfirmationBox(false);
                            }} style={({ pressed }) => [
                                styles.confirmationBoxOption,
                                {
                                    opacity: pressed ? 0.1 : 1,
                                }
                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                                <Text style={globalStyles.modalActionTitle}>{i18n.t('components')['confirmationBox']['affirmation']}</Text>
                            </Pressable>
                            <Pressable style={({ pressed }) => [
                                styles.confirmationBoxOption,
                                {
                                    opacity: pressed ? 0.1 : 1,
                                }
                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }}
                                onPress={() => {
                                    this.props.toggleShowConfirmationBox(false);
                                }}>
                                <Text style={[globalStyles.modalActionTitle, {
                                    color: "#1f6cb0"
                                }]}>{i18n.t('components')['confirmationBox']['denial']}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}
