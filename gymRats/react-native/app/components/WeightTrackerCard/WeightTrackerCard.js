import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { FaWeight, FaLongArrowAltUp, FaLongArrowAltDown } from 'react-icons/fa';

const { cardColors } = require('../../../assets/styles/cardColors');
const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./WeightTrackerCard.styles');

export default class WeightTrackerCard extends Component {
    render() {
        return <View style={globalStyles.card}>
            <View style={globalStyles.cardTopbar}>
                <FaWeight size={25} color={cardColors.weightTracker} />
                <Text style={globalStyles.cardTitle}>Weight</Text>
            </View>
            <View>
                <Text style={styles.weight}>
                    {this.props.data.weight}
                    &nbsp;
                    {
                        this.props.data.unit == "KILOGRAMS"
                            ? "kgs"
                            : "lbs"
                    }
                </Text>
                {
                    this.props.data.trend != 0
                        ? this.props.data.trend < 0
                            ? <View style={styles.statsContainer}>
                                <FaLongArrowAltDown size={20} color={cardColors.negative} />
                                <Text style={styles.weightTrend}>
                                    {Math.abs(this.props.data.trend)}
                                    &nbsp;
                                    {
                                        this.props.data.unit == "KILOGRAMS"
                                            ? "kgs"
                                            : "lbs"
                                    }
                                    &nbsp;
                                    lost compared to last measurement</Text>
                            </View>
                            : <View style={styles.statsContainer}>
                                <FaLongArrowAltUp size={20} color={cardColors.weightTracker} />
                                <Text style={styles.weightTrend}>
                                    {this.props.data.trend}
                                    &nbsp;
                                    {
                                        this.props.data.unit == "KILOGRAMS"
                                            ? "kgs"
                                            : "lbs"
                                    }
                                    &nbsp;
                                    gained compared to last measurement</Text>
                            </View>
                        : null
                }
                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                    backgroundColor: cardColors.weightTracker,
                    marginTop: 16
                }]} onPress={() => {
                    this.props.actionButtonFunction();
                }}>
                    <Text style={globalStyles.authPageActionButtonText}>More info</Text>
                </TouchableOpacity>
            </View>
        </View>;
    }
}
