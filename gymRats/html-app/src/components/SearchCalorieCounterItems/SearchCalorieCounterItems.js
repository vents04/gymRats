import React from 'react'

import * as IoIcons from 'react-icons/io';

import './SearchCalorieCounterItems.css';

class SearchCalorieCounterItems extends React.Component {
    render() {
        return (
            <div className="overlay">
                <div className="overlay-topbar">
                    <IoIcons.IoMdArrowBack style={{ fontSize: "2rem" }} onClick={() => { this.props.toggleOverlay(false) }} />
                    <p className="overlay-title">Search foods</p>
                </div>
                <div className="calories-search">
                    <input type="text" className="login-page-input" placeholder="Type here..." />
                    <div className="calories-search-section">
                        <p className="calories-search-section-title">Search results</p>
                        <div className="item">
                            <div className="item-left">
                                <p className="item-title">Kiselo mlqko 2%</p>
                            </div>
                        </div>
                    </div>
                    <div className="calories-search-section">
                        <p className="calories-search-section-title">Recent</p>
                        <div className="item">
                            <div className="item-left">
                                <p className="item-title">Kiselo mlqko 2%</p>
                                <div className="item-stats">
                                    <p className="item-amount">400 grams</p>&nbsp;&middot;&nbsp;
                                    <p className="item-calories">204 calories</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SearchCalorieCounterItems
