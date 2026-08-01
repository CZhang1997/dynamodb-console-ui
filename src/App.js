import "./App.css";

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

import AppContext from "./context/app-context";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DBConsolePage from "./pages/dbConsolePage";
import Header from "./component/header";
import HomePage from "./pages/homePage";

export const APP_ROUTE_LIST = [
  {
    path: "/",
    element: <HomePage />, // <AuthenticateWrapper components={<TicTacToe />} />,
  },
  {
    path: "/consoles",
    element: <DBConsolePage />,
  },
];

function App() {
  const [awsCred, setAwsCred] = useState(null);
  const [loading, setLoading] = useState(false);

  const [awsCredList, setAwsCredList] = useState(
    [awsCred].filter((item) => item !== null)
  );
  const [region, setRegion] = useState(
    localStorage.getItem("defaultAWSRegion") || "us-west-2"
  );
  useEffect(() => {
    try {
      const ipcRenderer = window.require("electron").ipcRenderer;
      ipcRenderer.on("awsCredentials", (event, value) => {
        if (!awsCred || awsCred.accessKeyId !== value.accessKeyId) {
          setAwsCred(value);
        }
        if (
          !awsCredList.find((item) => item.accessKeyId === value.accessKeyId)
        ) {
          setAwsCredList((prev) => [...prev, value]);
        }
      });
      return () => {
        ipcRenderer.removeAllListeners("awsCredentials");
      };
    } catch (e) {
      // console.error("Unable to load local cred", e);
    }
  }, [awsCred]);

  useEffect(() => {
    if ((awsCred === null || !awsCred) && awsCredList.length > 0) {
      setAwsCred(awsCredList[0]);
    }
  }, [awsCred, awsCredList]);

  return (
    <div className="App">
      <BrowserRouter>
        <AppContext.Provider
          value={{
            loading,
            setLoading,
            setRegion: (region) => {
              setRegion(region);
              localStorage.setItem("defaultAWSRegion", region);
            },
            region,
            awsCred,
            awsCredList,
            setAwsCredList,
            setAwsCred,
          }}
        >
          {loading && (
            <div className="fadeMe loader-container">
              <span className="loader"></span>
            </div>
          )}
          <Header />
          <main className="app-content">
            <Routes>
              {APP_ROUTE_LIST.map((item) => {
                return (
                  <Route
                    key={item.path}
                    path={item.path}
                    element={item.element}
                  />
                );
              })}
            </Routes>
          </main>
        </AppContext.Provider>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
}

export default App;
