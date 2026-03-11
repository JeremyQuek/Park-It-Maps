import React, { useEffect, useRef, useCallback } from "react"; // 1. Added useCallback
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import { useCookies } from "react-cookie";
import Navigation from "./pages/NavigationUI.jsx";
import LandingPage from "./pages/LandingPageUI.jsx";
import Filter from "./pages/FilterUI.jsx";
import Bookmarks from "./pages/BookmarkUI.jsx";
import Settings from "./pages/SettingsMain.jsx";
import About from "./pages/About.jsx";
import Account from "./pages/Account.jsx";
import Test from "./pages/test.jsx";
import "./index.css";

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const backend_url = process.env.REACT_APP_BACKEND_URL;
  const fetchCalled = useRef(false);

  // 2. Wrap registerUID in useCallback
  const registerUID = useCallback(async () => {
    try {
      const res = await axios.get(`${backend_url}/user`);
      if (res.status === 200) {
        console.log("✅ New user created successfully:", res.data);
      }
      setCookie("user", res.data, {
        path: "/",
        maxAge: 3155760000,
        sameSite: "Lax",
        secure: false,
      });
    } catch (err) {
      console.error("❌ Error creating user:", err);
    }
  }, [backend_url, setCookie]);

  // 3. Wrap checkUID in useCallback
  const checkUID = useCallback(async (uid) => {
    try {
      const res = await axios.get(`${backend_url}/checkuser`, {
        params: { uid: uid },
      });
      if (res.status === 200) {
        console.log("✅ Existing user found successfully:", uid);
      }
    } catch (error) {
      console.error("❌ Error checking user:", error);
      removeCookie("user", { path: "/" });
      registerUID();
    }
  }, [backend_url, removeCookie, registerUID]);

  // 4. Added dependencies to the array
  useEffect(() => {
    if (fetchCalled.current) return;
    fetchCalled.current = true;

    const initialize = async () => {
      if (!cookies.user) {
        await registerUID();
      } else {
        await checkUID(cookies.user);
      }
    };

    initialize();
  }, [cookies.user, registerUID, checkUID]); // dependencies included
  return (
    <div className="ios">
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/navigation" element={<Navigation />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/filter" element={<Filter />} />
            <Route path="/about" element={<About />} />
            <Route path="/account" element={<Account />} />
            <Route path="/test" element={<Test />} />
            <Route
              path="/home"
              element={
                <header className="App-header">
                  <img src={logo} className="App-logo" alt="logo" />
                  <p>
                    Edit <code>src/App.js</code> and save to reload.
                  </p>
                  <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn React
                  </a>
                </header>
              }
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
