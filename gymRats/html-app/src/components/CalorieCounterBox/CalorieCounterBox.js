import React from 'react'

import * as BiIcons from 'react-icons/bi';

import './CalorieCounterBox.css';

class CalorieCounterBox extends React.Component {

    mainContainerColor = "#9ae17b";

    render() {
        return (
            <div className="box-container">
                <div className="box-container-topbar">
                    <BiIcons.BiDish style={{ color: this.mainContainerColor }} />
                    <p className="box-container-title">Calories counter</p>
                </div>
                <div className="box-container-content">
                    <span className="calories">2145 taken &middot; 2355 left</span>
                    <button className='calories-action-button' onClick={() => { this.props.toggleOverlay(true) }}>Add calories / Check intake</button>
                </div>
            </div>
        )
    }
}

export default CalorieCounterBox
