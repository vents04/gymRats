import React, { Component } from 'react'
import "./Home.css"
import logo from "../../../assets/images/icon.png"
import translations from '../../translations'

const badges = require.context("../../../assets/images/badges", true);
const mockups = require.context("../../../assets/images/mockups", true);

export default class Home extends Component {
  render() {
    return (
      <div className="page-container">
        <div className="logo-container">
          <img className="logo-container-logo" src={logo} alt="logo" />
          <p className="logo-container-text">{translations[this.props.language].home.logoText}</p>
        </div>
        <div className="home-container">
          <div className="incentive-container">
            <p className="incentive-container-text">{translations[this.props.language].home.incentive[0]}<br />{translations[this.props.language].home.incentive[1]}</p>
            <a href="https://5od524a3zf7.typeform.com/to/B0JDdCRZ" target="_blank" className="button-link">
              <button className="button">{translations[this.props.language].home.joinTheWaitlist}</button>
            </a>
            {
              /*
<div className="badges-container">
              <img className="google-badge" src={badges(`./google-${this.props.language.toLowerCase()}.png`).default} alt="google" />
              <img className="apple-badge" src={badges(`./apple-${this.props.language.toLowerCase()}.svg`).default} alt="apple" />
            </div>
                        <p className="text">{translations[this.props.language].home.downloadAndroidText[0]}&nbsp;<a href="https://resources.uploy.app/gym-rats.apk" target="_blank" className="action-text">{translations[this.props.language].home.downloadAndroidText[1]}</a>&nbsp;{translations[this.props.language].home.downloadAndroidText[2]}</p>
              */
            }
            <p className="text">{translations[this.props.language].home.blogText[0]}&nbsp;<a href="https://medium.com/@ventsislav_dimitrov/gym-rats-progress-made-easy-5412e2eb6958" target="_blank" className="action-text">{translations[this.props.language].home.blogText[1]}</a></p>
          </div>
          <div className="mockup-container">
            <img className="home-container-mockup" src={mockups(`./mockup-${this.props.language.toLowerCase()}.png`).default} alt="mockup" />
          </div>
        </div>
      </div>
    )
  }
}
