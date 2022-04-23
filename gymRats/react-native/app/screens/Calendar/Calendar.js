import React, { Component } from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from "react-native-gesture-bottom-sheet";

import ApiRequests from '../../classes/ApiRequests';

import i18n from 'i18n-js';

import LogoBar from '../../components/LogoBar/LogoBar';
import WeightTrackerCard from '../../components/WeightTrackerCard/WeightTrackerCard';
import CaloriesIntakeCard from '../../components/CaloriesIntakeCard/CaloriesIntakeCard';
import LogbookCard from '../../components/LogbookCard/LogbookCard';

import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from 'react-icons/io';
import { FaWeight } from 'react-icons/fa';
import { BsJournalBookmarkFill } from 'react-icons/bs';
import { GiMeal } from 'react-icons/gi';

import { ACTIVE_CARDS } from '../../../global';
import { cardColors } from '../../../assets/styles/cardColors';

import globalStyles from '../../../assets/styles/global.styles';
import styles from './Calendar.styles';

export default class Calendar extends Component {

    constructor(props) {
        super(props);

        this.bottomSheet = React.createRef();

        this.state = {
            dates: [],
            doNotShow: [],
            selectedDate: null,
            timezoneOffset: null,
            showDatePicker: true,
        }

        this.focusListener;
    }

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

    componentDidMount() {
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

    getDate = (selectedDate) => {
        ApiRequests.get(`date?date=${selectedDate.getDate()}&month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}`, false, true).then((response) => {
            const dates = [...this.state.dates];
            for (let index = 0; index < dates.length; index++) {
                if (dates[index].date.getTime() == selectedDate.getTime()) {
                    dates.splice(index, 1);
                }
            }
            dates.push({ date: selectedDate, cards: response.data.cards });
            this.setState({ dates: dates, doNotShow: response.data.doNotShow });
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showError: true, error: error.response.data });
                } else {
                    ApiRequests.showInternalServerError();
                }
            } else if (error.request) {
                ApiRequests.showNoResponseError();
            } else {
                ApiRequests.showRequestSettingError();
            }
        })
    }

    getCurrentDate = () => {
        const currentDate = new Date();
        const timezoneOffset = currentDate.getTimezoneOffset();
        this.setState({ selectedDate: currentDate, timezoneOffset });
        this.getDate(currentDate, this.state.timezoneOffset);
    }

    incrementDate = (amount) => {
        const incrementedDate = new Date(this.state.selectedDate);
        incrementedDate.setDate(incrementedDate.getDate() + amount);
        this.setState({ selectedDate: incrementedDate });
        this.getDate(incrementedDate, this.state.timezoneOffset);
    }

    render() {
        return <View style={globalStyles.safeAreaView}>
            <View style={globalStyles.pageContainer}>
                <LogoBar />
                {
                    this.state.selectedDate &&
                    <View style={globalStyles.fillEmptySpace}>
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
                        <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                            {
                                this.state.dates.map((date) =>
                                    date.date.getTime() == this.state.selectedDate.getTime()
                                        ? date.cards.length > 0
                                            ? date.cards.map((card) =>
                                                card.card == "dailyWeights"
                                                    ? <WeightTrackerCard key={`${date}${card._id}`} actionButtonFunction={() => {
                                                        this.props.navigation.navigate("WeightTracker", {
                                                            date: this.state.selectedDate,
                                                            timezoneOffset: this.state.timezoneOffset,
                                                            weight: card.data.weight,
                                                            weightUnit: card.data.unit,
                                                            _id: card.data._id
                                                        });
                                                    }} data={card.data} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} {...this.props} />
                                                    : card.card == 'workoutSessions'
                                                        ? <LogbookCard key={`${date}${card._id}`} actionButtonFunction={() => {
                                                            this.props.navigation.navigate("Logbook", {
                                                                date: this.state.selectedDate,
                                                                timezoneOffset: this.state.timezoneOffset,
                                                                data: card.data
                                                            });
                                                        }} data={card.data} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} {...this.props} />
                                                        : card.card == 'caloriesCounterDays'
                                                            ? <CaloriesIntakeCard key={`${date}${card._id}`} actionButtonFunction={() => {
                                                                this.props.navigation.navigate("CaloriesIntake", {
                                                                    date: this.state.selectedDate,
                                                                    timezoneOffset: this.state.timezoneOffset,
                                                                    data: card.data
                                                                });
                                                            }} data={card.data} rerender={this.reloadDateAfterDelete} date={this.state.selectedDate} {...this.props} />
                                                            : null
                                            )
                                            : <Text key={date} style={globalStyles.notation}>{i18n.t('screens')['calendar']['noData']}</Text>
                                        : null
                                )
                            }
                        </ScrollView>
                    </View>
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
                        this.state.doNotShow.length == Object.keys(ACTIVE_CARDS).length
                        && <Text style={globalStyles.notation}>{i18n.t('screens')['calendar']['bottomSheetNoCards']}</Text>
                    }
                    {
                        !this.state.doNotShow.includes("dailyWeights")
                        && <View style={[styles.card, {
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
                    }
                    {
                        !this.state.doNotShow.includes("workoutSessions")
                        && <View style={[styles.card, {
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
                    }
                    {
                        !this.state.doNotShow.includes("caloriesCounterDays")
                        && <View style={[styles.card, {
                            backgroundColor: cardColors.caloriesIntake
                        }]} onClick={() => {
                            this.bottomSheet.current.close();
                            this.props.navigation.navigate("CaloriesIntake", {
                                date: this.state.selectedDate,
                                timezoneOffset: this.state.timezoneOffset
                            });
                        }}>
                            <View style={styles.cardTopbar}>
                                <GiMeal color="#fff" size={25} />
                                <Text style={styles.cardTitle}>Calories intake</Text>
                            </View>
                        </View>
                    }
                </ScrollView>
            </BottomSheet>
        </View >;
    }
}
