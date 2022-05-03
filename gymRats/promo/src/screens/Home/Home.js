import React, { Component } from 'react'

import './Home.scss';

export default class Home extends Component {
    render() {
        return (
            <div className="page-container">
                <nav className="navbar-container">
                    <div className="logo-container">
                        <img src="../../assets/img/icon.png" alt="logo" className="logo" />
                        <p className="logo-title">Gym Rats</p>
                    </div>
                    <div className="menu-container">
                        <a href="mailto:support@uploy.app" className="email">support@uploy.app</a>
                    </div>
                </nav>
                <div className="row">
                    <div className="col-1">
                        <h2>Achieve your dream physique with Gym Rats</h2>
                        <div className="badges-container">
                            <img src="../../assets/img/google-badge.png" alt="google_play_badge" className="badge google-badge" />
                            <img src="../../assets/img/apple-badge.svg" alt="app_store_badge" className="badge" />
                        </div>
                    </div>
                    <div className="col-2">
                        <img src="../../assets/img/Iphone 12 Pro.png" alt="iphone_mockup" className="iphone-mockup" />
                    </div>
                </div>
            </div>
        )
    }
}
