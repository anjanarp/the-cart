// react router and firebase imports
import { useParams, useNavigate } from "react-router-dom";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    increment,
    serverTimestamp,
    deleteDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { useEffect, useState } from "react";

// styling and logo
import "./CartPage.css";
import logo from "./assets/login_logo.png";

function CartPage() {
    // get cart ID from the URL
    const { cartId } = useParams();
    // stores cart-level metadata (e.g. title, item count)
    const [cartData, setCartData] = useState(null);
    // input field for product URL
    const [link, setLink] = useState("");
    // list of products in the current cart
    const [products, setProducts] = useState([]);

    const navigate = useNavigate();

    // deletes a specific product widget from firestore
    const handleDelete = async (itemId) => {
        await deleteDoc(doc(db, "carts", cartId, "products", itemId));
        setProducts(products.filter(p => p.id !== itemId));
        setCartData(prev => ({
            ...prev,
            items: Math.max((prev.items || 1) - 1, 0)
        }));
    };

    // fetches all product widgets from the cart's subcollection
    const fetchProducts = async () => {
        const q = collection(db, "carts", cartId, "products");
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setProducts(items);
    };

    // fetches product widgets when cartId changes
    useEffect(() => {
        fetchProducts();
    }, [cartId]);

    // fetches cart metadata (name, item count) from firestore
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const ref = doc(db, "carts", cartId);
                console.group("Trying to fetch cart with ID:", cartId);
                const snapshot = await getDoc(ref);
                console.log("Snapshot returned:", snapshot);

                if (snapshot.exists()) {
                    console.log("Document data:", snapshot.data());
                    setCartData(snapshot.data());
                } else {
                    console.warn("Document not found in Firestore");
                    setCartData({ name: "Unknown", items: 0 });
                }
            } catch (err) {
                console.error("Error fetching doc:", err);
            }
        };

        fetchCart();
    }, [cartId]);

    // handles link submission; sends to backend, saves scraped product to firestore
    const handleLinkSubmit = async () => {
        console.log("handleLinkSubmit triggered");
        const user = auth.currentUser;
        if (!user) return;

        try {
            const response = await fetch("http://localhost:8000/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: link }),
            });

            const data = await response.json();

            await addDoc(collection(db, "carts", cartId, "products"), {
                url: link,
                title: data.title,
                price: data.price,
                currency: data.currency,
                imageUrl: data.image_url,
                owner: {
                    uid: user.uid,
                    name: user.displayName || "Anonymous",
                },
                createdAt: serverTimestamp(),
            });

            await updateDoc(doc(db, "carts", cartId), {
                items: increment(1),
            });

            // update local state for faster UI
            setCartData(prev => ({
                ...prev,
                items: (prev.items || 0) + 1
            }));

            setLink("");
            await fetchProducts(); // refresh the product list after adding
            console.log("Product saved to Firestore!");
        } catch (error) {
            console.error("Error handling link:", error);
        }
    };

    // show loading state until cart metadata is fetched
    if (!cartData) return <div>Loading...</div>;

    return (
        <>
            {/* top section with back arrow, link input, and cart title */}
            <div className="cartpage-title-row">
                <div className="cartpage-top-row">
                    <span className="back-arrow" onClick={() => navigate("/home")}>
                        ⭠
                    </span>
                    <input
                        className="cartpage-input"
                        type="text"
                        placeholder="ADD IT TO THE CART."
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        onKeyDown={(e) => {
                            console.log("Key pressed:", e.key);
                            if (e.key === "Enter" && link.trim() !== "") {
                                handleLinkSubmit();
                            }
                        }}
                    />
                </div>

                <div className="cartpage-title-block">
                    <h1 className="cart-title">{cartData.name}</h1>
                    <p className="cart-count-label">{cartData.items} ITEMS</p>
                </div>
            </div>

            {/* scrollable product widget area */}
            <div className="product-scroll-area">
                <div className="product-grid">
                    {products.map((item) => (
                        <div className="product-card" key={item.id}>
                            <img src={item.imageUrl} alt={item.title} className="product-image" />
                            <div className="product-info">
                                <div className="product-text">
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="product-title"
                                    >
                                        {item.title}
                                    </a>
                                    <div className="product-price">${item.price}</div>
                                </div>
                                <button className="delete-button" onClick={() => handleDelete(item.id)}>
                                    X
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* logo in bottom-right corner */}
            <img
                src={logo}
                alt="the shopping cart logo"
                className="cartpage-logo"
            />
        </>
    );
}

export default CartPage;
