require("dotenv").config();

const http = require("node:http");
const { MongoClient, ObjectId } = require("mongodb");

// ======================================================
// SERVER + MONGODB CONFIGURATION
// ======================================================

const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;

const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";

const DB_NAME = "smart_agri_food";

const mongoClient = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
});

let db;
let farmersCollection;
let marketCollection;

// ======================================================
// DEFAULT MARKET DATA
// This is inserted into MongoDB only if collection is empty
// ======================================================

const defaultMarketPrices = [
    {
        crop: "Rice",
        market: "Hyderabad",
        price: 2300,
        change: "+2.4%"
    },
    {
        crop: "Wheat",
        market: "Hyderabad",
        price: 2425,
        change: "+1.2%"
    },
    {
        crop: "Cotton",
        market: "Warangal",
        price: 7500,
        change: "+3.8%"
    },
    {
        crop: "Tomato",
        market: "Hyderabad",
        price: 2800,
        change: "-1.5%"
    },
    {
        crop: "Maize",
        market: "Nizamabad",
        price: 2100,
        change: "+2.1%"
    },
    {
        crop: "Groundnut",
        market: "Mahbubnagar",
        price: 6500,
        change: "+1.8%"
    }
];

// ======================================================
// WEBSITE HTML
// ======================================================

const html = `<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Smart Agri-Food Platform</title>

<style>

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: Arial, Helvetica, sans-serif;
    background: #f4f8f3;
    color: #1d2b20;
    line-height: 1.6;
}

/* ================= HEADER ================= */

header {
    background: #126b35;
    color: white;
    padding: 16px 6%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 3px 12px #0002;
}

.logo {
    font-size: 24px;
    font-weight: bold;
}

.logo span {
    color: #ffd447;
}

nav {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
}

nav a {
    color: white;
    text-decoration: none;
    font-size: 14px;
    font-weight: bold;
}

/* ================= HERO ================= */

.hero {
    min-height: 620px;

    background:
        linear-gradient(#07471ccc, #07471ccc),
        linear-gradient(135deg, #2e8b57, #8fbc5a);

    display: flex;
    align-items: center;

    padding: 80px 7%;

    color: white;
}

.hero-content {
    max-width: 800px;
}

.badge {
    display: inline-block;

    background: #ffffff26;

    border: 1px solid #ffffff4d;

    padding: 8px 15px;

    border-radius: 30px;

    margin-bottom: 20px;
}

.hero h1 {
    font-size: 58px;
    line-height: 1.1;
    margin-bottom: 22px;
}

.hero h1 span {
    color: #ffd447;
}

.hero p {
    font-size: 19px;
    max-width: 700px;
    margin-bottom: 30px;
    color: #edf8ed;
}

.hero-buttons {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

/* ================= BUTTONS ================= */

.btn {
    border: none;
    border-radius: 8px;

    padding: 13px 22px;

    font-size: 15px;
    font-weight: bold;

    cursor: pointer;

    transition: 0.2s;
}

.btn-primary {
    background: #ffd447;
    color: #193019;
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
}

.btn-green {
    background: #126b35;
    color: white;
}

.btn-danger {
    background: #b83232;
    color: white;
}

.btn:hover {
    transform: translateY(-2px);
    opacity: 0.92;
}

/* ================= SECTIONS ================= */

section {
    padding: 75px 7%;
}

.section-header {
    text-align: center;

    max-width: 750px;

    margin: 0 auto 45px;
}

.section-header h2 {
    color: #126b35;
    font-size: 36px;
    margin-bottom: 12px;
}

.section-header p {
    color: #647064;
}

/* ================= FEATURES ================= */

.features,
.stats,
.disease-cards,
.marketplace {
    display: grid;

    grid-template-columns:
        repeat(auto-fit, minmax(230px, 1fr));

    gap: 22px;
}

.feature-card,
.stat-card,
.disease-card,
.product-card,
.form-card,
.registration-box {
    background: white;

    padding: 28px;

    border-radius: 16px;

    box-shadow: 0 5px 20px #00000012;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-icon {
    width: 60px;
    height: 60px;

    border-radius: 15px;

    background: #e5f4e7;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 30px;

    margin-bottom: 18px;
}

.feature-card h3,
.disease-card h3,
.product-card h3 {
    color: #126b35;
    margin-bottom: 10px;
}

.feature-card p,
.disease-card p {
    color: #657065;
}

/* ================= DASHBOARD ================= */

.dashboard {
    background: #e9f5e8;
}

.stat-card {
    text-align: center;
}

.stat-icon {
    font-size: 30px;
}

.stat-number {
    font-size: 34px;

    font-weight: bold;

    color: #126b35;
}

.stat-label {
    color: #697369;
}

/* ================= FORMS ================= */

.crop-area {
    display: grid;

    grid-template-columns:
        repeat(auto-fit, minmax(300px, 1fr));

    gap: 35px;
}

.form-group {
    margin-bottom: 18px;
}

.form-group label {
    display: block;

    font-weight: bold;

    margin-bottom: 7px;
}

input,
select {
    width: 100%;

    padding: 13px;

    border: 1px solid #ccd7cc;

    border-radius: 7px;

    font-size: 15px;

    outline: none;
}

input:focus,
select:focus {
    border-color: #126b35;
}

.result-box {
    background: #eef8ee;

    border: 1px solid #cce4ce;

    padding: 22px;

    border-radius: 12px;

    margin-top: 20px;

    display: none;
}

.result-box.show {
    display: block;
}

.result-box h3 {
    color: #126b35;

    margin-bottom: 8px;
}

/* ================= WEATHER ================= */

.weather-section {
    background: #f0f7f1;
}

.weather-card {
    max-width: 900px;

    margin: auto;

    background:
        linear-gradient(135deg, #176d38, #4e9c63);

    color: white;

    border-radius: 20px;

    padding: 40px;

    box-shadow: 0 8px 30px #0002;
}

.weather-top {
    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 20px;
}

.weather-temperature {
    font-size: 64px;

    font-weight: bold;
}

.weather-icon {
    font-size: 70px;
}

.weather-details {
    display: grid;

    grid-template-columns:
        repeat(auto-fit, minmax(150px, 1fr));

    gap: 15px;

    margin-top: 30px;
}

.weather-detail {
    background: #ffffff22;

    padding: 18px;

    border-radius: 10px;
}

.weather-detail strong {
    display: block;

    font-size: 20px;
}

/* ================= TABLE ================= */

.table-wrapper {
    overflow-x: auto;

    background: white;

    border-radius: 15px;

    box-shadow: 0 5px 20px #00000012;
}

table {
    width: 100%;

    border-collapse: collapse;
}

th {
    background: #126b35;

    color: white;

    padding: 15px;

    text-align: left;
}

td {
    padding: 15px;

    border-bottom: 1px solid #e5e9e5;
}

.positive {
    color: #16803b;

    font-weight: bold;
}

.negative {
    color: #d33d3d;

    font-weight: bold;
}

/* ================= AI ================= */

.ai-container {
    max-width: 900px;

    margin: auto;

    background: white;

    border-radius: 18px;

    box-shadow: 0 5px 20px #00000014;

    overflow: hidden;
}

.ai-header {
    background: #126b35;

    color: white;

    padding: 20px;
}

.chat-box {
    height: 330px;

    overflow-y: auto;

    padding: 25px;

    background: #f5f9f5;
}

.message {
    max-width: 80%;

    padding: 12px 16px;

    border-radius: 12px;

    margin-bottom: 12px;
}

.message-bot {
    background: #dcefdc;
}

.message-user {
    background: #126b35;

    color: white;

    margin-left: auto;
}

.chat-input {
    display: flex;

    gap: 10px;

    padding: 18px;

    border-top: 1px solid #e1e7e1;
}

.chat-input input {
    flex: 1;
}

/* ================= MARKETPLACE ================= */

.product-image {
    font-size: 50px;

    background: #edf7ed;

    padding: 25px;

    border-radius: 12px;

    text-align: center;

    margin-bottom: 15px;
}

.product-price {
    color: #126b35;

    font-size: 20px;

    font-weight: bold;

    margin: 8px 0 15px;
}

/* ================= REGISTRATION ================= */

.registration {
    background: #e9f5e8;
}

.farmer-list {
    margin-top: 40px;
}

/* ================= FOOTER ================= */

footer {
    background: #0d3d20;

    color: white;

    text-align: center;

    padding: 45px 7%;
}

footer p {
    color: #c8d9ca;
}

/* ================= NOTIFICATION ================= */

.notification {
    position: fixed;

    right: 25px;

    bottom: 25px;

    background: #126b35;

    color: white;

    padding: 15px 22px;

    border-radius: 10px;

    box-shadow: 0 5px 20px #0003;

    display: none;

    z-index: 2000;
}

.notification.show {
    display: block;
}

/* ================= MOBILE ================= */

@media (max-width: 800px) {

    header {
        flex-direction: column;

        gap: 12px;
    }

    .hero h1 {
        font-size: 40px;
    }

    .hero {
        min-height: 540px;
    }

    .weather-top {
        flex-direction: column;

        text-align: center;
    }

}

</style>

</head>

<body>

<!-- ==================================================
     HEADER
================================================== -->

<header>

<div class="logo">
🌾 Smart <span>Agri-Food</span>
</div>

<nav>

<a href="#home">Home</a>
<a href="#features">Features</a>
<a href="#crops">Crops</a>
<a href="#weather">Weather</a>
<a href="#market">Market</a>
<a href="#assistant">AI</a>
<a href="#register">Register</a>

</nav>

</header>


<!-- ==================================================
     HERO
================================================== -->

<section class="hero" id="home">

<div class="hero-content">

<div class="badge">
🌱 Digital Agriculture Platform
</div>

<h1>
Smart Farming for a
<span>Better Future</span>
</h1>

<p>
Empowering farmers with crop recommendations,
weather information, market prices, agricultural
assistance and digital tools — all in one platform.
</p>

<div class="hero-buttons">

<button
    class="btn btn-primary"
    onclick="scrollToSection('register')"
>
👨‍🌾 Register as Farmer
</button>

<button
    class="btn btn-secondary"
    onclick="scrollToSection('features')"
>
Explore Features
</button>

</div>

</div>

</section>


<!-- ==================================================
     FEATURES
================================================== -->

<section id="features">

<div class="section-header">

<h2>
🌱 Smart Agriculture Features
</h2>

<p>
Everything a farmer needs to make better-informed
agricultural decisions.
</p>

</div>

<div class="features">

<div class="feature-card">

<div class="feature-icon">
🌱
</div>

<h3>
Crop Recommendation
</h3>

<p>
Get crop suggestions based on soil,
season and water availability.
</p>

</div>


<div class="feature-card">

<div class="feature-icon">
🌦️
</div>

<h3>
Weather Information
</h3>

<p>
View farm weather conditions and basic
farming recommendations.
</p>

</div>


<div class="feature-card">

<div class="feature-icon">
💰
</div>

<h3>
Market Prices
</h3>

<p>
Check example commodity prices across
selected markets.
</p>

</div>


<div class="feature-card">

<div class="feature-icon">
🤖
</div>

<h3>
AI Agriculture Assistant
</h3>

<p>
Ask questions about soil, crops,
irrigation and fertilizer.
</p>

</div>


<div class="feature-card">

<div class="feature-icon">
🦠
</div>

<h3>
Disease Guidance
</h3>

<p>
Learn about common crop symptoms
and preventive practices.
</p>

</div>


<div class="feature-card">

<div class="feature-icon">
🛒
</div>

<h3>
Agri Marketplace
</h3>

<p>
Explore agricultural products and
connect farming with food markets.
</p>

</div>

</div>

</section>


<!-- ==================================================
     DASHBOARD
================================================== -->

<section class="dashboard">

<div class="section-header">

<h2>
📊 Farmer Dashboard
</h2>

<p>
Quick overview of the platform.
</p>

</div>

<div class="stats">

<div class="stat-card">

<div class="stat-icon">
👨‍🌾
</div>

<div
    class="stat-number"
    id="farmerCount"
>
0
</div>

<div class="stat-label">
Registered Farmers
</div>

</div>


<div class="stat-card">

<div class="stat-icon">
🌾
</div>

<div class="stat-number">
6
</div>

<div class="stat-label">
Supported Crops
</div>

</div>


<div class="stat-card">

<div class="stat-icon">
💰
</div>

<div class="stat-number">
6
</div>

<div class="stat-label">
Market Listings
</div>

</div>


<div class="stat-card">

<div class="stat-icon">
🤖
</div>

<div class="stat-number">
24/7
</div>

<div class="stat-label">
Agriculture Assistance
</div>

</div>

</div>

</section>


<!-- ==================================================
     CROP RECOMMENDATION
================================================== -->

<section id="crops">

<div class="section-header">

<h2>
🌾 Smart Crop Recommendation
</h2>

<p>
Enter basic farm conditions to receive
a simple rule-based recommendation.
</p>

</div>


<div class="crop-area">


<div class="form-card">

<div class="form-group">

<label>
Soil Type
</label>

<select id="soil">

<option value="loamy">
Loamy Soil
</option>

<option value="clay">
Clay Soil
</option>

<option value="black">
Black Soil
</option>

<option value="sandy">
Sandy Soil
</option>

</select>

</div>


<div class="form-group">

<label>
Season
</label>

<select id="season">

<option value="kharif">
Kharif
</option>

<option value="rabi">
Rabi
</option>

</select>

</div>


<div class="form-group">

<label>
Water Availability
</label>

<select id="water">

<option value="high">
High
</option>

<option value="medium">
Medium
</option>

<option value="low">
Low
</option>

</select>

</div>


<button
    class="btn btn-green"
    onclick="recommendCrop()"
>
🌱 Recommend Crop
</button>


<div
    id="cropResult"
    class="result-box"
></div>

</div>


<div class="form-card">

<h3 style="color:#126b35">
How it works
</h3>

<p>
The prototype uses basic agricultural rules
to demonstrate a recommendation engine.
</p>

<br>

<p>
<strong>Soil:</strong>
Helps identify suitable crops.
</p>

<p>
<strong>Season:</strong>
Determines seasonal suitability.
</p>

<p>
<strong>Water:</strong>
Helps filter crops according
to water needs.
</p>

<br>

<p>
⚠️ Demonstration only.
Actual crop selection should use local
soil tests, weather data and expert advice.
</p>

</div>

</div>

</section>


<!-- ==================================================
     WEATHER
================================================== -->

<section
    class="weather-section"
    id="weather"
>

<div class="section-header">

<h2>
🌦️ Farm Weather
</h2>

<p>
Example farm-weather dashboard.
</p>

</div>


<div class="weather-card">

<div class="weather-top">

<div>

<h2>
Hyderabad Region
</h2>

<p>
Today's Farm Conditions
</p>

<div class="weather-temperature">
28°C
</div>

<p>
Partly Cloudy
</p>

</div>


<div class="weather-icon">
⛅
</div>

</div>


<div class="weather-details">


<div class="weather-detail">

Humidity

<strong>
68%
</strong>

</div>


<div class="weather-detail">

Wind

<strong>
12 km/h
</strong>

</div>


<div class="weather-detail">

Rain Chance

<strong>
25%
</strong>

</div>


<div class="weather-detail">

UV Index

<strong>
Moderate
</strong>

</div>


</div>


<br>

<p>

💡
<strong>
Farm Advice:
</strong>

Monitor soil moisture and rainfall
before irrigation.

</p>

</div>

</section>


<!-- ==================================================
     MARKET
================================================== -->

<section id="market">

<div class="section-header">

<h2>
💰 Agricultural Market Prices
</h2>

<p>
Demonstration market data stored in MongoDB.
</p>

</div>


<div class="table-wrapper">

<table>

<thead>

<tr>

<th>
Crop
</th>

<th>
Market
</th>

<th>
Price / Quintal
</th>

<th>
Change
</th>

</tr>

</thead>


<tbody id="marketTable">

</tbody>

</table>

</div>

</section>


<!-- ==================================================
     DISEASE
================================================== -->

<section>

<div class="section-header">

<h2>
🦠 Crop Disease Guidance
</h2>

<p>
Basic information for common crop symptoms.
</p>

</div>


<div class="disease-cards">


<div class="disease-card">

<h3>
🍅 Tomato Leaf Spots
</h3>

<p>
Look for dark or irregular spots.
Remove severely affected material
and maintain field sanitation.
</p>

</div>


<div class="disease-card">

<h3>
🌾 Rice Leaf Problems
</h3>

<p>
Monitor discoloration and lesions.
Use local agricultural recommendations
for diagnosis.
</p>

</div>


<div class="disease-card">

<h3>
🌱 Cotton Leaf Issues
</h3>

<p>
Check for curling, discoloration
and insect activity.
Scout regularly.
</p>

</div>


<div class="disease-card">

<h3>
🔬 Need Diagnosis?
</h3>

<p>
A future version can accept crop
photographs for AI-assisted disease
identification.
</p>

</div>


</div>

</section>


<!-- ==================================================
     MARKETPLACE
================================================== -->

<section>

<div class="section-header">

<h2>
🛒 Agri-Food Marketplace
</h2>

<p>
Example products that could be connected
to farmers and buyers.
</p>

</div>


<div class="marketplace">


<div class="product-card">

<div class="product-image">
🌱
</div>

<h3>
Organic Seeds
</h3>

<p>
Quality crop seeds for seasonal farming.
</p>

<div class="product-price">
₹499
</div>

<button
    class="btn btn-green"
    onclick="showNotification('Product feature coming soon')"
>
View Product
</button>

</div>


<div class="product-card">

<div class="product-image">
🧪
</div>

<h3>
Bio Fertilizer
</h3>

<p>
Agricultural input for nutrient management.
</p>

<div class="product-price">
₹699
</div>

<button
    class="btn btn-green"
    onclick="showNotification('Product feature coming soon')"
>
View Product
</button>

</div>


<div class="product-card">

<div class="product-image">
💧
</div>

<h3>
Drip Irrigation Kit
</h3>

<p>
Water-efficient irrigation equipment.
</p>

<div class="product-price">
₹2,499
</div>

<button
    class="btn btn-green"
    onclick="showNotification('Product feature coming soon')"
>
View Product
</button>

</div>


<div class="product-card">

<div class="product-image">
🚜
</div>

<h3>
Farm Equipment
</h3>

<p>
Agricultural tools and equipment for farmers.
</p>

<div class="product-price">
₹4,999
</div>

<button
    class="btn btn-green"
    onclick="showNotification('Product feature coming soon')"
>
View Product
</button>

</div>


</div>

</section>


<!-- ==================================================
     AI ASSISTANT
================================================== -->

<section id="assistant">

<div class="section-header">

<h2>
🤖 Smart Agriculture Assistant
</h2>

<p>
Ask questions about farming and receive
basic guidance.
</p>

</div>


<div class="ai-container">


<div class="ai-header">

<h3>
🌾 AgriBot
</h3>

<p>
Your Smart Farming Assistant
</p>

</div>


<div
    class="chat-box"
    id="chatBox"
>

<div class="message message-bot">

Hello! 👋
I am AgriBot.

<br>

Ask me about crops, soil,
irrigation, fertilizer,
diseases or market prices.

</div>

</div>


<div class="chat-input">

<input
    id="question"
    type="text"
    placeholder="Ask your farming question..."
    onkeydown="handleEnter(event)"
>

<button
    class="btn btn-green"
    onclick="askAssistant()"
>
Ask
</button>

</div>

</div>

</section>


<!-- ==================================================
     FARMER REGISTRATION
================================================== -->

<section
    class="registration"
    id="register"
>

<div class="section-header">

<h2>
👨‍🌾 Farmer Registration
</h2>

<p>
Create your farmer profile.
Data is stored permanently in MongoDB.
</p>

</div>


<div class="registration-box">


<div class="form-group">

<label>
Farmer Name
</label>

<input
    id="farmerName"
    placeholder="Enter your full name"
>

</div>


<div class="form-group">

<label>
Mobile Number
</label>

<input
    id="mobile"
    type="tel"
    placeholder="Enter mobile number"
>

</div>


<div class="form-group">

<label>
Village / Location
</label>

<input
    id="location"
    placeholder="Enter village or location"
>

</div>


<div class="form-group">

<label>
Main Crop
</label>

<select id="mainCrop">

<option>
Rice
</option>

<option>
Wheat
</option>

<option>
Cotton
</option>

<option>
Tomato
</option>

<option>
Maize
</option>

<option>
Groundnut
</option>

</select>

</div>


<button
    class="btn btn-green"
    onclick="registerFarmer()"
>
👨‍🌾 Register Farmer
</button>


<div
    id="registrationResult"
    class="result-box"
></div>


</div>


<!-- REGISTERED FARMERS -->

<div class="farmer-list">

<div class="section-header">

<h2>
Registered Farmers
</h2>

<p>
Saved records from MongoDB Atlas.
</p>

</div>


<div class="table-wrapper">

<table>

<thead>

<tr>

<th>
Name
</th>

<th>
Mobile
</th>

<th>
Location
</th>

<th>
Crop
</th>

<th>
Action
</th>

</tr>

</thead>


<tbody id="farmerTable">

</tbody>

</table>

</div>

</div>

</section>


<!-- ==================================================
     FOOTER
================================================== -->

<footer>

<h2>
🌾 Smart Agri-Food Platform
</h2>

<p>
Technology • Agriculture • Sustainability
</p>

<br>

<p>
Version 2 — MongoDB Atlas + Render Ready
</p>

</footer>


<div
    id="notification"
    class="notification"
></div>


<!-- ==================================================
     FRONTEND JAVASCRIPT
================================================== -->

<script>

/* ============================
   GENERAL FUNCTIONS
============================ */

function scrollToSection(id) {

    const element = document.getElementById(id);

    if (element) {

        element.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* ============================
   HTML ESCAPE
============================ */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ============================
   NOTIFICATION
============================ */

function showNotification(message) {

    const notification =
        document.getElementById("notification");

    notification.innerText = message;

    notification.classList.add("show");

    setTimeout(() => {

        notification.classList.remove("show");

    }, 3000);

}


/* ============================
   LOAD MARKET PRICES
============================ */

async function loadMarketPrices() {

    try {

        const response =
            await fetch("/api/market");

        const data =
            await response.json();

        const table =
            document.getElementById("marketTable");

        table.innerHTML = "";

        data.forEach(item => {

            const row =
                document.createElement("tr");

            const changeClass =
                String(item.change || "")
                    .startsWith("+")
                    ? "positive"
                    : "negative";

            row.innerHTML =

                "<td>🌾 " +
                escapeHTML(item.crop) +
                "</td>" +

                "<td>" +
                escapeHTML(item.market) +
                "</td>" +

                "<td><strong>₹" +
                Number(item.price)
                    .toLocaleString("en-IN") +
                "</strong></td>" +

                "<td class='" +
                changeClass +
                "'>" +
                escapeHTML(item.change) +
                "</td>";

            table.appendChild(row);

        });

    }

    catch (error) {

        console.log(
            "Market loading error:",
            error
        );

    }

}


/* ============================
   LOAD FARMERS
============================ */

async function loadFarmers() {

    try {

        const response =
            await fetch("/api/farmers");

        const data =
            await response.json();

        document.getElementById(
            "farmerCount"
        ).innerText = data.length;

        const table =
            document.getElementById("farmerTable");

        table.innerHTML = "";

        data.forEach(farmer => {

            const row =
                document.createElement("tr");

            row.innerHTML =

                "<td>" +
                escapeHTML(farmer.name) +
                "</td>" +

                "<td>" +
                escapeHTML(farmer.mobile) +
                "</td>" +

                "<td>" +
                escapeHTML(farmer.location) +
                "</td>" +

                "<td>" +
                escapeHTML(farmer.crop) +
                "</td>" +

                "<td>" +

                "<button " +
                "class='btn btn-danger' " +
                "onclick=\"deleteFarmer('" +
                farmer._id +
                "')\">" +

                "Delete" +

                "</button>" +

                "</td>";

            table.appendChild(row);

        });

    }

    catch (error) {

        console.log(
            "Farmer loading error:",
            error
        );

    }

}


/* ============================
   DELETE FARMER
============================ */

async function deleteFarmer(id) {

    if (!confirm(
        "Delete this farmer record?"
    )) {

        return;

    }

    try {

        const response =
            await fetch(
                "/api/farmers/" + id,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (data.success) {

            showNotification(
                "Farmer deleted."
            );

            loadFarmers();

        }

        else {

            showNotification(
                data.message ||
                "Delete failed."
            );

        }

    }

    catch (error) {

        showNotification(
            "Delete failed."
        );

    }

}


/* ============================
   CROP RECOMMENDATION
============================ */

function recommendCrop() {

    const soil =
        document.getElementById(
            "soil"
        ).value;

    const season =
        document.getElementById(
            "season"
        ).value;

    const water =
        document.getElementById(
            "water"
        ).value;


    let crop;

    let reason;


    if (
        soil === "clay" &&
        season === "kharif" &&
        water === "high"
    ) {

        crop = "🌾 Rice";

        reason =
            "Clay soil, Kharif season and high water availability can suit rice in appropriate local environments.";

    }

    else if (
        soil === "loamy" &&
        season === "rabi"
    ) {

        crop = "🌾 Wheat";

        reason =
            "Loamy soil and Rabi season are commonly associated with wheat where local conditions are suitable.";

    }

    else if (
        soil === "black"
    ) {

        crop = "🌿 Cotton";

        reason =
            "Black soils can be suitable for cotton in appropriate regions and seasons.";

    }

    else if (
        soil === "sandy"
    ) {

        crop = "🥜 Groundnut";

        reason =
            "Well-drained sandy or sandy-loam soils can suit groundnut under suitable conditions.";

    }

    else if (
        season === "kharif" &&
        water === "medium"
    ) {

        crop = "🌽 Maize";

        reason =
            "Maize can be considered for suitable Kharif conditions with moderate water availability.";

    }

    else {

        crop = "🍅 Tomato";

        reason =
            "Tomato may be considered, but final selection should use local soil, climate and market information.";

    }


    const result =
        document.getElementById(
            "cropResult"
        );


    result.innerHTML =

        "<h3>" +
        "Recommended Crop: " +
        crop +
        "</h3>" +

        "<p>" +
        reason +
        "</p>" +

        "<br>" +

        "<small>" +
        "This is a demonstration recommendation engine." +
        "</small>";


    result.classList.add("show");

}


/* ============================
   FARMER REGISTRATION
============================ */

async function registerFarmer() {

    const name =
        document.getElementById(
            "farmerName"
        ).value.trim();

    const mobile =
        document.getElementById(
            "mobile"
        ).value.trim();

    const location =
        document.getElementById(
            "location"
        ).value.trim();

    const crop =
        document.getElementById(
            "mainCrop"
        ).value;


    if (
        !name ||
        !mobile ||
        !location
    ) {

        showNotification(
            "Please fill all required fields."
        );

        return;

    }


    if (
        !/^[0-9+() -]{7,20}$/.test(
            mobile
        )
    ) {

        showNotification(
            "Please enter a valid mobile number."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/farmers",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        mobile,
                        location,
                        crop
                    })

                }
            );


        const data =
            await response.json();


        if (data.success) {

            document.getElementById(
                "registrationResult"
            ).innerHTML =

                "<h3>" +
                "✅ Registration Successful" +
                "</h3>" +

                "<p>" +
                "Welcome, <strong>" +
                escapeHTML(name) +
                "</strong>!" +
                "</p>" +

                "<p>" +
                "Your farmer profile has been saved to MongoDB." +
                "</p>";


            document.getElementById(
                "registrationResult"
            ).classList.add("show");


            document.getElementById(
                "farmerName"
            ).value = "";


            document.getElementById(
                "mobile"
            ).value = "";


            document.getElementById(
                "location"
            ).value = "";


            showNotification(
                "Farmer registered successfully!"
            );


            loadFarmers();

        }

        else {

            showNotification(
                data.message ||
                "Registration failed."
            );

        }

    }

    catch (error) {

        console.log(error);

        showNotification(
            "Registration failed. Please try again."
        );

    }

}


/* ============================
   AI ASSISTANT
============================ */

async function askAssistant() {

    const input =
        document.getElementById(
            "question"
        );

    const question =
        input.value.trim();


    if (!question) {

        return;

    }


    const chat =
        document.getElementById(
            "chatBox"
        );


    const userMessage =
        document.createElement(
            "div"
        );

    userMessage.className =
        "message message-user";

    userMessage.innerText =
        question;

    chat.appendChild(
        userMessage
    );


    input.value = "";


    try {

        const response =
            await fetch(
                "/api/assistant",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question
                    })

                }
            );


        const data =
            await response.json();


        const botMessage =
            document.createElement(
                "div"
            );

        botMessage.className =
            "message message-bot";

        botMessage.innerText =
            "🤖 " + data.answer;


        chat.appendChild(
            botMessage
        );


        chat.scrollTop =
            chat.scrollHeight;

    }

    catch (error) {

        const botMessage =
            document.createElement(
                "div"
            );

        botMessage.className =
            "message message-bot";

        botMessage.innerText =
            "Sorry, the agriculture assistant is temporarily unavailable.";


        chat.appendChild(
            botMessage
        );

    }

}


/* ============================
   ENTER KEY FOR AI
============================ */

function handleEnter(event) {

    if (event.key === "Enter") {

        askAssistant();

    }

}


/* ============================
   INITIAL LOAD
============================ */

loadMarketPrices();

loadFarmers();

</script>

</body>

</html>`;


