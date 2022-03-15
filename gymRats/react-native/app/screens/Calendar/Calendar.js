import React, { Component } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from 'react-icons/io';
import { FaWeight } from 'react-icons/fa';
import { BsJournalBookmarkFill } from 'react-icons/bs';
import BottomSheet from "react-native-gesture-bottom-sheet";
import WeightTrackerCard from '../../components/WeightTrackerCard/WeightTrackerCard';
import WeightTracker from '../cards/WeightTracker/WeightTracker';
import ApiRequests from '../../classes/ApiRequests';
import LogbookCard from '../../components/LogbookCard/LogbookCard';
import { cardColors } from '../../../assets/styles/cardColors';
import { HTTP_STATUS_CODES } from '../../../../api/global';
import i18n from 'i18n-js';

const globalStyles = require('../../../assets/styles/global.styles');
const styles = require('./Calendar.styles');

export default class Calendar extends Component {

    constructor(props) {
        super(props);
        this.bottomSheet = React.createRef();
    }

    state = {
        dates: [],
        doNotShow: [],
        selectedDate: null,
        timezoneOffset: null,
        showDatePicker: true,
    }

    focusListener;

    onFocusFunction = () => {
        if (this.props && this.props.route && this.props.route.params && this.props.route.params.reloadDate) {
            this.setState({
                selectedDate: this.props.route.params.date,
                timezoneOffset: new Date(this.props.route.params.date).getTimezoneOffset()
            }, () => {
                this.getDate(this.state.selectedDate, this.state.timezoneOffset);
            })
        } else {
            this.getCurrentDate();
        }
    }

