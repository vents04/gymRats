import React from 'react'

import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';
import { HiOutlineArrowNarrowDown, HiOutlineArrowNarrowUp } from 'react-icons/hi';

import './WeightTrackerBox.css';

class WeightTrackerBox extends React.Component {

    mainContainerColor = "#3dc7be";

    UNIT_LABELS = {
        KILOGRAMS: "kgs",
        POUNDS: "lbs"
    }

    render() {
        return (
            <div className="box-container">
                <div className="box-container-topbar">
                    <FaIcons.FaWeight style={{ color: this.mainContainerColor }} />
                    <p className="box-container-title">Weight tracker</p>
                </div>
                <div className="box-container-content">
                    <span className="calories">{this.props.data.weight}
                        &nbsp;
                        {this.UNIT_LABELS[this.props.data.unit]}
                        {
                            this.props.data.trend != 0
                                ? <span>&nbsp;&middot;&nbsp;</span>
                                : null
                        }
                        {
                            this.props.data.trend != 0
                                ? this.props.data.trend > 0
                                    ? <span className="weight-tracker-box-trend weight-tracker-box-trend-positive"><HiOutlineArrowNarrowUp style={{ fontSize: "15px" }} />{this.props.data.trend}{this.UNIT_LABELS[this.props.data.unit]} compared to your last measurement</span>
                                    : <span className="weight-tracker-box-trend weight-tracker-box-trend-negative"><HiOutlineArrowNarrowDown style={{ fontSize: "15px" }} />{Math.abs(this.props.data.trend)}{this.UNIT_LABELS[this.props.data.unit]} compared to your last measurement</span>

                                : null
                        }
                    </span>
                    <button style={{ backgroundColor: this.mainContainerColor }} className='calories-action-button' onClick={() => { this.props.setCurrentData(this.props.data); this.props.toggleOverlay(true) }}>More info</button>
                </div>
            </div>
        )
    }
}

export default WeightTrackerBox
