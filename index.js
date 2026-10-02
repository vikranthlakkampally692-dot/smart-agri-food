require("dotenv").config();

const http = require("node:http");
const { MongoClient, ObjectId } = require("mongodb");

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

/* =========================================================
   DEFAULT MARKET DATA
========================================================= */

const defaultMarketData = [
    {
        crop: "Rice",
        market: "Hyderabad",
        price: 3200,
        unit: "quintal",
        trend: "Stable"
    },
    {
        crop: "Wheat",
        market: "Hyderabad",
        price: 2800,
        unit: "quintal",
        trend: "Up"
    },
    {
        crop: "Tomato",
        market: "Hyderabad",
        price: 2400,
        unit: "quintal",
        trend: "Down"
    },
    {
        crop: "Cotton",
        market: "Warangal",
        price: 7200,
        unit: "quintal",
        trend: "Up"
    },
    {
        crop: "Maize",
        market: "Nizamabad",
        price: 2300,
        unit: "quintal",
        trend: "Stable"
    },
    {
        crop: "Chilli",
        market: "Guntur",
        price: 10500,
        unit: "quintal",
        trend: "Up"
    }
];

/* =========================================================
   HTML PAGE
========================================================= */

const html = `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<meta
    name="description"
    content="Smart Agri-Food Platform for farmers"
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
    font-family:
        Arial,
        Helvetica,
        sans-serif;

    background: #f5f8f2;
    color: #26352a;
    line-height: 1.6;
}

/* =========================================================
   GLOBAL
========================================================= */

a {
    color: inherit;
}

button,
input,
select {
    font-family: inherit;
}

button {
    cursor: pointer;
}

section {
    scroll-margin-top: 90px;
}

.container {
    width: min(1150px, 92%);
    margin: auto;
}

/* =========================================================
   HEADER
========================================================= */

header {
    position: sticky;
    top: 0;
    z-index: 1000;

    background: #ffffff;

    box-shadow:
        0 2px 12px rgba(0, 0, 0, 0.08);
}

.navbar {
    min-height: 70px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;
}

.logo {
    text-decoration: none;

    font-size: 22px;
    font-weight: 800;

    color: #1f6f35;

    white-space: nowrap;
}

.logo span {
    color: #ef8f22;
}

nav {
    display: flex;
    align-items: center;
    gap: 24px;

    flex-wrap: wrap;
}

nav a {
    text-decoration: none;

    color: #344239;

    font-weight: 600;

    transition: 0.2s;
}

nav a:hover {
    color: #218739;
}

/* =========================================================
   HERO
========================================================= */

.hero {
    min-height: 620px;

    display: flex;
    align-items: center;

    background:
        linear-gradient(
            120deg,
            #eaf7e8,
            #ffffff
        );
}

.hero-content {
    display: grid;

    grid-template-columns:
        1.2fr
        0.8fr;

    align-items: center;

    gap: 50px;
}

.hero h1 {
    font-size: clamp(40px, 6vw, 68px);

    line-height: 1.05;

    color: #1f6330;

    margin-bottom: 22px;
}

.hero h1 span {
    color: #e98a1b;
}

.hero p {
    font-size: 19px;

    color: #5c695f;

    max-width: 650px;

    margin-bottom: 30px;
}

.hero-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
}

.btn {
    display: inline-block;

    border: none;

    padding: 13px 21px;

    border-radius: 9px;

    font-size: 15px;

    font-weight: 700;

    text-decoration: none;

    transition:
        transform 0.2s,
        box-shadow 0.2s,
        background 0.2s;
}

.btn:hover {
    transform: translateY(-2px);

    box-shadow:
        0 8px 18px rgba(0, 0, 0, 0.12);
}

.btn-primary {
    background: #218739;
    color: white;
}

.btn-primary:hover {
    background: #176b2c;
}

.btn-secondary {
    background: #f29a2e;
    color: white;
}

.btn-secondary:hover {
    background: #db7d12;
}

.btn-danger {
    background: #d9534f;
    color: white;
}

.btn-small {
    padding: 8px 12px;
    font-size: 13px;
}

/* Hero visual */

.hero-card {
    background: white;

    border-radius: 25px;

    padding: 35px;

    text-align: center;

    box-shadow:
        0 15px 45px rgba(39, 83, 44, 0.12);
}

.hero-icon {
    font-size: 100px;

    margin-bottom: 15px;
}

.hero-card h3 {
    color: #286b35;

    font-size: 25px;

    margin-bottom: 10px;
}

/* =========================================================
   SECTION
========================================================= */

.section {
    padding: 80px 0;
}

.section-title {
    text-align: center;

    margin-bottom: 45px;
}

.section-title h2 {
    font-size: 36px;

    color: #245d2d;

    margin-bottom: 10px;
}

.section-title p {
    color: #68736b;

    max-width: 700px;

    margin: auto;
}

/* =========================================================
   FEATURE CARDS
========================================================= */

.features-grid {
    display: grid;

    grid-template-columns:
        repeat(3, 1fr);

    gap: 22px;
}

.card {
    background: white;

    padding: 28px;

    border-radius: 15px;

    box-shadow:
        0 5px 20px rgba(0, 0, 0, 0.06);

    border: 1px solid #edf1ec;
}

.feature-card {
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}

.feature-card:hover {
    transform: translateY(-5px);

    box-shadow:
        0 12px 28px rgba(0, 0, 0, 0.1);
}

.feature-icon {
    font-size: 42px;

    margin-bottom: 12px;
}

.card h3 {
    color: #285f31;

    margin-bottom: 10px;
}

.card p {
    color: #69746c;
}

/* =========================================================
   DASHBOARD
========================================================= */

.dashboard {
    background: #edf7eb;
}

.dashboard-grid {
    display: grid;

    grid-template-columns:
        repeat(4, 1fr);

    gap: 18px;
}

.stat-card {
    background: white;

    border-radius: 15px;

    padding: 25px;

    text-align: center;

    box-shadow:
        0 5px 18px rgba(0, 0, 0, 0.06);
}

.stat-icon {
    font-size: 35px;

    margin-bottom: 8px;
}

.stat-number {
    font-size: 30px;

    font-weight: 800;

    color: #227536;
}

/* =========================================================
   CROP
========================================================= */

.crop-grid {
    display: grid;

    grid-template-columns:
        1fr
        1fr;

    gap: 25px;
}

.form-group {
    margin-bottom: 18px;
}

.form-group label {
    display: block;

    margin-bottom: 7px;

    font-weight: 700;

    color: #3e4d42;
}

input,
select {
    width: 100%;

    padding: 12px 14px;

    border: 1px solid #ccd6cd;

    border-radius: 8px;

    outline: none;

    background: white;

    font-size: 15px;
}

input:focus,
select:focus {
    border-color: #298c3b;

    box-shadow:
        0 0 0 3px rgba(41, 140, 59, 0.1);
}

.result-box {
    margin-top: 20px;

    padding: 20px;

    background: #eef9ec;

    border-left: 5px solid #2d8c3e;

    border-radius: 8px;

    display: none;
}

.result-box.show {
    display: block;
}

/* =========================================================
   WEATHER
========================================================= */

.weather-card {
    background:
        linear-gradient(
            135deg,
            #e7f3ff,
            #f7fbff
        );

    border-radius: 18px;

    padding: 35px;

    display: grid;

    grid-template-columns:
        1fr
        1fr;

    gap: 30px;

    align-items: center;
}

.weather-main {
    text-align: center;
}

.weather-icon {
    font-size: 80px;
}

.temperature {
    font-size: 55px;

    font-weight: 800;

    color: #25618a;
}

.weather-info {
    display: grid;

    grid-template-columns:
        1fr
        1fr;

    gap: 15px;
}

.weather-item {
    background: white;

    border-radius: 10px;

    padding: 15px;

    text-align: center;
}

/* =========================================================
   MARKET
========================================================= */

.table-wrapper {
    overflow-x: auto;

    background: white;

    border-radius: 14px;

    box-shadow:
        0 5px 20px rgba(0, 0, 0, 0.06);
}

table {
    width: 100%;

    border-collapse: collapse;

    min-width: 650px;
}

th,
td {
    padding: 15px;

    text-align: left;

    border-bottom: 1px solid #edf0ed;
}

th {
    background: #eaf5e8;

    color: #245e2e;
}

td {
    color: #4d5a50;
}

.price {
    font-weight: 800;

    color: #277c37;
}

.trend-up {
    color: #18883a;

    font-weight: 700;
}

.trend-down {
    color: #d94c3d;

    font-weight: 700;
}

.trend-stable {
    color: #d38718;

    font-weight: 700;
}

/* =========================================================
   DISEASE
========================================================= */

.disease-grid {
    display: grid;

    grid-template-columns:
        repeat(3, 1fr);

    gap: 20px;
}

.disease-card {
    border-top: 5px solid #4b923f;
}

.disease-card h3 {
    margin-bottom: 12px;
}

/* =========================================================
   MARKETPLACE
========================================================= */

.marketplace {
    background: #fff8ed;
}

.marketplace-grid {
    display: grid;

    grid-template-columns:
        repeat(3, 1fr);

    gap: 20px;
}

.product-card {
    background: white;

    border-radius: 15px;

    padding: 25px;

    text-align: center;

    box-shadow:
        0 5px 18px rgba(0, 0, 0, 0.07);
}

.product-icon {
    font-size: 55px;

    margin-bottom: 12px;
}

.product-card .price {
    margin: 12px 0;
}

/* =========================================================
   AI ASSISTANT
========================================================= */

.assistant {
    background:
        linear-gradient(
            135deg,
            #eef8eb,
            #f8fcf7
        );
}

.chat-box {
    max-width: 850px;

    margin: auto;

    background: white;

    border-radius: 18px;

    padding: 25px;

    box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.08);
}

.chat-messages {
    min-height: 180px;

    max-height: 350px;

    overflow-y: auto;

    padding: 10px;

    margin-bottom: 15px;
}

.message {
    padding: 12px 15px;

    border-radius: 10px;

    margin-bottom: 10px;

    max-width: 85%;
}

.message.ai {
    background: #eef8eb;

    color: #34523a;
}

.message.user {
    background: #277b37;

    color: white;

    margin-left: auto;
}

.chat-input {
    display: flex;

    gap: 10px;
}

.chat-input input {
    flex: 1;
}

/* =========================================================
   REGISTRATION
========================================================= */

.register-section {
    background: #f2f8f0;
}

.register-grid {
    display: grid;

    grid-template-columns:
        0.8fr
        1.2fr;

    gap: 25px;

    align-items: start;
}

.registration-info {
    background: #245f2d;

    color: white;

    border-radius: 16px;

    padding: 35px;
}

.registration-info h3 {
    font-size: 28px;

    margin-bottom: 15px;
}

.registration-info ul {
    list-style: none;

    margin-top: 20px;
}

.registration-info li {
    padding: 9px 0;
}

.registration-form {
    background: white;

    border-radius: 16px;

    padding: 30px;

    box-shadow:
        0 6px 20px rgba(0, 0, 0, 0.07);
}

.form-row {
    display: grid;

    grid-template-columns:
        1fr
        1fr;

    gap: 15px;
}

/* =========================================================
   FARMER TABLE
========================================================= */

.farmers-list {
    margin-top: 35px;
}

.farmer-count {
    margin-bottom: 15px;

    font-weight: 700;

    color: #397442;
}

/* =========================================================
   NOTIFICATION
========================================================= */

#notification {
    position: fixed;

    right: 20px;

    bottom: 20px;

    z-index: 9999;

    max-width: 360px;

    background: #245f2d;

    color: white;

    padding: 15px 20px;

    border-radius: 10px;

    box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.2);

    transform: translateY(150px);

    opacity: 0;

    transition: 0.3s;
}

#notification.show {
    transform: translateY(0);

    opacity: 1;
}

/* =========================================================
   FOOTER
========================================================= */

footer {
    background: #1e3e24;

    color: #dce8de;

    padding: 45px 0 25px;
}

.footer-grid {
    display: grid;

    grid-template-columns:
        1.5fr
        1fr
        1fr;

    gap: 30px;

    margin-bottom: 30px;
}

footer h3,
footer h4 {
    color: white;

    margin-bottom: 12px;
}

footer ul {
    list-style: none;
}

footer li {
    padding: 5px 0;
}

.footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.15);

    padding-top: 20px;

    text-align: center;

    color: #afc0b2;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {

    .hero-content,
    .crop-grid,
    .weather-card,
    .register-grid {
        grid-template-columns: 1fr;
    }

    .features-grid,
    .disease-grid,
    .marketplace-grid {
        grid-template-columns:
            repeat(2, 1fr);
    }

    .dashboard-grid {
        grid-template-columns:
            repeat(2, 1fr);
    }

    .footer-grid {
        grid-template-columns: 1fr 1fr;
    }

    .navbar {
        flex-direction: column;

        padding: 15px 0;
    }

    nav {
        justify-content: center;
    }
}

@media (max-width: 600px) {

    .hero {
        padding: 70px 0;
    }

    .section {
        padding: 55px 0;
    }

    .features-grid,
    .disease-grid,
    .marketplace-grid,
    .dashboard-grid,
    .footer-grid,
    .form-row {
        grid-template-columns: 1fr;
    }

    nav {
        gap: 12px;

        font-size: 14px;
    }

    .hero-buttons {
        flex-direction: column;
    }

    .hero-buttons .btn {
        text-align: center;
    }

    .chat-input {
        flex-direction: column;
    }
}

</style>

</head>

<body>

<!-- ======================================================
     HEADER
====================================================== -->

<header>

<div class="container navbar">

<a href="#home" class="logo">
🌾 Smart <span>Agri-Food</span>
</a>

<nav>

<a href="#home">Home</a>

<a href="#features">Features</a>

<a href="#crops">Crops</a>

<a href="#weather">Weather</a>

<a href="#market">Market</a>

<a href="#assistant">AI</a>

<a href="#register">Register</a>

</nav>

</div>

</header>


<!-- ======================================================
     HOME
====================================================== -->

<section id="home" class="hero">

<div class="container hero-content">

<div>

<h1>
Smart Farming<br>
for a <span>Better Future</span>
</h1>

<p>
A smart digital platform that helps farmers
make better decisions about crops, weather,
market prices, disease management and
agriculture resources.
</p>

<div class="hero-buttons">

<!-- IMPORTANT:
     These are anchors instead of JavaScript buttons.
     Therefore navigation works even if JavaScript has
     another problem.
-->

<a
    href="#register"
    class="btn btn-primary"
>
👨‍🌾 Register as Farmer
</a>

<a
    href="#features"
    class="btn btn-secondary"
>
Explore Features
</a>

</div>

</div>


<div class="hero-card">

<div class="hero-icon">
🌱
</div>

<h3>
Digital Agriculture
</h3>

<p>
Technology + Farming =
Smarter Decisions
</p>

<br>

<p>
📊 Market Data
</p>

<p>
🌦️ Weather Information
</p>

<p>
🤖 AI Assistance
</p>

</div>

</div>

</section>


<!-- ======================================================
     FEATURES
====================================================== -->

<section id="features" class="section">

<div class="container">

<div class="section-title">

<h2>
Smart Agriculture Features
</h2>

<p>
Everything farmers need in one simple platform.
</p>

</div>


<div class="features-grid">

<div class="card feature-card">

<div class="feature-icon">
🌾
</div>

<h3>
Crop Recommendation
</h3>

<p>
Get crop suggestions based on soil,
rainfall and environmental conditions.
</p>

</div>


<div class="card feature-card">

<div class="feature-icon">
🌦️
</div>

<h3>
Weather Information
</h3>

<p>
View agriculture-friendly weather
information for planning farm activities.
</p>

</div>


<div class="card feature-card">

<div class="feature-icon">
📈
</div>

<h3>
Market Prices
</h3>

<p>
Check sample crop market prices
and understand price trends.
</p>

</div>


<div class="card feature-card">

<div class="feature-icon">
🦠
</div>

<h3>
Disease Guidance
</h3>

<p>
Learn about common crop diseases
and basic prevention methods.
</p>

</div>


<div class="card feature-card">

<div class="feature-icon">
🛒
</div>

<h3>
Agriculture Marketplace
</h3>

<p>
Explore a simple marketplace concept
for agriculture products and services.
</p>

</div>


<div class="card feature-card">

<div class="feature-icon">
🤖
</div>

<h3>
AI Agriculture Assistant
</h3>

<p>
Ask agriculture-related questions and
receive helpful guidance.
</p>

</div>

</div>

</div>

</section>


<!-- ======================================================
     DASHBOARD
====================================================== -->

<section class="section dashboard">

<div class="container">

<div class="section-title">

<h2>
Agriculture Dashboard
</h2>

<p>
Quick overview of the platform.
</p>

</div>


<div class="dashboard-grid">

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

<p>
Registered Farmers
</p>

</div>


<div class="stat-card">

<div class="stat-icon">
🌾
</div>

<div class="stat-number">
6+
</div>

<p>
Market Crops
</p>

</div>


<div class="stat-card">

<div class="stat-icon">
🌦️
</div>

<div class="stat-number">
24°
</div>

<p>
Sample Temperature
</p>

</div>


<div class="stat-card">

<div class="stat-icon">
🤖
</div>

<div class="stat-number">
AI
</div>

<p>
Agriculture Assistant
</p>

</div>

</div>

</div>

</section>


<!-- ======================================================
     CROPS
====================================================== -->

<section id="crops" class="section">

<div class="container">

<div class="section-title">

<h2>
🌱 Crop Recommendation
</h2>

<p>
Enter your basic farm conditions to get a simple
crop recommendation.
</p>

</div>


<div class="crop-grid">

<div class="card">

<div class="form-group">

<label for="soil">
Soil Type
</label>

<select id="soil">

<option value="">
Select soil type
</option>

<option value="black">
Black Soil
</option>

<option value="red">
Red Soil
</option>

<option value="alluvial">
Alluvial Soil
</option>

<option value="sandy">
Sandy Soil
</option>

</select>

</div>


<div class="form-group">

<label for="rainfall">
Rainfall
</label>

<select id="rainfall">

<option value="">
Select rainfall
</option>

<option value="low">
Low
</option>

<option value="medium">
Medium
</option>

<option value="high">
High
</option>

</select>

</div>


<div class="form-group">

<label for="season">
Season
</label>

<select id="season">

<option value="">
Select season
</option>

<option value="kharif">
Kharif
</option>

<option value="rabi">
Rabi
</option>

<option value="summer">
Summer
</option>

</select>

</div>


<button
    type="button"
    class="btn btn-primary"
    id="cropButton"
>
Recommend Crop
</button>

</div>


<div class="card">

<h3>
Recommended Crop
</h3>

<p>
Our basic recommendation engine considers
soil, rainfall and season.
</p>

<div
    id="cropResult"
    class="result-box"
>
</div>

</div>

</div>

</div>

</section>


<!-- ======================================================
     WEATHER
====================================================== -->

<section id="weather" class="section">

<div class="container">

<div class="section-title">

<h2>
🌦️ Agriculture Weather
</h2>

<p>
Weather information for agriculture planning.
</p>

</div>


<div class="weather-card">

<div class="weather-main">

<div class="weather-icon">
☀️
</div>

<div class="temperature">
24°C
</div>

<h3>
Hyderabad
</h3>

<p>
Partly Sunny
</p>

</div>


<div class="weather-info">

<div class="weather-item">

<strong>
💧 Humidity
</strong>

<br>

65%

</div>


<div class="weather-item">

<strong>
💨 Wind
</strong>

<br>

12 km/h

</div>


<div class="weather-item">

<strong>
🌧️ Rain Chance
</strong>

<br>

20%

</div>


<div class="weather-item">

<strong>
🌡️ Soil Temp
</strong>

<br>

23°C

</div>

</div>

</div>

</div>

</section>


<!-- ======================================================
     MARKET
====================================================== -->

<section id="market" class="section">

<div class="container">

<div class="section-title">

<h2>
📈 Agricultural Market Prices
</h2>

<p>
Sample market prices loaded from MongoDB.
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
Price
</th>

<th>
Unit
</th>

<th>
Trend
</th>

</tr>

</thead>

<tbody id="marketTable">

<tr>

<td colspan="5">
Loading market prices...
</td>

</tr>

</tbody>

</table>

</div>

</div>

</section>


<!-- ======================================================
     DISEASE
====================================================== -->

<section class="section">

<div class="container">

<div class="section-title">

<h2>
🦠 Crop Disease Guidance
</h2>

<p>
Basic information about common crop problems.
</p>

</div>


<div class="disease-grid">

<div class="card disease-card">

<h3>
🍅 Tomato Blight
</h3>

<p>
Symptoms include dark spots on leaves
and fruits.
</p>

<br>

<strong>
Basic Prevention:
</strong>

<p>
Maintain proper spacing and avoid
excessive leaf moisture.
</p>

</div>


<div class="card disease-card">

<h3>
🌾 Rice Blast
</h3>

<p>
May cause diamond-shaped lesions
on rice leaves.
</p>

<br>

<strong>
Basic Prevention:
</strong>

<p>
Use balanced fertilizer and maintain
appropriate field conditions.
</p>

</div>


<div class="card disease-card">

<h3>
🌿 Cotton Pest Attack
</h3>

<p>
Leaves may show holes, curling or
visible insect activity.
</p>

<br>

<strong>
Basic Prevention:
</strong>

<p>
Monitor crops regularly and follow
local agricultural recommendations.
</p>

</div>

</div>

</div>

</section>


<!-- ======================================================
     MARKETPLACE
====================================================== -->

<section class="section marketplace">

<div class="container">

<div class="section-title">

<h2>
🛒 Agriculture Marketplace
</h2>

<p>
A simple concept for connecting farmers
with agriculture products.
</p>

</div>


<div class="marketplace-grid">

<div class="product-card">

<div class="product-icon">
🌱
</div>

<h3>
Seeds
</h3>

<p>
Quality crop seeds for farming.
</p>

<div class="price">
₹500+
</div>

<button
    type="button"
    class="btn btn-primary btn-small"
    onclick="showNotification('Seed marketplace feature coming soon')"
>
View
</button>

</div>


<div class="product-card">

<div class="product-icon">
🧪
</div>

<h3>
Fertilizers
</h3>

<p>
Agriculture fertilizer products.
</p>

<div class="price">
₹800+
</div>

<button
    type="button"
    class="btn btn-primary btn-small"
    onclick="showNotification('Fertilizer marketplace feature coming soon')"
>
View
</button>

</div>


<div class="product-card">

<div class="product-icon">
🚜
</div>

<h3>
Farm Equipment
</h3>

<p>
Agricultural tools and equipment.
</p>

<div class="price">
₹2,000+
</div>

<button
    type="button"
    class="btn btn-primary btn-small"
    onclick="showNotification('Equipment marketplace feature coming soon')"
>
View
</button>

</div>

</div>

</div>

</section>


<!-- ======================================================
     AI ASSISTANT
====================================================== -->

<section id="assistant" class="section assistant">

<div class="container">

<div class="section-title">

<h2>
🤖 AI Agriculture Assistant
</h2>

<p>
Ask a question about crops, soil, weather
or farming.
</p>

</div>


<div class="chat-box">

<div
    id="chatMessages"
    class="chat-messages"
>

<div class="message ai">

Hello! 👋 I am your agriculture assistant.
Ask me about crops, soil, weather,
market prices or farming.

</div>

</div>


<div class="chat-input">

<input
    id="assistantInput"
    type="text"
    placeholder="Ask an agriculture question..."
    autocomplete="off"
/>

<button
    type="button"
    class="btn btn-primary"
    id="assistantButton"
>
Ask AI
</button>

</div>

</div>

</div>

</section>


<!-- ======================================================
     REGISTER
====================================================== -->

<section
    id="register"
    class="section register-section"
>

<div class="container">

<div class="section-title">

<h2>
👨‍🌾 Farmer Registration
</h2>

<p>
Register your details in the Smart Agri-Food Platform.
</p>

</div>


<div class="register-grid">

<div class="registration-info">

<h3>
Join Smart Agriculture
</h3>

<p>
Register as a farmer and store your
basic farming information securely
in the project database.
</p>

<ul>

<li>
✅ Farmer profile
</li>

<li>
✅ Location information
</li>

<li>
✅ Main crop information
</li>

<li>
✅ MongoDB database storage
</li>

<li>
✅ View registered farmers
</li>

</ul>

</div>


<div class="registration-form">

<form id="farmerForm">

<div class="form-row">

<div class="form-group">

<label for="farmerName">
Full Name
</label>

<input
    id="farmerName"
    type="text"
    placeholder="Enter your name"
    required
/>

</div>


<div class="form-group">

<label for="farmerMobile">
Mobile Number
</label>

<input
    id="farmerMobile"
    type="tel"
    placeholder="Enter mobile number"
    maxlength="15"
    required
/>

</div>

</div>


<div class="form-row">

<div class="form-group">

<label for="farmerLocation">
Location
</label>

<input
    id="farmerLocation"
    type="text"
    placeholder="Village / City"
    required
/>

</div>


<div class="form-group">

<label for="farmerCrop">
Main Crop
</label>

<input
    id="farmerCrop"
    type="text"
    placeholder="Example: Rice"
    required
/>

</div>

</div>


<button
    type="submit"
    class="btn btn-primary"
>
Register Farmer
</button>

</form>

</div>

</div>


<div class="farmers-list">

<h3>
Registered Farmers
</h3>

<div
    id="farmerCountText"
    class="farmer-count"
>
Loading farmers...
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

<tr>

<td colspan="5">
Loading farmers...
</td>

</tr>

</tbody>

</table>

</div>

</div>

</div>

</section>


<!-- ======================================================
     FOOTER
====================================================== -->

<footer>

<div class="container">

<div class="footer-grid">

<div>

<h3>
🌾 Smart Agri-Food Platform
</h3>

<p>
A college project demonstrating how
technology can support modern agriculture.
</p>

</div>


<div>

<h4>
Quick Links
</h4>

<ul>

<li>
<a href="#home">
Home
</a>
</li>

<li>
<a href="#features">
Features
</a>
</li>

<li>
<a href="#market">
Market
</a>
</li>

<li>
<a href="#register">
Register
</a>
</li>

</ul>

</div>


<div>

<h4>
Platform
</h4>

<ul>

<li>
🌱 Crop Recommendation
</li>

<li>
🌦️ Weather
</li>

<li>
📈 Market Prices
</li>

<li>
🤖 AI Assistant
</li>

</ul>

</div>

</div>


<div class="footer-bottom">

© 2026 Smart Agri-Food Platform

</div>

</div>

</footer>


<!-- ======================================================
     NOTIFICATION
====================================================== -->

<div id="notification"></div>


<!-- ======================================================
     JAVASCRIPT
====================================================== -->

<script>

/* =========================================================
   NOTIFICATION
========================================================= */

let notificationTimer = null;

function showNotification(message) {

    const notification =
        document.getElementById("notification");

    notification.textContent = message;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {

        notification.classList.remove("show");

    }, 3000);
}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   SMOOTH SCROLL
========================================================= */

function scrollToSection(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   CROP RECOMMENDATION
========================================================= */

function recommendCrop() {

    const soil =
        document.getElementById("soil").value;

    const rainfall =
        document.getElementById("rainfall").value;

    const season =
        document.getElementById("season").value;

    const result =
        document.getElementById("cropResult");

    if (!soil || !rainfall || !season) {

        result.innerHTML =
            "⚠️ Please select soil, rainfall and season.";

        result.classList.add("show");

        return;
    }


    let crop = "Maize";

    let reason =
        "Maize can perform well under a variety of conditions.";


    if (
        soil === "black" &&
        rainfall === "medium" &&
        season === "kharif"
    ) {

        crop = "Cotton";

        reason =
            "Black soil and Kharif conditions can be suitable for cotton.";

    } else if (
        rainfall === "high" &&
        season === "kharif"
    ) {

        crop = "Rice";

        reason =
            "Rice generally requires higher water availability.";

    } else if (
        soil === "red" &&
        rainfall === "low"
    ) {

        crop = "Groundnut";

        reason =
            "Groundnut can be suitable for lighter soils with lower rainfall.";

    } else if (
        season === "rabi"
    ) {

        crop = "Wheat";

        reason =
            "Wheat is commonly grown during the Rabi season.";

    } else if (
        season === "summer" &&
        rainfall === "low"
    ) {

        crop = "Groundnut";

        reason =
            "Groundnut can be considered for suitable warm and relatively dry conditions.";

    }


    result.innerHTML = \`
        <strong>🌱 Recommended Crop: \${escapeHTML(crop)}</strong>
        <br><br>
        \${escapeHTML(reason)}
        <br><br>
        <small>
        Note: This is a demonstration recommendation.
        Consult local agricultural experts for real farming decisions.
        </small>
    \`;

    result.classList.add("show");
}


/* =========================================================
   MARKET DATA
========================================================= */

async function loadMarketPrices() {

    const table =
        document.getElementById("marketTable");

    try {

        const response =
            await fetch("/api/market");

        if (!response.ok) {
            throw new Error("Unable to load market data");
        }

        const data =
            await response.json();


        if (!Array.isArray(data) || data.length === 0) {

            table.innerHTML = \`
                <tr>
                    <td colspan="5">
                        No market data available.
                    </td>
                </tr>
            \`;

            return;
        }


        table.innerHTML =
            data.map(item => {

                let trendClass =
                    "trend-stable";

                if (String(item.trend).toLowerCase() === "up") {
                    trendClass = "trend-up";
                }

                if (String(item.trend).toLowerCase() === "down") {
                    trendClass = "trend-down";
                }


                return \`
                    <tr>

                        <td>
                            \${escapeHTML(item.crop)}
                        </td>

                        <td>
                            \${escapeHTML(item.market)}
                        </td>

                        <td class="price">
                            ₹\${Number(item.price).toLocaleString("en-IN")}
                        </td>

                        <td>
                            \${escapeHTML(item.unit)}
                        </td>

                        <td class="\${trendClass}">
                            \${escapeHTML(item.trend)}
                        </td>

                    </tr>
                \`;

            }).join("");

    } catch (error) {

        console.error(error);

        table.innerHTML = \`
            <tr>
                <td colspan="5">
                    Unable to load market prices.
                </td>
            </tr>
        \`;
    }
}


/* =========================================================
   FARMER DATA
========================================================= */

async function loadFarmers() {

    const table =
        document.getElementById("farmerTable");

    const count =
        document.getElementById("farmerCount");

    const countText =
        document.getElementById("farmerCountText");


    try {

        const response =
            await fetch("/api/farmers");

        if (!response.ok) {
            throw new Error("Unable to load farmers");
        }

        const farmers =
            await response.json();


        count.textContent =
            farmers.length;

        countText.textContent =
            farmers.length +
            " farmer(s) registered";


        if (farmers.length === 0) {

            table.innerHTML = \`
                <tr>
                    <td colspan="5">
                        No farmers registered yet.
                    </td>
                </tr>
            \`;

            return;
        }


        table.innerHTML =
            farmers.map(farmer => {

                return \`
                    <tr>

                        <td>
                            \${escapeHTML(farmer.name)}
                        </td>

                        <td>
                            \${escapeHTML(farmer.mobile)}
                        </td>

                        <td>
                            \${escapeHTML(farmer.location)}
                        </td>

                        <td>
                            \${escapeHTML(farmer.crop)}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn btn-danger btn-small"
                                onclick="deleteFarmer('\${escapeHTML(farmer._id)}')"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>
                \`;

            }).join("");

    } catch (error) {

        console.error(error);

        count.textContent = "0";

        countText.textContent =
            "Unable to load farmer data";

        table.innerHTML = \`
            <tr>
                <td colspan="5">
                    Unable to load registered farmers.
                </td>
            </tr>
        \`;
    }
}


/* =========================================================
   DELETE FARMER
========================================================= */

async function deleteFarmer(id) {

    if (!id) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this farmer?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/farmers/" +
                encodeURIComponent(id),
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to delete farmer"
            );
        }


        showNotification(
            "Farmer deleted successfully."
        );


        await loadFarmers();

    } catch (error) {

        console.error(error);

        showNotification(
            "Unable to delete farmer."
        );
    }
}


/* =========================================================
   FARMER REGISTRATION
========================================================= */

async function registerFarmer(event) {

    if (event) {
        event.preventDefault();
    }


    const name =
        document.getElementById("farmerName").value.trim();

    const mobile =
        document.getElementById("farmerMobile").value.trim();

    const location =
        document.getElementById("farmerLocation").value.trim();

    const crop =
        document.getElementById("farmerCrop").value.trim();


    if (!name || !mobile || !location || !crop) {

        showNotification(
            "Please fill all farmer details."
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


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Registration failed"
            );
        }


        document
            .getElementById("farmerForm")
            .reset();


        showNotification(
            "Farmer registered successfully! 🌾"
        );


        await loadFarmers();

    } catch (error) {

        console.error(error);

        showNotification(
            error.message ||
            "Unable to register farmer."
        );
    }
}


/* =========================================================
   AI ASSISTANT
========================================================= */

function addChatMessage(message, type) {

    const container =
        document.getElementById("chatMessages");

    const div =
        document.createElement("div");

    div.className =
        "message " + type;

    div.textContent =
        message;

    container.appendChild(div);

    container.scrollTop =
        container.scrollHeight;
}


async function askAssistant() {

    const input =
        document.getElementById("assistantInput");

    const question =
        input.value.trim();


    if (!question) {

        showNotification(
            "Please enter a question."
        );

        return;
    }


    addChatMessage(
        question,
        "user"
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


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Assistant error"
            );
        }


        addChatMessage(
            data.answer,
            "ai"
        );

    } catch (error) {

        console.error(error);

        addChatMessage(
            "Sorry, I could not process your question right now.",
            "ai"
        );
    }
}


/* =========================================================
   ENTER KEY FOR AI
========================================================= */

function handleEnter(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        askAssistant();
    }
}


/* =========================================================
   INITIALIZE FRONTEND
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Navigation
         *
         * Header links are normal #anchor links,
         * so they work even if another JS function fails.
         */

        document
            .querySelectorAll('nav a[href^="#"]')
            .forEach(link => {

                link.addEventListener(
                    "click",
                    function (event) {

                        const targetId =
                            this.getAttribute("href");

                        if (!targetId) {
                            return;
                        }


                        const target =
                            document.querySelector(
                                targetId
                            );


                        if (target) {

                            event.preventDefault();

                            target.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                            /*
                             * Update URL hash without
                             * causing another jump.
                             */

                            history.replaceState(
                                null,
                                "",
                                targetId
                            );
                        }

                    }
                );

            });


        /*
         * Crop button
         */

        const cropButton =
            document.getElementById("cropButton");

        if (cropButton) {

            cropButton.addEventListener(
                "click",
                recommendCrop
            );

        }


        /*
         * Farmer form
         */

        const farmerForm =
            document.getElementById("farmerForm");

        if (farmerForm) {

            farmerForm.addEventListener(
                "submit",
                registerFarmer
            );

        }


        /*
         * AI button
         */

        const assistantButton =
            document.getElementById(
                "assistantButton"
            );

        if (assistantButton) {

            assistantButton.addEventListener(
                "click",
                askAssistant
            );

        }


        /*
         * AI Enter key
         */

        const assistantInput =
            document.getElementById(
                "assistantInput"
            );

        if (assistantInput) {

            assistantInput.addEventListener(
                "keydown",
                handleEnter
            );

        }


        /*
         * Load MongoDB data
         */

        loadMarketPrices();

        loadFarmers();

    }
);

</script>

</body>

</html>
`;


