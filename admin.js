import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

    }

});
import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const CLOUD_NAME = "davgdulu";
const UPLOAD_PRESET = "sscollection";

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

        if (!data.secure_url) {
            alert("Image upload failed.");
            console.log(data);
            return;
        }

    await addDoc(collection(db, "products"), {
        name: name,
        price: Number(price),
        category: category,
        description: description,
        image: data.secure_url,
        createdAt: new Date()
    });

        alert("Product Added Successfully!");

        document.getElementById("image").value = "";
        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("description").value = "";
        document.getElementById("category").selectedIndex = 0;

    } catch (error) {
        console.error(error);
        alert("Something went wrong!");
    }

};
// ===============================
// Load All Products
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

            <img src="${data.image}">

            <h3>${data.name}</h3>

            <p>₹${data.price}</p>

            <small>${data.category}</small>

            <button onclick="deleteProduct('${product.id}')">
                🗑 Delete
            </button>

        </div>

        `;

    });

}

// ===============================
// Delete Product
// ===============================

window.deleteProduct = async function(id){

    const confirmDelete = confirm(
        "Delete this product?"
    );

    if(!confirmDelete) return;

    await deleteDoc(doc(db,"products",id));

    alert("Product Deleted!");

    loadProducts();

}

// ===============================
// Start
// ===============================

loadProducts();
window.logout = async function () {

    await signOut(auth);

    alert("Logged Out!");

    window.location.href = "login.html";

};