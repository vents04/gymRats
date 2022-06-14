import React, { Component } from 'react'
import ApiRequests from '../../classes/ApiRequests';
import { ROOT_URL_ADMIN } from '../../global';
import "./Home.css"

export default class Home extends Component {

  componentDidMount() {
    this.checkToken();
  }

  checkToken = () => {
    ApiRequests.post("admin/validate-token", {}, {}, true).then((response) => {
      console.log(response.data);
    }).catch((error) => {
      window.location.href = ROOT_URL_ADMIN + "/login";
    })
  }

  render() {
    return (
      <div className="page-container">
        Home
      </div>
    )
  }
}
