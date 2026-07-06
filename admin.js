import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    orderBy,
    query,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
// ===============================
// Protect Admin Page
// ===============================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
    }

});

// ===============================
// Cloudinary
// ===============================

const CLOUD_NAME = "davgdulu";
const UPLOAD_PRESET = "sscollection";

// ===============================
// Upload Product
// ===============================

window.uploadProduct = async function () {

    const file = document.getElementById("image").files[0];
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;

    if (!file || !name || !price) {
        alert("Please fill all fields.");
        return;
    }

    try {

        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        await addDoc(collection(db, "products"), {

            name,
            price: Number(price),
            category,
            description,
            image: data.secure_url,
            createdAt: new Date()

        });

        alert("Product Added Successfully!");

        document.getElementById("image").value = "";
        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("description").value = "";
        document.getElementById("category").selectedIndex = 0;

        loadProducts();

    } catch (error) {

        console.error(error);
        alert("Something went wrong!");

    }

};

// ===============================
// Save Product (Add / Update)
// ===============================

window.saveProduct = async function () {

    const productId = document.getElementById("productId").value;

    if (productId) {

        await updateDoc(doc(db, "products", productId), {

            name: document.getElementById("name").value,
            price: Number(document.getElementById("price").value),
            category: document.getElementById("category").value,
            description: document.getElementById("description").value

        });

        alert("✅ Product Updated!");

        document.getElementById("productId").value = "";
        document.getElementById("image").value = "";
        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("description").value = "";
        document.getElementById("category").selectedIndex = 0;

        document.getElementById("saveBtn").innerHTML = "Add Product";

        loadProducts();

    } else {

        uploadProduct();

    }

};

// ===============================
// Load Products
// ===============================

async function loadProducts() {

    const productsDiv = document.getElementById("products");

    productsDiv.innerHTML = "<p>Loading...</p>";

    const snapshot = await getDocs(collection(db, "products"));

    productsDiv.innerHTML = "";

    snapshot.forEach((product) => {

        const data = product.data();

        productsDiv.innerHTML += `

        <div class="product-card">

            <img src="${data.image}" style="width:120px;border-radius:10px;">

            <h3>${data.name}</h3>

            <p>₹${data.price}</p>

            <small>${data.category}</small>

        <div style="display:flex;gap:10px;margin-top:10px;">

        <button
        onclick='editProduct(
        "${product.id}",
        "${data.name}",
        ${data.price},
        "${data.category}",
        "${(data.description || "").replace(/"/g, "&quot;")}"
        )'>
        ✏️ Edit
        </button>

        <button
        onclick="deleteProduct('${product.id}')"
        style="background:#ff3b30;">
        🗑 Delete
        </button>

        </div>

        </div>

        <hr>

        `;

    });

}

window.editProduct = function(id,name,price,category,description){

document.getElementById("productId").value=id;

document.getElementById("name").value=name;

document.getElementById("price").value=price;

document.getElementById("category").value=category;

document.getElementById("description").value=description;

document.getElementById("saveBtn").innerHTML="Update Product";

window.scrollTo({

top:0,

behavior:"smooth"

});

}

// ===============================
// Delete Product
// ===============================

window.deleteProduct = async function(id){

    if(!confirm("Delete this product?")) return;

    await deleteDoc(doc(db,"products",id));

    alert("Product Deleted!");

    loadProducts();

}

// ===============================
// Load Orders
// ===============================

async function loadOrders(){

    const ordersDiv = document.getElementById("orders");

    ordersDiv.innerHTML = "<p>Loading Orders...</p>";

    const q = query(
        collection(db,"orders"),
        orderBy("createdAt","desc")
    );

    const snapshot = await getDocs(q);

    if(snapshot.empty){

        ordersDiv.innerHTML = "<p>No Orders Yet</p>";
        return;

    }

    ordersDiv.innerHTML = "";

    snapshot.forEach(order=>{

        const data = order.data();

        let itemsHTML = "";

        data.items.forEach(item=>{

            itemsHTML += `

            <div style="margin-top:15px">

                <img src="${item.image}" style="width:80px;border-radius:8px;">

                <p><b>${item.name}</b></p>

                <p>Qty : ${item.quantity}</p>

                <p>₹${item.price}</p>

            </div>

            `;

        });

        ordersDiv.innerHTML += `

        <div class="product-card">

            <h3>👤 ${data.customerName}</h3>

            <p>📞 ${data.customerPhone}</p>

            <p>📍 ${data.customerAddress}</p>

            ${itemsHTML}

            <h3 style="color:gold">
                Total ₹${data.total}
            </h3>

            <button
                onclick="deleteOrder('${order.id}')"
                style="background:#ff3b30;margin-top:15px;">
                🗑 Delete Order
            </button>

        </div>

        <hr>

        `;

    });

}

// ===============================
// Delete Order
// ===============================

window.deleteOrder = async function(id){

    if(!confirm("Delete this order?")) return;

    await deleteDoc(doc(db,"orders",id));

    alert("Order Deleted!");

    loadOrders();

}

// ===============================
// Logout
// ===============================

window.logout = async function(){

    await signOut(auth);

    alert("Logged Out!");

    window.location.href = "login.html";

}

// ===============================
// Start
// ===============================

loadProducts();
loadOrders();
