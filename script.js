import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
let cart = [];

// --------------------
// Add To Cart
// --------------------

function addToCart(name, price, image) {

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            name,
            price,
            image,
            quantity: 1
        });

    }

    showCart();

}

// --------------------
// Show Cart
// --------------------
function showCart() {

    let html = "";
    let total = 0;

    if (cart.length === 0) {

        html = `
        <div style="
            text-align:center;
            padding:40px;
            color:#999;
            font-size:22px;">
            🛒 Your cart is empty
        </div>
        `;

    } else {

        cart.forEach((item, index) => {

            total += item.price * item.quantity;

            html += `
            <div class="cart-item">

                <img src="${item.image}" alt="${item.name}">

                <div class="cart-info">

                    <h3>${item.name}</h3>

                    <p>₹${item.price}</p>

                    <div class="quantity-box">

                        <button onclick="decreaseQuantity(${index})">−</button>

                        <span>${item.quantity}</span>

                        <button onclick="increaseQuantity(${index})">+</button>

                    </div>

                </div>

                <button class="remove-btn"
                    onclick="removeItem(${index})">
                    ✖
                </button>

            </div>
            `;

        });

    }

    document.getElementById("cartItems").innerHTML = html;
    document.getElementById("total").innerHTML = `Total ₹${total}`;

}

// --------------------
// remove Cart
// --------------------

function removeItem(index){

    cart.splice(index,1);

    showCart();

}

function increaseQuantity(index){

    cart[index].quantity++;

    showCart();

}

function decreaseQuantity(index){

    if(cart[index].quantity > 1){

        cart[index].quantity--;

    }else{

        cart.splice(index,1);

    }

    showCart();

}

// --------------------
// Checkout
// --------------------

async function checkout() {

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();

    if (!name || !phone || !address) {
        alert("Please fill all customer details.");
        return;
    }

    let total = 0;

    let msg = "🛍️ *NEW ORDER*%0A%0A";

    msg += `👤 Name: ${name}%0A`;
    msg += `📞 Phone: ${phone}%0A`;
    msg += `📍 Address: ${address}%0A%0A`;

    msg += "📦 *Products:*%0A";

    cart.forEach(item => {

        msg += `• ${item.name}%0A`;
        msg += `Qty: ${item.quantity}%0A`;
        msg += `Price: ₹${item.price}%0A`;
        msg += `Image: ${item.image}%0A%0A`;

        total += item.price * item.quantity;

    });

    msg += `💰 Total: ₹${total}`;

    const order = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: cart,
        total: total,
        createdAt: serverTimestamp()
    };

    try {

        await addDoc(collection(db, "orders"), order);

        window.open(
            `https://wa.me/919662581023?text=${msg}`
        );

        alert("✅ Order Placed Successfully!");

        cart = [];
        showCart();

        document.getElementById("customerName").value = "";
        document.getElementById("customerPhone").value = "";
        document.getElementById("customerAddress").value = "";

    } catch (error) {

        console.error(error);
        alert("Failed to place order.");

    }

}
// --------------------
// Product Popup
// --------------------

function openPopup(product) {

    document.getElementById("popupImage").src = product.image;

    document.getElementById("popupName").innerText = product.name;

    document.getElementById("popupPrice").innerText =
        "₹" + product.price;

    document.getElementById("popupCategory").innerText =
        "Category : " + product.category;
    
        document.getElementById("popupDescription").innerText =
        product.description || "Premium quality product from SS COLLECTION.";

    document.getElementById("popupCartBtn").onclick = function () {

        addToCart(
            product.name,
            product.price,
            product.image
        );

        closePopup();

    };

    document.getElementById("productPopup").style.display = "flex";

}

function closePopup() {

    document.getElementById("productPopup").style.display = "none";

}
// Close popup when clicking outside
function outsideClose(event) {

    if (event.target.id === "productPopup") {
        closePopup();
    }

}

// Close popup with ESC key
document.addEventListener("keydown", function(event){

    if(event.key === "Escape"){

        closePopup();

    }

});
// --------------------
// Filter Products
// --------------------

function filterProducts(category, event) {

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        if (category === "all") {

            card.style.display = "block";

        } else {

            if (card.classList.contains(category)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }

        }

    });

    document
        .querySelectorAll(".category-buttons button")
        .forEach(btn => btn.classList.remove("active"));

    if (event) {
        event.target.classList.add("active");
    }

}

function searchProducts(){

    const value = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const cards = document.querySelectorAll(".card");

    cards.forEach(card=>{

        const name = card.querySelector("h3")
            .innerText
            .toLowerCase();

        if(name.includes(value)){

            card.style.display="block";

        }else{

            card.style.display="none";

        }

    });

}

function toggleWishlist(button){

    if(button.classList.contains("active")){

        button.classList.remove("active");
        button.innerHTML = "♡";

    }else{

        button.classList.add("active");
        button.innerHTML = "♥";

    }

}
function openQuickView(name, price, image){

    document.getElementById("quickImage").src = image;
    document.getElementById("quickName").innerHTML = name;
    document.getElementById("quickPrice").innerHTML = "₹" + price;

    document.getElementById("quickCart").onclick = function(){

        addToCart(name, price, image);

        closeQuickView();

    };

    document.getElementById("quickView").style.display = "flex";

}

function closeQuickView(){

    document.getElementById("quickView").style.display = "none";

}

// --------------------
// Load Products
// --------------------

async function loadProducts() {

    const productsContainer = document.getElementById("productsContainer");

    productsContainer.innerHTML = "<h2>Loading Products...</h2>";

    const querySnapshot = await getDocs(
        collection(db, "products")
    );

    productsContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {

        const product = doc.data();

 productsContainer.innerHTML += `

<div class="card ${product.category.trim().toLowerCase()}"

onclick='openPopup(${JSON.stringify(product)})'>

<div class="image-box">

    <span class="badge">NEW</span>

    <button class="wishlist-btn"
        onclick="toggleWishlist(this)">
        ♡
    </button>

    <img
        src="${product.image}"
        alt="${product.name}"
        loading="lazy"
        onclick="openQuickView('${product.name}',${product.price},'${product.image}')">

</div>

    <div class="card-content">

        <h3>${product.name}</h3>

        <p class="price">₹${product.price}</p>

        <button onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">
            🛒 Add To Cart
        </button>

    </div>

</div>

`;
    });

}
// Back To Top Button

window.onscroll = function () {

    const btn = document.getElementById("topBtn");

    if (document.documentElement.scrollTop > 300) {

        btn.style.display = "block";

    } else {

        btn.style.display = "none";

    }

};

function topFunction() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}
// --------------------
// Make Functions Global
// --------------------

window.addToCart = addToCart;
window.checkout = checkout;
window.filterProducts = filterProducts;
window.removeItem = removeItem;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.searchProducts = searchProducts;
window.toggleWishlist = toggleWishlist;
window.openPopup = openPopup;
window.closePopup = closePopup;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.outsideClose = outsideClose;
window.topFunction = topFunction;
// --------------------
// Start Website
// --------------------

loadProducts();
