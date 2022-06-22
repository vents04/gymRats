import React, { Component } from 'react'
import { useParams } from 'react-router';

import './CoachProfileLink.css';

import logo from '../../../assets/images/icon.png';

import ApiRequests from '../../classes/ApiRequests';
import translations from '../../translations';

const badges = require.context("../../../assets/images/badges", true);

export default function CoachProfileLink(props) {
    const { id } = useParams();
    const [coach, setCoach] = React.useState(null);
    const [showDownloadApp, setShowDownloadApp] = React.useState(false);

    React.useEffect(() => {
        ApiRequests.get("coaching/coach/profile/" + id, {}).then((response) => {
            if (response.data.coach) setCoach(response.data.coach);
        })
    }, []);

    const openCoachProfileInApp = () => {
        var now = new Date().valueOf();
        setTimeout(function () {
            if (new Date().valueOf() - now > 100) return;
            setShowDownloadApp(true);
        }, 25);
        window.location = "gymrats://coach-profile/" + id;
    }


    return (
        <div className="coach-profile">
            <div className="coach-profile-logo-container">
                <img className="coach-profile-logo" src={logo} alt="logo" />
                <p className="coach-profile-logo-text">{translations[props.language].coachProfile.logoText}</p>
            </div>
            {
                coach
                    ? <>
                        <div className="coach-profile-header">
                            {
                                coach.userInstance.profilePicture
                                    ? <div className="coach-profile-profile-picture" style={{
                                        backgroundImage: "url(" + coach.userInstance.profilePicture + ")"
                                    }}></div>
                                    : <div className="coach-profile-profile-picture">
                                        <p className="coach-profile-profile-picture-text">{coach.userInstance.firstName.charAt(0)}{coach.userInstance.lastName.charAt(0)}</p>
                                    </div>
                            }
                            <p className="coach-profile-profile-names">{coach.userInstance.firstName}&nbsp;{coach.userInstance.lastName}</p>
                        </div>
                        {
                            !showDownloadApp
                                ? <button className='action-button' onClick={() => { openCoachProfileInApp() }}>{translations[props.language].coachProfile.linkToAppButton}</button>
                                : <>
                                    <p className='notation'>{translations[props.language].coachProfile.noAppIncentive}</p>
                                    <div className="badges-container">
                                        <img className="google-badge" src={badges(`./google-${props.language.toLowerCase()}.png`).default} alt="google" />
                                        <img className="apple-badge" src={badges(`./apple-${props.language.toLowerCase()}.svg`).default} alt="apple" />
                                    </div>
                                </>
                        }
                    </>
                    : <p className="notation">{translations[props.language].coachProfile.coachNotFound}</p>
            }
        </div>
    )
}