/* ======================================================
   JSON RESPONSE FUNCTION
====================================================== */

function sendJSON(
    response,
    statusCode,
    data
) {

    response.statusCode =
        statusCode;

    response.setHeader(
        "Content-Type",
        "application/json; charset=utf-8"
    );

    response.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    response.end(
        JSON.stringify(data)
    );

}


/* ======================================================
   READ JSON REQUEST BODY
====================================================== */

function getRequestBody(req) {

    return new Promise(
        (resolve, reject) => {

            let body = "";

            req.on(
                "data",
                chunk => {

                    body +=
                        chunk.toString();

                    if (
                        body.length >
                        1e6
                    ) {

                        req.destroy();

                    }

                }
            );


            req.on(
                "end",
                () => {

                    try {

                        resolve(
                            body
                                ? JSON.parse(body)
                                : {}
                        );

                    }

                    catch (error) {

                        reject(error);

                    }

                }
            );


            req.on(
                "error",
                reject
            );

        }
    );

}


/* ======================================================
   FARMER VALIDATION
====================================================== */

function validFarmer(body) {

    return (
        body &&
        String(body.name || "").trim() &&
        String(body.mobile || "").trim() &&
        String(body.location || "").trim()
    );

}


/* ======================================================
   AI ASSISTANT LOGIC
====================================================== */

