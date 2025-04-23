// Import global styles and React hooks
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import "./App.css";
import { useState, useEffect } from "react";


// Main component
function App() {
  // State for toggling between "the cart" and the cart emoji
  const [showEmoji, setShowEmoji] = useState(false);

  // Interval-based animation logic to toggle every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowEmoji((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("User signed in:", user.displayName);
      })
      .catch((error) => {
        console.error("Error signing in:", error);
      });
  };
  

  return (
    <div className="login-container">
      <div className="text-block">
        {/* Heading with partial weight and animated swap */}
        <h2 className="heading">
          {/* "Welcome to" in lighter font */}
          <span className="intro-text">Welcome to </span>

          {/* Swappable text vs emoji */}
          <span className="cart-swapper">
            <span className={`cart-text ${showEmoji ? "hide" : "show"}`}>
              the cart
            </span>
            <span className={`cart-emoji ${showEmoji ? "show" : "hide"}`}>
              🛒
            </span>
          </span>
        </h2>

        {/* Subheading under the main title */}
        <p className="subtext">Log in to start shopping smart</p>
      </div>

      {/* Google sign-in button */}
      <button className="google-btn" onClick={handleLogin}>
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          className="icon"
        />
        Continue with Google
      </button>
    </div>
  );
}

export default App;
