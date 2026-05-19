const express = require("express");
const axios = require("axios");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

app.use(cors());
app.use(express.json());

// --- FIREBASE SETUP ---
let db; 

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore(); 
    console.log("Firebase Admin Initialized ✅");
  } catch (err) {
    console.error("Firebase Init Error:", err.message);
  }
} else {
  console.log("⚠️ Firebase Environment Variable missing. Database features will not work.");
}

// --- CONFIGURATION ---
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY || "MK_TEST_F7WX9CS86N";
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY || "ZKP8NZSQRVWTZY87ETYMOAN59PF6GQ8N";
const MONNIFY_BASE_URL = "https://sandbox.monnify.com/api/v1";

// --- ROUTES ---

// Home route
app.get("/", (req, res) => {
  res.send("TimmyPay Backend is Running!");
});

// GET TOKEN ROUTE
app.get("/get-token", async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const auth = Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString("base64");
    const response = await axios.post(`${MONNIFY_BASE_URL}/auth/login`, {}, {
      headers: { "Authorization": `Basic ${auth}` }
    });
    res.status(200).json({
      success: true,
      token: response.data.responseBody.accessToken
    });
  } catch (error) {
    console.error("Auth Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Auth Failed" });
  }
});

// WEBHOOK ROUTE
app.post("/webhook", async (req, res) => {
  const data = req.body;
  if (data.eventType === "SUCCESSFUL_TRANSACTION") {
    const amountPaid = data.eventData.amountPaid;
    const customerEmail = data.eventData.customer.email;

    if (!db) {
      console.error("Database not initialized");
      return res.status(500).send("DB Error");
    }

    try {
      const userRef = db.collection("users").doc(customerEmail); 
      await userRef.update({
        balance: admin.firestore.FieldValue.increment(amountPaid)
      });
      console.log(`Funded ${amountPaid} to ${customerEmail}`);
      return res.status(200).send("Success");
    } catch (err) {
      console.error("DB Update Error:", err);
      return res.status(500).send("Internal Error");
    }
  }
  res.status(200).send("Received");
});

// --- PORT SETUP ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Press CTRL+C to stop");
});