/* =========================================================
   JSON RESPONSE
========================================================= */

function sendJSON(
    response,
    statusCode,
    data
) {

    const body =
        JSON.stringify(data);


    response.writeHead(
        statusCode,
        {
            "Content-Type":
                "application/json; charset=utf-8",

            "Access-Control-Allow-Origin":
                "*",

            "Access-Control-Allow-Methods":
                "GET,POST,DELETE,OPTIONS",

            "Access-Control-Allow-Headers":
                "Content-Type"
        }
    );


    response.end(body);
}


/* =========================================================
   BODY READER
========================================================= */

function getRequestBody(request) {

    return new Promise(
        (resolve, reject) => {

            let body = "";

            request.on(
                "data",
                chunk => {

                    body += chunk.toString();

                    if (body.length > 1000000) {

                        reject(
                            new Error(
                                "Request body too large"
                            )
                        );

                        request.destroy();
                    }

                }
            );


            request.on(
                "end",
                () => {

                    if (!body) {

                        resolve({});

                        return;
                    }


                    try {

                        resolve(
                            JSON.parse(body)
                        );

                    } catch (error) {

                        reject(
                            new Error(
                                "Invalid JSON"
                            )
                        );
                    }

                }
            );


            request.on(
                "error",
                reject
            );

        }
    );
}


