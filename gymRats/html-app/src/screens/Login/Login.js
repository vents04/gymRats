import React from 'react'

import './Login.css';

import * as GiIcons from 'react-icons/gi';
import { Navigate } from 'react-router-dom';
import ApiRequests from '../../classes/ApiRequests';
import { AUTHENTICATION_TOKEN_KEY } from '../../global';

class Login extends React.Component {

    state = {
        navigateToSignup: false,
        navigateToHome: false,
        email: null,
        password: null,
        showError: false,
        error: null,
        isLoading: false,
    }

    login = () => {
        this.setState({ isLoading: true });
        ApiRequests.post("user/login", {}, {
            email: this.state.email,
            password: this.state.password
        }, false).then((response) => {
            this.setState({ isLoading: false });
            localStorage.setItem(AUTHENTICATION_TOKEN_KEY, response.data.token);
            setTimeout(() => { }, 1000);
            this.setState({ navigateToHome: true });
        }).catch((error) => {
            this.setState({ isLoading: false });
            if (error.response) {
                this.setState({ error: error.response.data, showError: true });
            } else if (error.request) {
                this.setState({ showError: true, error: "Response not returned" });
            } else {
                this.setState({ showError: true, error: "Request setting error" });
            }
        })
    }

    render() {
        if (this.state.navigateToSignup) {
            return (
                <Navigate to="/signup" />
            )
        }
        if (this.state.navigateToHome) {
            return (
                <Navigate to="/home" />
            )
        }
        return (
            <>
                <div className="login-page-container">
                    <div className="login-page-logo">
                        <GiIcons.GiWeightLiftingUp style={{ color: "#4e4e6a" }} />
                        <p className="login-page-logo-text" style={{ color: "#1f6cb0" }}>Gym rats</p>
                    </div>
                    <p className="login-page-title">Login</p>
                    <div className="login-page-inputs">
                        <input type="text" className="login-page-input" placeholder="Email:" value={this.state.email} onChange={(evt) => { this.setState({ email: evt.target.value }) }} />
                        <input type="password" className="login-page-input" placeholder="Password:" value={this.state.password} onChange={(evt) => { this.setState({ password: evt.target.value }) }} />
                    </div>
                    {
                        this.state.showError
                            ? <p className="error">{this.state.error}</p>
                            : null
                    }
                    {
                        this.state.isLoading
                            ? <p className="notation">Loading...</p>
                            : null
                    }
                    <button className="login-page-action-button" onClick={() => { this.login() }}>Continue</button>
                    <p className="login-page-text">Don't have an account?&nbsp;
                        <span className="login-page-highlight-text" onClick={() => { this.setState({ navigateToSignup: true }) }}>Go to Signup</span> and create one.</p>
                </div>
            </>
        )
    }
}

export default Login
