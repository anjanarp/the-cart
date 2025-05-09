// import core libraries and firebase dependencies
import React, { useEffect, useState } from "react";
import "./Home.css";
import logo from "./assets/login_logo.png";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// import firestore methods for cart operations
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";

import { useNavigate } from "react-router-dom";

function Home() {
  const [cartName, setCartName] = useState("");
  const [carts, setCarts] = useState([]);
  const navigate = useNavigate();

  // handles user input submission to create a new cart
  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && cartName.trim() !== "") {
      const newCart = { name: cartName.trim(), items: 0 };
      setCarts([...carts, newCart]); // optimistic UI update
      await addCartToFirestore(cartName);
      setCartName("");
    }
  };

  // adds a new cart document to the Firestore 'carts' collection
  const addCartToFirestore = async (cartName) => {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "carts"), {
        name: cartName,
        items: 0,
        createdAt: serverTimestamp(),
        createdBy: user?.uid || "anonymous",
      });
      console.log("Cart successfully added to Firestore!");
    } catch (error) {
      console.error("Error adding cart: ", error);
    }
  };

  // deletes a cart from Firestore and updates local state
  const handleDeleteCart = async (cartId) => {
    try {
      await deleteDoc(doc(db, "carts", cartId));
      setCarts(prev => prev.filter(cart => cart.id !== cartId));
    } catch (error) {
      console.error("Error deleting cart:", error);
    }
  };

  // fetches all carts created by the current user from Firestore on component mount
  /*
  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "carts"), where("createdBy", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const userCarts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCarts(userCarts);
      } catch (error) {
        console.error("Error fetching carts: ", error);
      }
    };

    fetchCarts();
  }, []);
  */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const q = query(collection(db, "carts"), where("createdBy", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const userCarts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCarts(userCarts);
      } catch (error) {
        console.error("Error fetching carts:", error);
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  return (
    <div className="home-container">
      <img src={logo} alt="the shopping cart" className="home-logo" />
      <h1 className="your-carts">YOUR CARTS</h1>

      {/* scrollable list of user carts */}
      <div className="cart-scroll-area">
        <div className="cart-list">
          {carts.map((cart, index) => {
            const maxLength = 45;
            const displayName =
              cart.name.length > maxLength
                ? cart.name.substring(0, maxLength - 3) + "..."
                : cart.name;

            return (
              <div key={index} className="cart-entry-wrapper">
                <div
                  className="cart-entry"
                  onClick={() => navigate(`/cart/${cart.id}`)}
                >
                  <span className="cart-name">{displayName}</span>
                  <span className="cart-count">{cart.items} ITEMS</span>
                </div>
                <button
                  className="cart-delete-button"
                  onClick={() => handleDeleteCart(cart.id)}
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* input for creating a new cart */}
      <input
        className="cart-input"
        type="text"
        placeholder="NAME YOUR CART. PRESS ENTER."
        value={cartName}
        onChange={(e) => setCartName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default Home;