/* =========================================================
   FARMER VALIDATION
========================================================= */

function validFarmer(data) {

    if (!data) {
        return false;
    }

    if (
        typeof data.name !== "string" ||
        typeof data.mobile !== "string" ||
        typeof data.location !== "string" ||
        typeof data.crop !== "string"
    ) {
        return false;
    }


    if (
        data.name.trim().length < 2 ||
        data.name.trim().length > 100
    ) {
        return false;
    }


    if (
        data.mobile.trim().length < 5 ||
        data.mobile.trim().length > 20
    ) {
        return false;
    }


    if (
        data.location.trim().length < 2 ||
        data.location.trim().length > 150
    ) {
        return false;
    }


    if (
        data.crop.trim().length < 2 ||
        data.crop.trim().length > 100
    ) {
        return false;
    }


    return true;
}


/* =========================================================
   AI ASSISTANT LOGIC
========================================================= */

function assistantAnswer(question) {

    const q =
        String(question)
            .toLowerCase()
            .trim();


    if (
        q.includes("rice") ||
        q.includes("paddy")
    ) {

        return (
            "Rice generally requires good water availability. " +
            "Maintain appropriate irrigation, monitor pests and " +
            "diseases, and use balanced nutrients. Local agricultural " +
            "recommendations should be followed for specific varieties."
        );

    }


    if (
        q.includes("cotton")
    ) {

        return (
            "Cotton grows well under suitable warm conditions. " +
            "Monitor the crop regularly for pests, maintain proper " +
            "nutrient management and follow local agricultural guidance."
        );

    }


    if (
        q.includes("tomato")
    ) {

        return (
            "For tomatoes, maintain proper spacing, avoid excessive " +
            "leaf wetness, monitor for fungal diseases and provide " +
            "balanced nutrition and irrigation."
        );

    }


    if (
        q.includes("soil")
    ) {

        return (
            "Soil testing is useful before selecting crops and fertilizer. " +
            "It can help identify pH and nutrient levels. Crop selection " +
            "should consider soil type, rainfall, season and local conditions."
        );

    }


    if (
        q.includes("weather") ||
        q.includes("rain")
    ) {

        return (
            "Weather information can help farmers plan irrigation, " +
            "spraying, harvesting and other activities. Always check " +
            "current local forecasts before making important decisions."
        );

    }


    if (
        q.includes("market") ||
        q.includes("price")
    ) {

        return (
            "Market prices can change based on supply, demand, quality " +
            "and location. Compare prices from multiple reliable local " +
            "markets before selling your produce."
        );

    }


    if (
        q.includes("fertilizer") ||
        q.includes("fertiliser")
    ) {

        return (
            "Use fertilizer according to soil-test results and crop needs. " +
            "Avoid excessive application. Local agricultural officers " +
            "can provide crop-specific recommendations."
        );

    }


    if (
        q.includes("pest") ||
        q.includes("insect")
    ) {

        return (
            "Inspect crops regularly for pest activity. Integrated pest " +
            "management can combine monitoring, cultural practices, " +
            "biological controls and appropriate approved treatments."
        );

    }


    if (
        q.includes("hello") ||
        q.includes("hi") ||
        q.includes("help")
    ) {

        return (
            "Hello! 👋 I can provide basic information about crops, " +
            "soil, weather, market prices, pests and farming practices."
        );

    }


    return (
        "I can help with basic agriculture topics such as crop selection, " +
        "soil, weather, irrigation, market prices, pests and fertilizers. " +
        "Please ask a specific farming question."
    );
}