    async componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction()
        })
    }

    componentWillUnmount() {
        if (this.focusListener) this.focusListener()
    }

    reloadDateAfterDelete = (date) => {
        this.setState({
            selectedDate: date,
            timezoneOffset: new Date(date).getTimezoneOffset()
        }, () => {
            this.getDate(this.state.selectedDate, this.state.timezoneOffset);
        })
    }

    getDate = (selectedDate, timezoneOffset) => {
        ApiRequests.get(`date?date=${selectedDate.getDate()}&month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}`, false, true).then((response) => {
            const dates = this.state.dates;
            for (let index = 0; index < dates.length; index++) {
                if (dates[index].date.getTime() == selectedDate.getTime()) {
                    dates.splice(index, 1);
                }
            }
            dates.push({ date: selectedDate, cards: response.data.cards });
            this.setState({ dates: dates, doNotShow: response.data.doNotShow });
        }).catch((error) => {
            throw new Error(error);
        })
    }

    getCurrentDate = () => {
        const currentDate = new Date(new Date().setHours(new Date().getHours() + 5));
        console.log(currentDate);
        this.setState({ selectedDate: currentDate, timezoneOffset: new Date().getTimezoneOffset() }, () => {
            this.getDate(this.state.selectedDate, this.state.timezoneOffset);
        });
    }

    incrementDate = (amount) => {
        const incrementedDate = new Date(this.state.selectedDate);
        incrementedDate.setDate(incrementedDate.getDate() + amount);
        this.setState({ selectedDate: incrementedDate }, () => {
            this.getDate(this.state.selectedDate, this.state.timezoneOffset)
        })
    }

    render() {
        return <View style={globalStyles.safeAreaView}>
            <View style={[globalStyles.pageContainer, {
                flexGrow: 1,
                flexShrink: 1
            }]}>
                <View style={globalStyles.pageLogoContainer}>
                    <Image style={globalStyles.pageLogo} source={require('../../../assets/img/icon.png')} />
                    <Text style={globalStyles.pageLogoText}>Gym Rats</Text>
                </View>
                {
                    this.state.selectedDate
                        ? <View style={{
                            flexGrow: 1,
                            flexShrink: 1
                        }}>
                            <View style={styles.calendarControllersContainer}>
                                <View style={styles.calendarController} onClick={() => { this.incrementDate(-1) }}>
                                    <IoIosArrowBack style={{ marginRight: 5 }} size={14} color="#999" />
                                    <Text style={styles.calendarControllerText}>{i18n.t('screens')['calendar']['calendarControllerBack']}</Text>
                                </View>
                                <Text style={styles.calendarCurrentDate} onClick={() => { this.setState({ showDatePicker: true }) }}>
                                    {this.state.selectedDate.getDate()}
                                    .
                                    {
                                        this.state.selectedDate.getMonth() + 1 < 10
                                            ? `0${(this.state.selectedDate.getMonth() + 1)}`
                                            : (this.state.selectedDate.getMonth() + 1)
                                    }
                                </Text>
                                <View style={[styles.calendarController, { justifyContent: 'flex-end' }]} onClick={() => { this.incrementDate(1) }}>
                                    <Text style={styles.calendarControllerText}>{i18n.t('screens')['calendar']['calendarControllerNext']}</Text>
                                    <IoIosArrowForward style={{ marginLeft: 5 }} size={14} color="#999" />
                                </View>
                            </View>
                            <View>
                                <TouchableOpacity style={[globalStyles.authPageActionButton, {
                                    marginBottom: 16
                                }]} onPress={() => {
                                    this.bottomSheet.current.show()
                                }}>
                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['calendar']['addData']}</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView contentContainerStyle={{
                                flexGrow: 1,
                                flexShrink: 1
                            }}>
                                {
                                    this.state.dates.map((date) =>
                                        date.date.getTime() == this.state.selectedDate.getTime()
                                            ? date.cards.length > 0
                                                ? date.cards.map((card) =>
                                                    card.card == "dailyWeights"
                                                        ? <WeightTrackerCard data={card.data} actionButtonFunction={() => {
                                                            this.props.navigation.navigate("WeightTracker", {
                                                                date: this.state.selectedDate,
                                                                timezoneOffset: this.state.timezoneOffset,
                                                                weight: card.data.weight,
                                                                weightUnit: card.data.unit,
                                                                _id: card.data._id
                                                            });
                                                        }} key={card.data._id} data={card.data} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} />
                                                        : card.card == 'workoutSessions'
                                                            ? <LogbookCard actionButtonFunction={() => {
                                                                this.props.navigation.navigate("Logbook", {
                                                                    date: this.state.selectedDate,
                                                                    timezoneOffset: this.state.timezoneOffset,
                                                                    data: card.data
                                                                });
                                                            }} data={card.data} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} />
                                                            : null
                                                )
                                                : <Text style={globalStyles.notation}>{i18n.t('screens')['calendar']['noData']}</Text>
                                            : null
                                    )
                                }
                            </ScrollView>
                        </View>
                        : null
                }
            </View>
            <BottomSheet ref={this.bottomSheet} height={400} draggable={false}>
                <View style={styles.bottomSheetTopbar}>
                    <Text style={styles.bottomSheetTitle}>{i18n.t('screens')['calendar']['bottomSheetTitle']}</Text>
                    <IoMdClose size={30} onClick={() => {
                        this.bottomSheet.current.close();
                    }} />
                </View>
                <ScrollView style={styles.cardsContainer}>
                    {
                        this.state.doNotShow.length == 2
                            ? <Text style={globalStyles.notation}>{i18n.t('screens')['calendar']['bottomSheetNoCards']}</Text>
                            : null
                    }
                    {
                        !this.state.doNotShow.includes("dailyWeights")
                            ? <View style={[styles.card, {
                                backgroundColor: cardColors.weightTracker
                            }]} onClick={() => {
                                this.bottomSheet.current.close();
                                this.props.navigation.navigate("WeightTracker", {
                                    date: this.state.selectedDate,
                                    timezoneOffset: this.state.timezoneOffset
                                });
                            }}>
                                <View style={styles.cardTopbar}>
                                    <FaWeight color="#fff" size={25} />
                                    <Text style={styles.cardTitle}>{i18n.t('components')['cards']['weightTracker']['cardTitle']}</Text>
                                </View>
                            </View>
                            : null
                    }
                    {
                        !this.state.doNotShow.includes("workoutSessions")
                            ? <View style={[styles.card, {
                                backgroundColor: cardColors.logbook
                            }]} onClick={() => {
                                this.bottomSheet.current.close();
                                this.props.navigation.navigate("Logbook", {
                                    date: this.state.selectedDate,
                                    timezoneOffset: this.state.timezoneOffset
                                });
                            }}>
                                <View style={styles.cardTopbar}>
                                    <BsJournalBookmarkFill color="#fff" size={25} />
                                    <Text style={styles.cardTitle}>{i18n.t('components')['cards']['logbook']['cardTitle']}</Text>
                                </View>
                            </View>
                            : null
                    }
                </ScrollView>
            </BottomSheet>
        </View >;
    }
}
