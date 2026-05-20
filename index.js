const express = require("express");
const axios = require("axios");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

// --- CORS CONFIGURATION (Fixes connection errors) ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-user-uid']
}));
app.use(express.json());

// --- FIREBASE SETUP ---
let db;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
        });
        db = admin.firestore();
        console.log("Firebase Admin Initialized ✅");
    } else {
        console.error("⚠️ FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
    }
} catch (err) {
    console.error("Firebase Init Error:", err.message);
}

// --- ROUTES ---
app.get("/", (req, res) => {
    res.send("TimmyPay Backend is Running!");
});

// GET ACCOUNT ROUTE
app.get(["/get-account", "/get-account/"], async (req, res) => {
    const uid = req.headers['x-user-uid'];
    
    if (!uid) {
        return res.status(400).json({ success: false, error: "Missing x-user-uid header" });
    }

    if (!db) {
        return res.status(500).json({ success: false, error: "Database not initialized" });
    }

    try {
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        
        if (userData && userData.virtualAccount) {
            return res.json({ success: true, ...userData.virtualAccount });
        }
        res.json({ success: true, message: "Account not found" });
    } catch (error) {
        console.error("Fetch Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- PORT SETUP ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
              
