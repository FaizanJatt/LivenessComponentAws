import { useEffect, useState, useCallback } from "react";

import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import { Amplify } from "aws-amplify";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import awsexports from "./aws-exports";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

Amplify.configure(awsexports);

function App() {
  const [sessionID, setSessionID] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("id");
  console.log(token, "here");
  const authToken = token;

  const handleAnalysis = async () => {
    console.log("handle analysis");
    setVerifying(true);
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
      console.log(data);

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

  const getSessionID = useCallback(async () => {
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
      console.log(err);
    }
  }, [authToken]);

  const handleError = (error) => {
    console.log(error);
  };

  useEffect(() => {
    getSessionID();
  }, [authToken, getSessionID]);

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
            />

            {verifying && (
              <div className="verifying-text">
                <p>Successfully Redirecting to the next page</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