/* =========================================================
   HTTP SERVER
========================================================= */

const server =
    http.createServer(
        async (request, response) => {

            try {

                const url =
                    new URL(
                        request.url,
                        "http://" +
                        request.headers.host
                    );


                const pathname =
                    url.pathname;


                /* -----------------------------------------
                   CORS PREFLIGHT
                ----------------------------------------- */

                if (
                    request.method === "OPTIONS"
                ) {

                    response.writeHead(
                        204,
                        {
                            "Access-Control-Allow-Origin": "*",

                            "Access-Control-Allow-Methods":
                                "GET,POST,DELETE,OPTIONS",

                            "Access-Control-Allow-Headers":
                                "Content-Type"
                        }
                    );

                    response.end();

                    return;
                }


                /* -----------------------------------------
                   HOME
                ----------------------------------------- */

                if (
                    request.method === "GET" &&
                    pathname === "/"
                ) {

                    response.writeHead(
                        200,
                        {
                            "Content-Type":
                                "text/html; charset=utf-8"
                        }
                    );

                    response.end(html);

                    return;
                }


                /* -----------------------------------------
                   STATUS
                ----------------------------------------- */

                if (
                    request.method === "GET" &&
                    pathname === "/api/status"
                ) {

                    sendJSON(
                        response,
                        200,
                        {
                            status: "ok",
                            application:
                                "Smart Agri-Food Platform",
                            database:
                                db ? "connected" : "disconnected"
                        }
                    );

                    return;
                }


                /* -----------------------------------------
                   MARKET
                ----------------------------------------- */

                if (
                    request.method === "GET" &&
                    pathname === "/api/market"
                ) {

                    const market =
                        await marketCollection
                            .find({})
                            .sort({
                                crop: 1
                            })
                            .toArray();


                    sendJSON(
                        response,
                        200,
                        market
                    );

                    return;
                }


                /* -----------------------------------------
                   GET FARMERS
                ----------------------------------------- */

                if (
                    request.method === "GET" &&
                    pathname === "/api/farmers"
                ) {

                    const farmers =
                        await farmersCollection
                            .find({})
                            .sort({
                                createdAt: -1
                            })
                            .toArray();


                    sendJSON(
                        response,
                        200,
                        farmers
                    );

                    return;
                }


                /* -----------------------------------------
                   CREATE FARMER
                ----------------------------------------- */

                if (
                    request.method === "POST" &&
                    pathname === "/api/farmers"
                ) {

                    const body =
                        await getRequestBody(
                            request
                        );


                    if (!validFarmer(body)) {

                        sendJSON(
                            response,
                            400,
                            {
                                error:
                                    "Please provide valid farmer details."
                            }
                        );

                        return;
                    }


                    const farmer = {

                        name:
                            body.name.trim(),

                        mobile:
                            body.mobile.trim(),

                        location:
                            body.location.trim(),

                        crop:
                            body.crop.trim(),

                        createdAt:
                            new Date()

                    };


                    /*
                     * Check for duplicate mobile number.
                     */

                    const existing =
                        await farmersCollection.findOne({
                            mobile:
                                farmer.mobile
                        });


                    if (existing) {

                        sendJSON(
                            response,
                            409,
                            {
                                error:
                                    "A farmer with this mobile number is already registered."
                            }
                        );

                        return;
                    }


                    const result =
                        await farmersCollection.insertOne(
                            farmer
                        );


                    sendJSON(
                        response,
                        201,
                        {
                            message:
                                "Farmer registered successfully.",
                            farmer: {
                                _id:
                                    result.insertedId,
                                ...farmer
                            }
                        }
                    );

                    return;
                }


                /* -----------------------------------------
                   DELETE FARMER
                ----------------------------------------- */

                if (
                    request.method === "DELETE" &&
                    pathname.startsWith(
                        "/api/farmers/"
                    )
                ) {

                    const id =
                        pathname.split("/").pop();


                    if (
                        !ObjectId.isValid(id)
                    ) {

                        sendJSON(
                            response,
                            400,
                            {
                                error:
                                    "Invalid farmer ID."
                            }
                        );

                        return;
                    }


                    const result =
                        await farmersCollection.deleteOne(
                            {
                                _id:
                                    new ObjectId(id)
                            }
                        );


                    if (
                        result.deletedCount === 0
                    ) {

                        sendJSON(
                            response,
                            404,
                            {
                                error:
                                    "Farmer not found."
                            }
                        );

                        return;
                    }


                    sendJSON(
                        response,
                        200,
                        {
                            message:
                                "Farmer deleted successfully."
                        }
                    );

                    return;
                }


                /* -----------------------------------------
                   AI ASSISTANT
                ----------------------------------------- */

                if (
                    request.method === "POST" &&
                    pathname === "/api/assistant"
                ) {

                    const body =
                        await getRequestBody(
                            request
                        );


                    const question =
                        typeof body.question === "string"
                            ? body.question.trim()
                            : "";


                    if (
                        !question ||
                        question.length > 500
                    ) {

                        sendJSON(
                            response,
                            400,
                            {
                                error:
                                    "Please provide a valid question."
                            }
                        );

                        return;
                    }


                    const answer =
                        assistantAnswer(
                            question
                        );


                    sendJSON(
                        response,
                        200,
                        {
                            question,
                            answer
                        }
                    );

                    return;
                }


                /* -----------------------------------------
                   NOT FOUND
                ----------------------------------------- */

                sendJSON(
                    response,
                    404,
                    {
                        error:
                            "Route not found."
                    }
                );

            } catch (error) {

                console.error(
                    "Request error:",
                    error
                );


                sendJSON(
                    response,
                    500,
                    {
                        error:
                            "Internal server error."
                    }
                );
            }

        }
    );


