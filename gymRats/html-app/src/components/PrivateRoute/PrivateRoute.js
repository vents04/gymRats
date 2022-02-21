import { Navigate, Route } from "react-router-dom";

const PrivateRoute = ({ component: Component, isAuthenticated, isLoading, ...rest }) => {
    if (isLoading) {
        return <div>Loading...</div>
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" />
    }
    return <Component {...rest} />
}

export { PrivateRoute };