function assistantAnswer(question) {

    const q =
        String(question || "")
            .toLowerCase();


    if (q.includes("rice")) {

        return (
            "Rice generally requires suitable soil, " +
            "adequate water and appropriate temperature. " +
            "Irrigation and nutrient management should " +
            "follow local recommendations."
        );

    }


    if (q.includes("wheat")) {

        return (
            "Wheat is generally grown during the Rabi " +
            "season. Proper irrigation, weed management " +
            "and balanced nutrients are important."
        );

    }


    if (q.includes("cotton")) {

        return (
            "Cotton performs well in suitable warm " +
            "conditions and is commonly associated " +
            "with black soils in several regions. " +
            "Monitor pests and disease symptoms."
        );

    }


    if (q.includes("tomato")) {

        return (
            "Tomato requires suitable drainage, nutrients " +
            "and careful irrigation. Regular monitoring " +
            "helps detect disease and pest problems early."
        );

    }


    if (q.includes("soil")) {

        return (
            "A soil test is the best way to understand " +
            "pH and nutrient availability. Crop and " +
            "fertilizer decisions should use test results " +
            "and local recommendations."
        );

    }


    if (
        q.includes("water") ||
        q.includes("irrigation")
    ) {

        return (
            "Irrigation should depend on crop stage, " +
            "soil moisture, weather and local water " +
            "availability. Avoid unnecessary irrigation."
        );

    }


    if (
        q.includes("fertilizer") ||
        q.includes("fertiliser")
    ) {

        return (
            "Use fertilizer according to soil-test results " +
            "and crop requirements. More fertilizer does " +
            "not necessarily mean more yield."
        );

    }


    if (
        q.includes("disease") ||
        q.includes("leaf") ||
        q.includes("spots")
    ) {

        return (
            "For suspected disease, check spots, " +
            "discoloration, wilting, insects and affected " +
            "plant parts. Local expert diagnosis is " +
            "recommended before treatment."
        );

    }


    if (
        q.includes("market") ||
        q.includes("price") ||
        q.includes("mandi")
    ) {

        return (
            "Agricultural prices change by market, date, " +
            "crop quality and quantity. Check the latest " +
            "local mandi information before selling."
        );

    }


    if (
        q.includes("maize") ||
        q.includes("corn")
    ) {

        return (
            "Maize can be grown in suitable Kharif or " +
            "Rabi conditions depending on the region. " +
            "Good drainage, nutrients and timely irrigation " +
            "are important."
        );

    }


    return (
        "I can help with crop selection, soil, irrigation, " +
        "fertilizer, crop diseases and market information. " +
        "Try asking: Which crop is suitable for black soil?"
    );

}


