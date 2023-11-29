/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import { Amplify } from "aws-amplify";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import { useRef } from "react";
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
  const [verifying, setVerifying] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("id");
  console.log(token, "here");
  const windowSize = useRef([window.innerWidth, window.innerHeight]);

  const [authToken, setAuthToken] = useState(token);

  // const API = "https://apostrfy.herokuapp.com/api/v1";
  // const login = `${API}/auth/login`;

  // async function getAuthId() {
  //   try {
  //     setIsLoading(true);
  //     const response = await axios.post(login, {
  //       userCode: "h01io",
  //       password: "Test1234!",
  //     });
  //     console.log(response.data.data.accessToken);
  //     setAuthToken(response.data.data.accessToken);
  //   } catch (err) {
  //     console.log(err);
  //     console.log("Something went wrong");
  //   }
  // }

  const handleAnalysis = async () => {
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
      } else {
        console.log(data);
      }

      if (data.confidence >= 75) {
        console.log("success", data.confidence);
        location.href = "apostrfy://success";
      } else {
        console.log("failure", data.confidence, "sending to error page");
        location.href = "apostrfy://error";
      }
    } catch (error) {
      console.log("failure", error);
    }
  };

  const getSessionID = async () => {
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
            <h2>Loading...</h2>
          </>
        ) : (
          <div>
            <FaceLivenessDetector
              sessionId={sessionID}
              region="ap-south-1"
              onAnalysisComplete={handleAnalysis}
              onError={handleError}
              disableInstructionScreen={true}
              components={{}}
            />
            {verifying && (
              <div className="w-full h-full absolute bg-[#161519] opacity-50 z-10" />
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
