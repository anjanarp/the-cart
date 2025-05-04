import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./Home.jsx";
import "./App.css";
import loginLogo from "./assets/login_logo.png";

function App() {
  const navigate = useNavigate();

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("User signed in:", result.user.displayName);
        navigate("/home");
      })
      .catch((error) => {
        console.error("Error signing in:", error);
      });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="landing-page">
            <div className="left-block">
              <p className="tagline">
                DITCH THE TABS. DROP LINKS, BUILD OUTFITS, AND <br />COMPARE LOOKS VISUALLY — <br />
                ALL IN ONE PLACE.
              </p>
              <button className="google-btn" onClick={handleLogin}>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="icon"
                />
                Continue with Google
              </button>
            </div>
            <div className="right-block">
              <img src={loginLogo} alt="The Shopping Cart logo" className="login-logo" />
            </div>
          </div>
        }
      />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
