/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import "./App.css";
import { Amplify } from "aws-amplify";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import awsexports from "./aws-exports";
import axios from "axios";
import {
  BrowserRouter as Router,
  useSearchParams,
  useParams,
} from "react-router-dom";

Amplify.configure(awsexports);

function App() {
  const [sessionID, setSessionID] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("id");

  const [authToken, setAuthToken] = useState();

  const API = "https://apostrfy.herokuapp.com/api/v1";
  const login = `${API}/auth/login`;

  async function getAuthId() {
    try {
      setIsLoading(true);
      const response = await axios.post(login, {
        userCode: "h01io",
        password: "Test1234!",
      });
      console.log(response.data.data.accessToken);
      setAuthToken(response.data.data.accessToken);
    } catch (err) {
      console.log(err);
      console.log("Something went wrong");
    }
  }

  useEffect(() => {
    const result = searchParams.get("id");
    setAuthToken(result);
    console.log("authTokenStored:", result || null);
  }, []);

  // const injectedObject = window.ReactNativeWebView.injectedObjectJson();

  // const authToken = useMemo(() => {
  //   if (!window.accessToken) {
  //     return JSON.parse(injectedObject).token;
  //   }
  //   return window.accessToken;
  // }, [window.accessToken, injectedObject]);

  const handleAnalysis = async () => {
    // window.ReactNativeWebView.postMessage("verifying");
    console.log("handle analysis");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    try {
      const response = await axios.get(
        "https://apostrfy.herokuapp.com/api/v1/biometrics/get-result",
        config
      );
      const data = response.data;
      if (typeof data === "string") {
        console.log(data);
        // window.ReactNativeWebView.postMessage(`data: ${data}`);
      } else {
        console.log(data);
        // window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }

      if (data.confidence >= 75) {
        console.log("success", data.confidence);
        location.href = "apostrfy://success";
        // window.ReactNativeWebView.postMessage("Pass");
      } else {
        console.log("failure", data.confidence);
        // window.ReactNativeWebView.postMessage("Fail");
        // location.href = 'apostrfy://error';
      }
    } catch (error) {
      console.log("failure", error);

      // window.ReactNativeWebView.postMessage("Fail");
    }
  };

  const getSessionID = async () => {
    // console.log(authToken);
    // console.log(authToken.split(" ")[0]);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    try {
      const response = await axios.get(
        "https://apostrfy.herokuapp.com/api/v1/biometrics/get-session",
        config
      );

      setSessionID(response.data.sessionId);
      setIsLoading(false);
    } catch (err) {
      if (typeof err === "string") {
        console.log(err);
        // window.ReactNativeWebView.postMessage(`ERROR: ${err}`);
      } else {
        console.log(err);
        // window.ReactNativeWebView.postMessage(JSON.stringify(err));
      }
    }
  };

  const handleError = (error) => {
    if (typeof error === "string") {
      // window.ReactNativeWebView.postMessage(`ERROR: ${error}`);
    } else {
      // window.ReactNativeWebView.postMessage(JSON.stringify(error));
    }
  };

  useEffect(() => {
    getSessionID();
  }, [authToken]);

  useEffect(() => {});

  return (
    <>
      <div className="container">
        {isLoading ? (
          <>
            <h2 style={{ color: "red" }}>Loading...</h2>
          </>
        ) : (
          <div>
            <FaceLivenessDetector
              sessionId={sessionID}
              region="ap-south-1"
              onAnalysisComplete={handleAnalysis}
              onError={handleError}
              disableInstructionScreen={true}
            />
            <h2 style={{ color: "red", top: "100px", position: "absolute" }}>
              Showing...
            </h2>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
