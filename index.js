import express from "express";
import axios from "axios";
import cors from "cors";
import admin from "firebase-admin";

const app = express();

// --- CORS CONFIGURATION ---
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
    }
} catch (err) {
    console.error("Firebase Init Error:", err.message);
}

// --- MONNIFY HELPER FUNCTIONS ---
async function getMonnifyToken() {
    const authString = Buffer.from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`).toString('base64');
    
    try {
        const response = await axios.post('https://sandbox.monnify.com/api/v1/auth/login', {}, {
            headers: { 'Authorization': `Basic ${authString}` }
        });
        return response.data.responseBody.accessToken;
    } catch (error) {
        console.error("Monnify Auth Error:", error.response?.data || error.message);
        throw new Error("Failed to authenticate with Monnify");
    }
}

async function reserveAccount(uid, email, fullName) {
    const token = await getMonnifyToken();
    
    const payload = {
        accountReference: uid,
        accountName: fullName,
        currencyCode: "NGN",
        contractCode: process.env.MONNIFY_CONTRACT_CODE,
        customerEmail: email,
        getAllAvailableBanks: true
    };

    const response = await axios.post('https://sandbox.monnify.com/api/v2/bank-transfer/reserved-accounts', payload, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    return response.data.responseBody.accounts[0]; 
}

// --- ROUTES ---
app.get("/", (req, res) => {
    res.send("TimmyPay Backend is Running!");
});

// GET ACCOUNT ROUTE
app.get(["/get-account", "/get-account/"], async (req, res) => {
    const uid = req.headers['x-user-uid'];
    
    if (!uid) return res.status(400).json({ success: false, error: "Missing x-user-uid" });
    if (!db) return res.status(500).json({ success: false, error: "Database not initialized" });

    try {
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        if (!userData) return res.status(404).json({ success: false, error: "User not found" });

        if (userData.virtualAccount) {
            return res.json({ success: true, ...userData.virtualAccount });
        }

        const newAccount = await reserveAccount(uid, userData.email, userData.fullName);
        
        // Corrected: Now saving accountName to Firestore
        await userRef.update({
            virtualAccount: {
                accountNumber: newAccount.accountNumber,
                bankName: newAccount.bankName,
                accountName: newAccount.accountName
            }
        });

        // Corrected: Now sending accountName to Frontend
        res.json({ 
            success: true, 
            accountNumber: newAccount.accountNumber, 
            bankName: newAccount.bankName,
            accountName: newAccount.accountName 
        });
    } catch (error) {
        console.error("Final Integration Error:", error.response?.data || error.message);
        res.status(500).json({ success: false, error: "Could not generate account", details: error.message });
    }
});

// --- PORT SETUP ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
