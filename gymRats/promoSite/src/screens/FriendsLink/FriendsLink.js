import React from 'react'
import { useParams } from 'react-router';

import './FriendsLink.css';

import logo from '../../../assets/images/icon.png';

import ApiRequests from '../../classes/ApiRequests';
import translations from '../../translations';

const badges = require.context("../../../assets/images/badges", true);

export default function FriendsLink(props) {
    const { id } = useParams();
    const [user, setUser] = React.useState(null);
    const [showDownloadApp, setShowDownloadApp] = React.useState(false);

    React.useEffect(() => {
        ApiRequests.get("user/friends-link/" + id, {}).then((response) => {
            if (response.data.user) setUser(response.data.user);
        })
    }, []);

    const openFriendsLinkInApp = () => {
        var now = new Date().valueOf();
        setTimeout(function () {
            if (new Date().valueOf() - now > 100) return;
            setShowDownloadApp(true);
        }, 25);
        window.location = "gymrats://friends-link/" + id;
    }

    const redirectToStore = (store) => {
        switch(store) {
          case  'APPLE': 
            window.open('https://apps.apple.com/us/app/gym-rats-progress-made-easy/id1632827633', '_blank')
            break;
          case 'GOOGLE':
            window.open('https://play.google.com/store/apps/details?id=com.uploy.gymrats', '_blank');
            break;
          case 'HUAWEI':
            window.open('https://appgallery.huawei.com/app/C106584783', '_blank')
            break;
        }
    }

    return (
        <div className="coach-profile">
            <div className="coach-profile-logo-container">
                <img className="coach-profile-logo" src={logo} alt="logo" />
                <p className="coach-profile-logo-text">{translations[props.language].friendsLink.logoText}</p>
            </div>
            {
                user
                    ? <>
                        <div className="coach-profile-header">
                            {
                                user.profilePicture
                                    ? <div className="coach-profile-profile-picture" style={{
                                        backgroundImage: "url(" + user.profilePicture + ")"
                                    }}></div>
                                    : <div className="coach-profile-profile-picture">
                                        <p className="coach-profile-profile-picture-text">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</p>
                                    </div>
                            }
                            <p className="coach-profile-profile-names">{user.firstName}&nbsp;{user.lastName}</p>
                        </div>
                        {
                            !showDownloadApp
                                ? <button className='action-button' onClick={() => { openFriendsLinkInApp() }}>{translations[props.language].friendsLink.linkToAppButton}</button>
                                : <>
                                    <p className='notation'>{translations[props.language].friendsLink.noAppIncentive}</p>
                                    <div className="badges-container">
                                        <img className="google-badge" onClick={() => {redirectToStore('GOOGLE')}} src={badges(`./google-${props.language.toLowerCase()}.png`).default} alt="google" />
                                        <img className="apple-badge" onClick={() => {redirectToStore('APPLE')}} src={badges(`./apple-${props.language.toLowerCase()}.svg`).default} alt="apple" />
                                    </div>
                                    <div className="badges-container">
                                        <img className="huawei-badge" onClick={() => {redirectToStore('HUAWEI')}} src={badges(`./huawei-${props.language.toLowerCase()}.png`).default} alt="huawei" />
                                    </div>
                                </>
                        }
                    </>
                    : <p className="notation">{translations[props.language].friendsLink.userNotFound}</p>
            }
        </div>
    )
}
