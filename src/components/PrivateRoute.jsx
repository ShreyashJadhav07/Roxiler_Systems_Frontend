import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children , role}) {
    const {user} = useAuth();
    if(!user) return <Navigate to="/" />
        if(role && user.role !== role) return <Navigate to="/" />;
        
        return children;
    

}

export default PrivateRoute;