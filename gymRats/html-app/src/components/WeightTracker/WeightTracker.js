import React from 'react'

import './WeightTracker.css';

import { IoMdArrowBack } from 'react-icons/io';
import ApiRequests from '../../classes/ApiRequests';

import { Chart } from "react-google-charts";

class WeightTracker extends React.Component {

    monthTitles = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December"
    }

    state = {
        selectedUnit: "KILOGRAMS",
        weight: null,
        graphData: []
    }

    componentDidMount() {
        this.setState({ selectedUnit: (this.props.data.unit) ? this.props.data.unit : "KILOGRAMS", weight: (this.props.data.weight) ? this.props.data.weight : null });
        this.getGraphData();
    }

    getGraphData() {
        ApiRequests.get("weight-tracker/weight-graph/KILOGRAMS", false, true).then((response) => {
            for (let date of response.data.graphData) {
                date[0] = new Date(date[0]).toLocaleDateString();
            }
            this.setState({ graphData: response.data.graphData });
        }).catch((error) => {
            throw new Error(error);
        })
    }

    postDailyWeight = () => {
        ApiRequests.post('weight-tracker/daily-weight', false, {
            date: this.props.data.date,
            month: this.props.data.month,
            year: this.props.data.year,
            weight: this.state.weight,
            unit: this.state.selectedUnit,
        }, true).then((response) => {
            this.props.toggleOverlay(false);
        }).catch((error) => {
            throw new Error(error);
        })
    }

    render() {
        return (
            <div className="overlay">
                <div className="overlay-topbar">
                    <IoMdArrowBack style={{ fontSize: "2rem" }} onClick={() => { this.props.toggleOverlay(false) }} />
                    <div className="overlay-topbar-column">
                        <p className="overlay-title">Weight tracker</p>
                        <p className="overlay-date">{this.props.data.date} {this.monthTitles[this.props.data.month]} {this.props.data.year}</p>
                    </div>
                </div>
                <div className="weight-tracker-contents">
                    <div className="weight-tracker-weight-input-container">
                        <input step="any" type="number" className="weight-tracker-weight-input" placeholder="Weight:" value={this.state.weight} onChange={(evt) => { this.setState({ weight: evt.target.value }) }} />
                        <select className="weight-tracker-weight-unit" value={this.state.selectedUnit} onChange={(evt) => { this.setState({ selectedUnit: evt.target.value }) }}>
                            <option value="POUNDS">lbs</option>
                            <option value="KILOGRAMS">kgs</option>
                        </select>
                    </div>
                    <button className="weight-tracker-weight-action-button" onClick={() => {
                        this.postDailyWeight();
                    }}>{
                            this.props.data.weight == null
                                ? "ADD"
                                : "UPDATE"
                        }</button>
                    <br />
                    <br />
                    <p className="notation">Click anywhere on the graph to see weight measurement</p>
                    <br />
                    <Chart
                        width={'100%'}
                        height={'100px'}
                        chartType="LineChart"
                        loader={<div>Loading Chart</div>}
                        style={{
                            width: '100%'
                        }}
                        options={{
                            colors: ["#3dc7be"],
                            backgroundColor: {
                                fill: "white"
                            },
                            legend: "none",
                            vAxis: {
                                count: 0,
                                gridlines: {
                                    color: "#e7e7e7"
                                },
                                baselineColor: "#e7e7e7"
                            },
                            hAxis: {
                                count: 0,
                                gridlines: {
                                    color: "#e7e7e7"
                                },
                                textPosition: "none",
                                baselineColor: "#e7e7e7"
                            }
                        }}
                        data={this.state.graphData}
                    />
                </div>
            </div>
        )
    }
}

export default WeightTracker