/* =========================================================
   START SERVER
========================================================= */

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


        /*
         * Indexes
         */

        try {

            await farmersCollection.createIndex(
                {
                    mobile: 1
                },
                {
                    unique: true
                }
            );

        } catch (error) {

            /*
             * Ignore duplicate index errors during
             * repeated development deployments.
             */

            console.log(
                "Farmer mobile index:",
                error.message
            );

        }


        await marketCollection.createIndex(
            {
                crop: 1
            }
        );


        /*
         * Seed market data if empty.
         */

        const marketCount =
            await marketCollection.countDocuments();


        if (marketCount === 0) {

            await marketCollection.insertMany(
                defaultMarketData
            );

            console.log(
                "Default market data inserted."
            );

        }


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
                    "Server running on port " +
                    port
                );

                console.log(
                    "Local URL: http://127.0.0.1:" +
                    port +
                    "/"
                );

                console.log(
                    "MongoDB connected successfully."
                );

                console.log(
                    "Database: " +
                    DB_NAME
                );

                console.log(
                    "========================================"
                );

            }
        );


    } catch (error) {

        console.error(
            "MongoDB connection failed:"
        );

        console.error(
            error
        );


        process.exit(
            1
        );
    }
}


/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */

async function shutdown() {

    console.log(
        "\nShutting down server..."
    );


    try {

        await mongoClient.close();

    } catch (error) {

        console.error(
            "MongoDB close error:",
            error.message
        );

    }


    process.exit(0);
}


process.on(
    "SIGINT",
    shutdown
);

process.on(
    "SIGTERM",
    shutdown
);


/* =========================================================
   START APPLICATION
========================================================= */

startServer();