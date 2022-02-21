import './App.css';
import React from 'react';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import ApiRequests from './classes/ApiRequests';

import Login from './screens/Login/Login';
import Signup from './screens/Signup/Signup';
import Calendar from './screens/Calendar/Calendar';

class App extends React.Component {
  state = {
    isAuthenticated: false,
    isLoading: true,
    defaultPath: null
  }

  componentDidMount() {
    this.setDefaultRedirectPath();
    ApiRequests.post('user/validate-token', {}, {}, true).then((response) => {
      const isTokenValid = response.data.valid;
      this.setState({ isAuthenticated: isTokenValid, isLoading: false }, () => {
        this.setDefaultRedirectPath();
      });
    }).catch((error) => {
      this.setState({ isAuthenticated: false, isLoading: false }, () => {
        this.setDefaultRedirectPath();
      });
    })
  }

  setDefaultRedirectPath() {
    if (!this.state.isAuthenticated) {
      this.setState({ defaultPath: "/login" });
      return;
    }
    this.setState({ defaultPath: "/home" });
  }


  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={
            !this.state.isLoading
              ? this.state.isAuthenticated
                ? < Navigate to="/home"></Navigate>
                : < Navigate to="/login"></Navigate>
              : null
          }></Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/calendar' element={<Calendar />}>
          </Route>
        </Routes>
      </BrowserRouter >
    )
  }
}

export default App;
