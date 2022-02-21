import React from 'react'

import './Calendar.css';

import ApiRequests from '../../classes/ApiRequests';

import * as GiIcons from 'react-icons/gi'
import * as MdIcons from 'react-icons/md'
import CalorieCounter from '../../components/CalorieCounter/CalorieCounter';
import WeightTrackerBox from '../../components/WeightTrackerBox/WeightTrackerBox';
import WeightTracker from '../../components/WeightTracker/WeightTracker';
import AddCard from '../../components/AddCard/AddCard';
import { Navigate } from 'react-router-dom';

class Calendar extends React.Component {

    state = {
        dates: [],
        showCalorieCounter: false,
        showWeightTracker: false,
        showAddCard: false,
        selectedDate: null,
        selectedMonth: null,
        selectedYear: null,
        currentData: null,
        navigateToLogin: false,
        firstName: null
    }

    componentDidMount() {
        ApiRequests.post('user/validate-token', {}, {}, true).then((response) => {
            const isTokenValid = response.data.valid;
            this.setState({ navigateToLogin: !isTokenValid, firstName: response.data.firstName });
            if (isTokenValid) {
                this.generateDates();
            }
        }).catch((error) => {
            this.setState({ navigateToLogin: true });
        })
    }

    generateDates = () => {
        const currentDate = new Date();
        this.setState({
            selectedDate: currentDate.getDate(),
            selectedMonth: currentDate.getMonth(),
            selectedYear: currentDate.getFullYear(),
        })
        this.getDate(currentDate.getDate(), currentDate.getMonth(), currentDate.getFullYear());
    }

    incrementDate = (amount) => {
        this.hideAllPopups();
        var incrementedDate = new Date(this.state.selectedYear, this.state.selectedMonth, this.state.selectedDate);
        incrementedDate.setDate(incrementedDate.getDate() + amount);
        this.setState({ selectedDate: incrementedDate.getDate(), selectedMonth: incrementedDate.getMonth(), selectedYear: incrementedDate.getFullYear() })
        this.getDate(incrementedDate.getDate(), incrementedDate.getMonth(), incrementedDate.getFullYear());
    }

    getDate(date, month, year) {
        ApiRequests.get(`date/${date}/${month}/${year}`, false, true).then((response) => {
            const dates = this.state.dates;
            for (let index = 0; index < dates.length; index++) {
                if (dates[index].date == `${date}${month < 10 ? "0" + (month + 1) : month}${year}`) {
                    dates.splice(index, 1);
                }
            }
            dates.push({ date: `${date}${month < 10 ? "0" + (month + 1) : month}${year}`, cards: response.data });
            this.setState({ dates: dates });
        }).catch((error) => {
            throw new Error(error);
        })
    }

    toggleShowCalorieCounter = (state) => {
        this.hideAllPopups();
        this.setState({ showCalorieCounter: state })
        this.getDate(this.state.selectedDate, this.state.selectedMonth, this.state.selectedYear);
    }

    toggleShowWeightTracker = (state) => {
        this.hideAllPopups();
        this.setState({ showWeightTracker: state });
        this.getDate(this.state.selectedDate, this.state.selectedMonth, this.state.selectedYear);
    }

    toggleShowAddCard = (state) => {
        this.hideAllPopups();
        this.setState({ showAddCard: state });
    }

    hideAllPopups = () => {
        this.setState({ showCalorieCounter: false, showWeightTracker: false, showAddCard: false });
    }

    setCurrentData = (data) => {
        this.setState({ currentData: data })
    }

    setAddCardCurrentData = () => {
        const data = {
            date: this.state.selectedDate,
            month: this.state.selectedMonth + 1,
            year: this.state.selectedYear,
            cards: []
        };

        for (let date of this.state.dates) {
            if (date.date == `${this.state.selectedDate}${this.state.selectedMonth < 10 ? "0" + (this.state.selectedMonth + 1) : this.state.selectedMonth}${this.state.selectedYear}`) {
                data.cards = date.cards;
                break;
            }
        }

        this.setCurrentData(data);
    }

    render() {
        if (this.state.navigateToLogin) {
            return (
                <Navigate to="/login" />
            )
        }
        return (
            <>
                {
                    this.state.showAddCard && <AddCard toggleOverlay={this.toggleShowAddCard} data={this.state.currentData} toggleCardOverlays={{
                        "weightTracker": this.toggleShowWeightTracker
                    }} />
                }
                {
                    this.state.showCalorieCounter && <CalorieCounter toggleOverlay={this.toggleShowCalorieCounter} data={this.state.currentData} />
                }
                {
                    this.state.showWeightTracker && <WeightTracker toggleOverlay={this.toggleShowWeightTracker} data={this.state.currentData} getDate={this.getDate} />
                }
                <div className="login-page-container">
                    <div className="login-page-logo">
                        <GiIcons.GiWeightLiftingUp style={{ color: "#4e4e6a" }} />
                        <p className="login-page-logo-text" style={{ color: "#1f6cb0" }}>Gym rats</p>
                    </div>
                    <div className="home-page-topbar">
                        <p className="home-page-title">Hi, {this.state.firstName}!</p>
                        {
                            /*
                            <CgIcons.CgProfile style={{ color: "#ccc", fontSize: "2rem" }} />
                            */
                        }
                    </div>
                    {
                        this.state.selectedDate != null && this.state.selectedMonth != null && this.state.selectedYear != null
                            ? <>
                                <div className="home-page-date-picker">
                                    <div className="home-page-date-picker-side" onClick={() => { this.incrementDate(-1) }}>
                                        <MdIcons.MdChevronLeft style={{ marginTop: "-1px", color: "#999" }} />
                                        <p className="home-page-date-picker-side-title">Previous</p>
                                    </div>
                                    <p className="home-page-date-picker-current-title">{this.state.selectedDate}.{this.state.selectedMonth + 1 < 10 ? "0" + (this.state.selectedMonth + 1) : this.state.selectedMonth + 1}</p>
                                    <div className="home-page-date-picker-side right-side" onClick={() => { this.incrementDate(1) }}>
                                        <p className="home-page-date-picker-side-title">Next</p>
                                        <MdIcons.MdChevronRight style={{ marginTop: "-1px", color: "#999" }} />
                                    </div>
                                </div>
                                <div className="home-page-date">
                                    <button className="home-page-date-add-card" onClick={() => { this.setAddCardCurrentData(); this.toggleShowAddCard(true) }}>Add data</button>
                                    <div className="home-page-date-section">
                                        {/*<CalorieCounterBox toggleOverlay={this.toggleShowCalorieCounter} /> */}
                                        {
                                            this.state.dates.map((date) =>
                                                date.date == `${this.state.selectedDate}${this.state.selectedMonth < 10 ? "0" + (this.state.selectedMonth + 1) : this.state.selectedMonth}${this.state.selectedYear}`
                                                    ? date.cards.length > 0
                                                        ? date.cards.map((card) =>
                                                            card.card == "dailyWeights"
                                                                ? <WeightTrackerBox toggleOverlay={this.toggleShowWeightTracker} data={card.data} setCurrentData={this.setCurrentData} />
                                                                : null
                                                        )
                                                        : <p className="notation">No data added for that date</p>
                                                    : null
                                            )
                                        }
                                    </div>
                                </div>
                            </>
                            : <p className="notation">Loading...</p>
                    }
                </div>
            </>
        )
    }
}

export default Calendar
