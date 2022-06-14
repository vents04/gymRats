import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './screens/Home/Home';
import Login from './screens/Login/Login';

import ApiRequests from './classes/ApiRequests';
import { HTTP_STATUS_CODES, ROOT_URL_ADMIN } from './global';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            error: "",
            showError: false,
        }
    }
    render() {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </BrowserRouter>
        )
    }
}

export default App;