/* ======================================================
   HTTP SERVER
====================================================== */

const server =
    http.createServer(
        async (req, res) => {

            const url =
                new URL(
                    req.url,
                    `http://${req.headers.host || "localhost"}`
                );


            /* ==========================================
               OPTIONS / CORS
            ========================================== */

            if (
                req.method === "OPTIONS"
            ) {

                res.statusCode = 204;

                res.setHeader(
                    "Access-Control-Allow-Origin",
                    "*"
                );

                res.setHeader(
                    "Access-Control-Allow-Methods",
                    "GET,POST,DELETE,OPTIONS"
                );

                res.setHeader(
                    "Access-Control-Allow-Headers",
                    "Content-Type"
                );

                res.end();

                return;

            }


            /* ==========================================
               HOME PAGE
            ========================================== */

            if (
                req.method === "GET" &&
                url.pathname === "/"
            ) {

                res.statusCode = 200;

                res.setHeader(
                    "Content-Type",
                    "text/html; charset=utf-8"
                );

                res.end(html);

                return;

            }


            /* ==========================================
               SERVER STATUS
            ========================================== */

            if (
                req.method === "GET" &&
                url.pathname === "/api/status"
            ) {

                try {

                    const farmerCount =
                        await farmersCollection.countDocuments();

                    const marketCount =
                        await marketCollection.countDocuments();


                    sendJSON(
                        res,
                        200,
                        {
                            success: true,

                            status: "online",

                            database:
                                db
                                    ? "connected"
                                    : "not connected",

                            databaseName:
                                DB_NAME,

                            farmers:
                                farmerCount,

                            marketPrices:
                                marketCount
                        }
                    );

                }

                catch (error) {

                    sendJSON(
                        res,
                        500,
                        {
                            success: false,

                            status: "database error",

                            message:
                                error.message
                        }
                    );

                }

                return;

            }


            /* ==========================================
               MARKET API
            ========================================== */

            if (
                req.method === "GET" &&
                url.pathname === "/api/market"
            ) {

                try {

                    const marketData =
                        await marketCollection
                            .find(
                                {},
                                {
                                    projection: {
                                        _id: 0
                                    }
                                }
                            )
                            .toArray();


                    sendJSON(
                        res,
                        200,
                        marketData
                    );

                }

                catch (error) {

                    console.error(error);

                    sendJSON(
                        res,
                        500,
                        {
                            success: false,

                            message:
                                "Unable to load market data."
                        }
                    );

                }

                return;

            }


            /* ==========================================
               GET FARMERS
            ========================================== */

            if (
                req.method === "GET" &&
                url.pathname === "/api/farmers"
            ) {

                try {

                    const farmers =
                        await farmersCollection
                            .find({})
                            .sort({
                                registeredAt: -1
                            })
                            .toArray();


                    sendJSON(
                        res,
                        200,
                        farmers
                    );

                }

                catch (error) {

                    console.error(error);

                    sendJSON(
                        res,
                        500,
                        {
                            success: false,

                            message:
                                "Unable to load farmers."
                        }
                    );

                }

                return;

            }


            /* ==========================================
               REGISTER FARMER
            ========================================== */

            if (
                req.method === "POST" &&
                url.pathname === "/api/farmers"
            ) {

                try {

                    const body =
                        await getRequestBody(req);


                    if (
                        !validFarmer(body)
                    ) {

                        sendJSON(
                            res,
                            400,
                            {
                                success: false,

                                message:
                                    "Please provide all required fields."
                            }
                        );

                        return;

                    }


                    const mobile =
                        String(
                            body.mobile
                        ).trim();


                    if (
                        !/^[0-9+() -]{7,20}$/
                            .test(mobile)
                    ) {

                        sendJSON(
                            res,
                            400,
                            {
                                success: false,

                                message:
                                    "Please provide a valid mobile number."
                            }
                        );

                        return;

                    }


                    const farmer = {

                        name:
                            String(
                                body.name
                            ).trim(),

                        mobile:
                            mobile,

                        location:
                            String(
                                body.location
                            ).trim(),

                        crop:
                            String(
                                body.crop ||
                                "Not specified"
                            ).trim(),

                        registeredAt:
                            new Date().toISOString()

                    };


                    const result =
                        await farmersCollection
                            .insertOne(
                                farmer
                            );


                    farmer._id =
                        result.insertedId;


                    const totalFarmers =
                        await farmersCollection
                            .countDocuments();


                    sendJSON(
                        res,
                        201,
                        {
                            success: true,

                            farmer: farmer,

                            totalFarmers:
                                totalFarmers
                        }
                    );

                }

                catch (error) {

                    console.error(error);

                    sendJSON(
                        res,
                        500,
                        {
                            success: false,

                            message:
                                "Unable to register farmer."
                        }
                    );

                }

                return;

            }


            /* ==========================================
               DELETE FARMER
            ========================================== */

            if (
                req.method === "DELETE" &&
                url.pathname.startsWith(
                    "/api/farmers/"
                )
            ) {

                try {

                    const id =
                        url.pathname
                            .split("/")
                            .pop();


                    if (
                        !ObjectId.isValid(id)
                    ) {

                        sendJSON(
                            res,
                            400,
                            {
                                success: false,

                                message:
                                    "Invalid farmer ID."
                            }
                        );

                        return;

                    }


                    const result =
                        await farmersCollection
                            .deleteOne({
                                _id:
                                    new ObjectId(id)
                            });


                    sendJSON(
                        res,
                        200,
                        {
                            success:
                                result.deletedCount === 1,

                            message:
                                result.deletedCount === 1
                                    ? "Farmer deleted."
                                    : "Farmer not found."
                        }
                    );

                }

                catch (error) {

                    console.error(error);

                    sendJSON(
                        res,
                        500,
                        {
                            success: false,

                            message:
                                "Unable to delete farmer."
                        }
                    );

                }

                return;

            }


            /* ==========================================
               AGRICULTURE ASSISTANT
            ========================================== */

            if (
                req.method === "POST" &&
                url.pathname === "/api/assistant"
            ) {

                try {

                    const body =
                        await getRequestBody(req);


                    sendJSON(
                        res,
                        200,
                        {
                            answer:
                                assistantAnswer(
                                    body.question
                                )
                        }
                    );

                }

                catch (error) {

                    sendJSON(
                        res,
                        400,
                        {
                            answer:
                                "Please enter a valid farming question."
                        }
                    );

                }

                return;

            }


            /* ==========================================
               404
            ========================================== */

            res.statusCode = 404;

            res.setHeader(
                "Content-Type",
                "text/plain; charset=utf-8"
            );

            res.end(
                "404 - Page Not Found"
            );

        }
    );


