import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './screens/Home/Home';
import Login from './screens/Login/Login';

class App extends React.Component {

    componentDidMount() {

    }

    checkToken = () => {

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