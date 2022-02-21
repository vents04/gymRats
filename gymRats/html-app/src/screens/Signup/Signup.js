import React from 'react'

import './Signup.css';

import * as GiIcons from 'react-icons/gi';
import { Navigate } from 'react-router-dom';
import ApiRequests from '../../classes/ApiRequests';
import { AUTHENTICATION_TOKEN_KEY } from '../../global';

class Signup extends React.Component {

    state = {
        navigateToLogin: false,
        navigateToHome: false,
        firstName: null,
        lastName: null,
        email: null,
        password: null,
        showError: false,
        error: null,
        isLoading: false,
    }

    signup = () => {
        this.setState({ isLoading: true });
        ApiRequests.post("user/signup", {}, {
            firstName: this.state.firstName,
            lastName: this.state.lastName,
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
        if (this.state.navigateToLogin) {
            return (
                <Navigate to="/login" />
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
                    <p className="login-page-title">Signup</p>
                    <div className="login-page-inputs">
                        <input type="text" className="login-page-input" placeholder="First name:" value={this.state.firstName} onChange={(evt) => { this.setState({ firstName: evt.target.value }) }} />
                        <input type="text" className="login-page-input" placeholder="Last name:" value={this.state.lastName} onChange={(evt) => { this.setState({ lastName: evt.target.value }) }} />
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
                    <button className="login-page-action-button" onClick={() => { this.signup() }}>Create account</button>
                    <p className="login-page-text">Have an account?&nbsp;
                        <span className="login-page-highlight-text" onClick={() => { this.setState({ navigateToLogin: true }) }}>Go to Login</span> and access your account.</p>
                </div>
            </>
        )
    }
}

export default Signup
