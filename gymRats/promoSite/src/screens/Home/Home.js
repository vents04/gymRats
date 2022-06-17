import React, { Component } from 'react'
import "./Home.css"
import logo from "../../../assets/images/icon.png"
import google from "../../../assets/images/badges/google.png"
import apple from "../../../assets/images/badges/apple.svg"
import mockup from "../../../assets/images/mockup-2.png"

export default class Home extends Component {
  render() {
    return (
      <div className="page-container">
        <div className="logo-container">
          <img className="logo-container-logo" src={logo} alt="logo" />
          <p className="logo-container-text">GYM RATS</p>
        </div>
        <div className="home-container">
          <div className="incentive-container">
            <p className="incentive-container-text">The one and only <br /> app gym rats need</p>
            <div className="badges-container">
              <img className="google-badge" src={google} alt="google" />
              <img className="apple-badge" src={apple} alt="apple" />
            </div>
            <p className="text">Or download directly from <a href="https://resources.uploy.app/gym-rats.apk" target="_blank" className="action-text">here</a> for Android</p>
          </div>
          <div className="mockup-container">
            <img className="home-container-mockup" src={mockup} alt="mockup" />
          </div>
        </div>
      </div>
    )
  }
}
