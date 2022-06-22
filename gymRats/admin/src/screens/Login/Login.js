import React, { Component } from 'react'

import ApiRequests from '../../classes/ApiRequests';

import JSONPretty from 'react-json-prettify';
import { AUTHENTICATION_TOKEN_KEY, ROOT_URL_ADMIN } from '../../global';

export default class Login extends Component {

    constructor(props) {
        super(props);

        this.emailRef = React.createRef();
        this.passwordRef = React.createRef();

        this.state = {
            showSubmitting: false
        }
    }

    login = () => {
        if (!this.state.showSubmitting) {
            this.setState({ showSubmitting: true }, () => {
                ApiRequests.post(`admin/login`, {}, {
                    email: this.emailRef.current?.value?.toLowerCase(),
                    password: this.passwordRef.current?.value
                }, false).then((response) => {
                    localStorage.setItem(AUTHENTICATION_TOKEN_KEY, response.data.token);
                    window.location.href = ROOT_URL_ADMIN + "/";
                }).catch((error) => {
                    alert(error.response.data);
                }).finally(() => {
                    this.setState({ showSubmitting: false });
                })
            });
        }
    }

    render() {
        return (
            <div className="centered-view">
                <p>Login</p>
                <input ref={this.emailRef} type="email" placeholder="email" />
                <br />
                <input ref={this.passwordRef} type="password" placeholder="password" />
                <br />
                <button type="button" onClick={this.login}>{
                    this.state.showSubmitting
                        ? "Submitting..."
                        : "Submit"
                }</button>
            </div>
        )
    }
}