/* ======================================================
   START SERVER + CONNECT MONGODB
====================================================== */

async function startServer() {

    try {

        console.log(
            "Connecting to MongoDB..."
        );


        await mongoClient.connect();


        db =
            mongoClient.db(
                DB_NAME
            );


        farmersCollection =
            db.collection(
                "farmers"
            );


        marketCollection =
            db.collection(
                "marketPrices"
            );


        /* ==============================================
           DATABASE INDEXES
        ============================================== */

        await farmersCollection.createIndex(
            {
                mobile: 1
            }
        );


        await marketCollection.createIndex(
            {
                crop: 1
            }
        );


        /* ==============================================
           INSERT DEFAULT MARKET DATA
           ONLY IF COLLECTION IS EMPTY
        ============================================== */

        const marketCount =
            await marketCollection
                .countDocuments();


        if (
            marketCount === 0
        ) {

            await marketCollection
                .insertMany(
                    defaultMarketPrices
                );


            console.log(
                "Default market data inserted."
            );

        }


        /* ==============================================
           START SERVER
        ============================================== */

        server.listen(
            port,
            hostname,
            () => {

                console.log("");
                console.log(
                    "========================================"
                );

                console.log(
                    "🌾 SMART AGRI-FOOD PLATFORM"
                );

                console.log(
                    "========================================"
                );

                console.log(
                    `Server running on port ${port}`
                );

                console.log(
                    `Local URL: http://127.0.0.1:${port}/`
                );

                console.log(
                    "MongoDB connected successfully."
                );

                console.log(
                    `Database: ${DB_NAME}`
                );

                console.log(
                    "========================================"
                );

            }
        );

    }

    catch (error) {

        console.error("");
        console.error(
            "❌ MongoDB connection failed!"
        );

        console.error(
            error.message
        );

        console.error("");

        console.error(
            "Check your MONGODB_URI in the .env file."
        );

        process.exit(1);

    }

}


/* ======================================================
   GRACEFUL SHUTDOWN
====================================================== */

process.on(
    "SIGINT",
    async () => {

        console.log(
            "\nShutting down server..."
        );

        try {

            await mongoClient.close();

        }

        catch (error) {

            console.error(
                error.message
            );

        }

        process.exit(0);

    }
);


process.on(
    "SIGTERM",
    async () => {

        try {

            await mongoClient.close();

        }

        catch (error) {

            console.error(
                error.message
            );

        }

        process.exit(0);

    }
);


/* ======================================================
   RUN APPLICATION
====================================================== */

startServer();