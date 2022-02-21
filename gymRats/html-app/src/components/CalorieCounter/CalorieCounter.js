import React from 'react'

import * as IoIcons from 'react-icons/io';
import SearchCalorieCounterItems from '../SearchCalorieCounterItems/SearchCalorieCounterItems';

import './CalorieCounter.css';

class CalorieCounter extends React.Component {

    state = {
        showSearchCalorieCounterItems: false
    }

    toggleShowSearchCalorieCounterItems = (state) => {
        this.setState({ showSearchCalorieCounterItems: state });
    }

    render() {
        return (
            <div className="overlay">
                {
                    this.state.showSearchCalorieCounterItems && <SearchCalorieCounterItems toggleOverlay={this.toggleShowSearchCalorieCounterItems} />
                }
                <div className="overlay-topbar">
                    <IoIcons.IoMdArrowBack style={{ fontSize: "2rem" }} onClick={() => { this.props.toggleOverlay(false) }} />
                    <p className="overlay-title">Calories counter</p>
                </div>
                <div className="items-section">
                    <p className="items-section-title">Breakfast</p>
                    <div className="item">
                        <div className="item-left">
                            <p className="item-title">Fine oats</p>
                            <div className="item-stats">
                                <p className="item-amount">60 grams</p>&nbsp;&middot;&nbsp;
                                <p className="item-calories">240 calories</p>
                            </div>
                        </div>
                        <IoIcons.IoMdClose style={{ fontSize: "1.5rem" }} />
                    </div>
                    <div className="item">
                        <div className="item-left">
                            <p className="item-title">Kiselo mlqko 2%</p>
                            <div className="item-stats">
                                <p className="item-amount">400 grams</p>&nbsp;&middot;&nbsp;
                                <p className="item-calories">204 calories</p>
                            </div>
                        </div>
                        <IoIcons.IoMdClose style={{ fontSize: "1.5rem" }} />
                    </div>
                </div>
                <div className="items-section">
                    <p className="items-section-title">Lunch</p>
                    <p className="items-section-no-items">No food added</p>
                </div>
                <div className="items-section">
                    <p className="items-section-title">Dinner</p>
                    <p className="items-section-no-items">No food added</p>
                </div>
                <div className="items-section">
                    <p className="items-section-title">Snacks</p>
                    <p className="items-section-no-items">No food added</p>
                </div>
                <div className="add-button"><IoIcons.IoMdAdd onClick={() => { this.toggleShowSearchCalorieCounterItems(true) }} /></div>
            </div>
        )
    }
}

export default CalorieCounter
