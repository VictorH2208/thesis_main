import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Typography } from "@material-ui/core";
import UserInfo from "../components/UserInfo";

const Home = () => {
    const { user } = useContext(AuthContext);
    return (
        <div className="center">
            <Typography variant="h4" align="center">This is the home page</Typography>
        </div>
    );
};
  
export default Home;