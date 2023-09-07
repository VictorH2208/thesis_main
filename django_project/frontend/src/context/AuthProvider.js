import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useHistory } from "react-router-dom";
import AuthContext from "./AuthContext";

const ethers = require("ethers");

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwt_decode(localStorage.getItem("authTokens"))
      : null
  );
  const [loading, setLoading] = useState(true);

  const history = useHistory();

  const loginUser = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const [address] = await window.ethereum.request({method:'eth_requestAccounts'});
    const signer = provider.getSigner(address);
    var data;
    const nonceResponse = await fetch(`http://127.0.0.1:8000/api/login/nonce/${await signer.getAddress()}`,{
      method:"GET",
      headers:{
        "Content-Type": "application/json"
      }
    });
    data = await nonceResponse.json();
    if (!(nonceResponse.status === 200)){
      data = await registerUser(); 
    }
    const nonce = data.nonce;
    if (nonce <=0){
      alert('something went wrong');
      return false
    }
    const message = "Login with Metamask by signing nonce: " + nonce.toString();
    const signature = await signer.signMessage(message);
    const response = await fetch("http://127.0.0.1:8000/api/login/JWT/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        'publicAddress':await signer.getAddress(),
        signature,
      })
    });
    data = await response.json();
    if (response.status === 200) {
      setAuthTokens(data);
      setUser(jwt_decode(data.access));
      localStorage.setItem("authTokens", JSON.stringify(data));
      history.push("/");
      return true
    } else {
      console.log(response);
      //alert("Something went wrong!");
      return false
    }
  };

  const registerUser = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const [address] = await window.ethereum.request({method:'eth_requestAccounts'});
    const signer = provider.getSigner(address);
    const response = await fetch("http://127.0.0.1:8000/api/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        'publicAddress':await signer.getAddress(),
      })
    });
    const data = await response.json();
    if (response.status === 201) {
      return data
    } else {
      alert("Something went wrong!");
      return -1
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    history.push("/");
  };

  const contextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    registerUser,
    loginUser,
    logoutUser
  };

  useEffect(() => {
    if (authTokens) {
      setUser(jwt_decode(authTokens.access));
    }
    setLoading(false);
  }, [authTokens, loading]);

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;