import React, { useEffect, useState } from "react";
import "./Home.css";
import logo from "./assets/login_logo.png";
import { auth , db } from "./firebase";
import { collection, query , where , getDocs , addDoc, serverTimestamp } from "firebase/firestore";

function Home() {
    const [cartName, setCartName] = useState("");
    const [carts, setCarts] = useState([]);

    const handleKeyDown = async (e) => {
        if (e.key === "Enter" && cartName.trim() !== "") {
            const newCart = { name: cartName.trim(), items: 0 };
            setCarts([...carts, newCart]);
            await addCartToFirestore(cartName);
            setCartName("");
        }
    };

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



    return (
        <div className="home-container">
            <img src={logo} alt="the shopping cart" className="home-logo" />

            <h1 className="your-carts">YOUR CARTS</h1>

            <div className="cart-scroll-area">
                <div className="cart-list">
                    {carts.map((cart, index) => (
                        <div key={index} className="cart-entry">
                            {cart.name} <span className="cart-count">{cart.items} ITEMS</span>
                        </div>
                    ))}
                </div>
            </div>

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
