import express from "express";
import axios from "axios";
import cors from "cors";
import admin from "firebase-admin";

const app = express();

// --- CONFIGURATION ---
const MONNIFY_BASE_URL = 'https://sandbox.monnify.com';
const NELLOBYTE_BASE_URL = 'https://www.nellobytesystems.com'; 

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'x-user-uid'] }));
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
        const response = await axios.post(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {}, {
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

    const response = await axios.post(`${MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`, payload, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    return response.data.responseBody.accounts[0]; 
}

// --- UPDATED NELLOBYTESYSTEMS HELPER FUNCTION ---
async function buyAirtime(phone, amount, networkCode) {
    // Mapping network names to their required IDs from the docs
    const networkMap = {
        "MTN": "01",
        "GLO": "02",
        "T2MOBILE": "03",
        "AIRTEL": "04"
    };

    const normalizedNetwork = networkCode.toUpperCase();
    const networkID = networkMap[normalizedNetwork];

    if (!networkID) {
        throw new Error(`Invalid network: ${networkCode}. Please use MTN, GLO, T2MOBILE, or AIRTEL.`);
    }

    const uniqueId = Date.now().toString();
    const url = `${NELLOBYTE_BASE_URL}/APIAirtimeV1.asp?UserID=${process.env.CK_USERID}&APIKey=${process.env.CK_APIKEY}&MobileNetwork=${networkID}&Amount=${amount}&MobileNumber=${phone}&RequestID=${uniqueId}`;
    
    const response = await axios.get(url);
    return response.data;
}

// --- ROUTES ---
app.get("/", (req, res) => res.send("TimmyPay Backend is Running!"));

// Get Account Route
app.get(["/get-account", "/get-account/"], async (req, res) => {
    const uid = req.headers['x-user-uid'];
    if (!uid) return res.status(400).json({ success: false, error: "Missing x-user-uid" });

    try {
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        if (!userData) return res.status(404).json({ success: false, error: "User not found" });

        if (userData.virtualAccount) {
            return res.json({ 
                success: true, 
                accountNumber: userData.virtualAccount.accountNumber || "N/A",
                bankName: userData.virtualAccount.bankName || "N/A",
                accountName: userData.virtualAccount.accountName || userData.fullName || "User"
            });
        }

        const newAccount = await reserveAccount(uid, userData.email, userData.fullName);
        
        await userRef.update({
            virtualAccount: {
                accountNumber: newAccount.accountNumber,
                bankName: newAccount.bankName,
                accountName: newAccount.accountName
            }
        });

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

// Buy Airtime Route
app.post("/buy-airtime", async (req, res) => {
    const uid = req.headers['x-user-uid'];
    const { phone, amount, networkCode } = req.body;
    
    if (!uid) return res.status(400).json({ success: false, error: "Missing UID" });

    try {
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) return res.status(404).json({ success: false, error: "User not found" });
        
        const balance = userDoc.data().balance || 0;

        if (balance < amount) return res.status(400).json({ success: false, error: "Insufficient balance" });

        const result = await buyAirtime(phone, amount, networkCode);

        // Deduct balance only if successful
        await userRef.update({
            balance: admin.firestore.FieldValue.increment(-amount)
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error("AIRTIME ERROR:", error);
        res.status(500).json({ success: false, error: "Airtime purchase failed" });
    }
});

// Get Balance Route
app.get("/get-balance", async (req, res) => {
    const uid = req.headers['x-user-uid'];
    if (!uid) return res.status(400).json({ success: false, error: "Missing UID" });

    try {
        const userDoc = await db.collection("users").doc(uid).get();
        const balance = userDoc.exists ? (userDoc.data().balance || 0) : 0;
        res.json({ success: true, balance: balance });
    } catch (error) {
        res.status(500).json({ success: false, error: "Could not fetch balance" });
    }
});

// --- WEBHOOK ROUTE ---
app.post("/webhook", async (req, res) => {
    const { eventType, eventData } = req.body;

    if (eventType === "test_transaction_successful" || eventType === "SUCCESSFUL_TRANSACTION") {
        const amountPaid = eventData.amountPaid || eventData.amount; 
        const accountReference = eventData.product?.reference || eventData.accountReference;

        try {
            const userRef = db.collection("users").doc(accountReference);
            await userRef.update({
                balance: admin.firestore.FieldValue.increment(amountPaid)
            });
            console.log(`Updated balance for ${accountReference} with N${amountPaid}`);
            return res.status(200).send("Webhook Received");
        } catch (error) {
            console.error("Webhook Update Error:", error);
            return res.status(500).send("Update Failed");
        }
    }
    res.status(200).send("Event ignored");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));
                                
