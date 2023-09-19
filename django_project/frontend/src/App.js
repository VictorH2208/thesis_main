import React from "react";
import "./index.css";
import ResponsiveAppBar from "./components/NavBar";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import AuthProvider from "./context/AuthProvider";
import Home from "./views/home";
import DashBoard from "./views/dashboard";
import IssueCredential from "./views/issueCredentials";
import VerifyCredential from "./views/verifyCredential";

function App() {
  return (
    <Router>
      <div className= "App">
        <div className="flex flex-col min-h-screen overflow-hidden">
            <AuthProvider>
                <ResponsiveAppBar />
                <Switch>
                    <Route exact component={Home} path="/" />
                    <PrivateRoute component={DashBoard} path="/dashboard" exact />
                    <PrivateRoute component={IssueCredential} path="/issue-credential" exact />
                    <Route component={VerifyCredential} path="/verify-credential" exact />
                </Switch>
            </AuthProvider>
        </div>
      </div>
    </Router>
  );
}

export default App;