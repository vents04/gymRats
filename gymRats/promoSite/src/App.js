import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import CoachProfileLink from './screens/CoachProfileLink/CoachProfileLink';
import Home from './screens/Home/Home';

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/coach-profile/:id" element={<CoachProfileLink />} />
                </Routes>
            </BrowserRouter>
        )
    }
}

export default App;