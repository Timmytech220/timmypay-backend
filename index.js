import express from "express";
import axios from "axios";
import cors from "cors";
import admin from "firebase-admin";
import dataPlans from "./dataPlans.js";

const app = express();

// --- CONFIGURATION ---
const MONNIFY_BASE_URL = 'https://sandbox.monnify.com';
const NELLOBYTE_BASE_URL = 'https://www.nellobytesystems.com'; 

// Added x-user-uid to allowedHeaders to prevent blocking
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

        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

        console.log("Firebase Project ID:", serviceAccount.project_id);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        db = admin.firestore();

        console.log("Firebase Admin Initialized ✅");
    } else {
        console.error("FIREBASE_SERVICE_ACCOUNT environment variable not found.");
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

// --- NELLOBYTESYSTEMS HELPER FUNCTION ---
async function buyAirtime(phone, amount, networkCode) {
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



// ================================
// NELLOBYTE DATA PURCHASE FUNCTION
// ================================
async function buyData(phone, networkCode, planId) {

    // Generate a unique request ID
    const requestId = Date.now().toString();

    // Build Nellobytes URL
    const url =
        `${NELLOBYTE_BASE_URL}/APIDatabundleV1.asp` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}` +
        `&MobileNetwork=${networkCode}` +
        `&DataPlan=${planId}` +
        `&MobileNumber=${phone}` +
        `&RequestID=${requestId}`;

    // Send request to Nellobytes
    const response = await axios.get(url);

    return response.data;
}




// --- ROUTES ---
app.get("/", (req, res) => res.send("TimmyPay Backend is Running!"));

// ================================
// GET DATA PLANS
// ================================
app.get("/data-plans", (req, res) => {
    try {
        res.json({
            success: true,
            plans: dataPlans
        });
    } catch (error) {
        console.error("DATA PLANS ERROR:", error);
        res.status(500).json({
            success: false,
            error: "Could not load data plans"
        });
    }
});


// MOCK CABLE TV SMARTCARD VERIFICATION

app.post("/verify-smartcard", async (req, res) => {

    try {

        const { cable, smartcard } = req.body;


        if (!cable || !smartcard) {

            return res.json({
                status: "failed",
                message: "Missing cable provider or smartcard number"
            });

        }


        // Temporary fake response for testing

        res.json({

            status: "success",

            customer_name: "TIMMY CUSTOMER",

            cable_provider: cable.toUpperCase(),

            smartcard: smartcard,

            current_package: req.body.packageName,

amount: req.body.amount,

            message: "Smartcard verified successfully"

        });


    } catch(error) {

        console.log(error);

        res.status(500).json({

            status:"failed",
            message:"Server error"

        });

    }
    });


// ================================
// VERIFY ELECTRICITY METER
// ================================
app.post("/verify-meter", async (req, res) => {

    const {
        companyCode,
        meterType,
        meterNo
    } = req.body;

    try {

        console.log("VERIFY REQUEST:", {
            companyCode,
            meterType,
            meterNo
        });

        const result = await verifyMeter(
            companyCode,
            meterType,
            meterNo
        );

        console.log("VERIFY RESPONSE:", result);

        if (
            result.customer_name &&
            result.customer_name !== "INVALID_METERNO"
        ) {

            return res.json({
                success: true,
                customerName: result.customer_name
            });

        }

        return res.json({
            success: false,
            error: "Invalid meter number"
        });

    } catch (error) {

        console.error("VERIFY ERROR:", error.response?.data || error.message);

        return res.status(500).json({
            success: false,
            error: "Meter verification failed"
        });

    }

});



// ================================
// VERIFY CABLE SMARTCARD
// ================================
app.post("/verify-cable", async (req, res) => {

    const {
        cableTV,
        smartCardNo
    } = req.body;

    console.log("VERIFY CABLE REQUEST:", {
        cableTV,
        smartCardNo
    });

    try {

        const result = await verifyCable(
            cableTV,
            smartCardNo
        );

        console.log("VERIFY CABLE RESPONSE:", result);

        if (
            result.customer_name &&
            result.customer_name !== "INVALID_SMARTCARD"
        ) {

            return res.json({
                success: true,
                customerName: result.customer_name
            });

        }

        return res.json({
            success: false,
            error: result.status || "Invalid Smart Card Number"
        });

    } catch (error) {

        console.error(
            "VERIFY CABLE ERROR:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            error: "Cable verification failed"
        });

    }

});





// ================================
// BUY CABLE TV
// ================================
app.post("/buy-cable", async (req, res) => {

    const uid = req.headers["x-user-uid"];

    if (!uid) {
        return res.status(400).json({
            success: false,
            error: "Missing UID"
        });
    }

    const {
        cableTV,
        packageCode,
        smartCardNo,
        amount,
        phone
    } = req.body;

    try {

        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const balance = userDoc.data().balance || 0;

        if (balance < amount) {
            return res.status(400).json({
                success: false,
                error: "Insufficient balance"
            });
        }

        let result;

        // ==================================
        // MOCK MODE
        // ==================================
        if (smartCardNo === "1234567890") {

            result = {

                statuscode: "100",

                status: "ORDER_RECEIVED",

                orderid: "MOCK" + Date.now(),

                customer_name: "TIMMY CUSTOMER"

            };

        } else {

            // REAL API
            result = await buyCable(
                cableTV,
                packageCode,
                smartCardNo,
                amount,
                phone
            );

        }

        console.log("BUY CABLE RESULT:", result);

        if (
            result.statuscode !== "100" &&
            result.status !== "ORDER_RECEIVED"
        ) {

            return res.json({
                success: false,
                error: result.status || "Subscription failed"
            });

        }

        // ============================
        // PROFIT
        // ============================

        const profit = Number((amount - apiCost).toFixed(2));

        // ============================
        // DEDUCT WALLET
        // ============================

        await userRef.update({

            balance:
            admin.firestore.FieldValue.increment(-amount)

        });

        // ============================
        // SAVE TRANSACTION
        // ============================

        await db.collection("transactions").add({

            uid,

            type: "Cable TV Subscription",

            cableTV,

            packageCode,

            smartCardNo,

            phone,

            amount,

            apiCost,

            profit,

            orderId: result.orderid || "",

            customerName:
            result.customer_name || "",

            status: "Successful",

            transactionId:
            "TXN" + Date.now(),

            createdAt:
            admin.firestore.FieldValue.serverTimestamp()

        });

        return res.json({

            success: true,

            mock:
            smartCardNo === "1234567890",

            orderId:
            result.orderid || "",

            amount,

            apiCost,

            profit,

            customerName:
            result.customer_name || ""

        });

    }

    catch (error) {

        console.error("BUY CABLE ERROR:", error);

        return res.status(500).json({

            success: false,

            error:
            error.message || "Cable subscription failed"

        });

    }

});



// ================================
// BUY ELECTRICITY
// ================================
app.post("/buy-electricity", async (req, res) => {

    const uid = req.headers["x-user-uid"];

    if (!uid) {
        return res.status(400).json({
            success: false,
            error: "Missing UID"
        });
    }

    const {
    companyCode,
    meterType,
    meterNo,
    apiCost,
    amount,
    phone
} = req.body;

    try {

        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const balance = userDoc.data().balance || 0;

        if (balance < amount) {
            return res.status(400).json({
                success: false,
                error: "Insufficient balance"
            });
        }



        let result;

// ==================================
// MOCK MODE
// ==================================
if (meterNo === "12345678901") {

    result = {

        statuscode: "100",

        status: "ORDER_RECEIVED",

        metertoken: "1234-5678-9012-3456",

        orderid: "MOCK" + Date.now()

    };

} else {

    // REAL API
    result = await buyElectricity(
        companyCode,
        meterType,
        meterNo,
        apiCost,
        phone
    );

}

        // ==========================
        // DEBUG
        // ==========================
        console.log("BUY RESULT:", result);

        if (
            result.statuscode !== "100" &&
            result.status !== "ORDER_RECEIVED"
        ) {

            return res.json({
                success: false,
                error: result.status || "Purchase failed"
            });

        }

        const apiCost = Number((amount * 0.995).toFixed(2));
        const profit = Number((amount - apiCost).toFixed(2));

        await userRef.update({
            balance: admin.firestore.FieldValue.increment(-amount)
        });

        await db.collection("transactions").add({

            uid,

            type: "Electricity Purchase",

            companyCode,

            meterType,

            meterNo,

            phone,

            amount,

            apiCost,

            profit,

            token: result.metertoken || "",

            orderId: result.orderid || "",

            status: "Successful",

            transactionId: "TXN" + Date.now(),

            createdAt: admin.firestore.FieldValue.serverTimestamp()

        });

        return res.json({

            success: true,

            token: result.metertoken || "",

            orderId: result.orderid || "",

            amount,

            apiCost,

            profit

        });

    } catch (error) {

        console.error("BUY ELECTRICITY ERROR:", error);

        return res.status(500).json({

            success: false,

            error: "Electricity purchase failed"

        });

    }

});




// ================================
// BUY DATA ROUTE
// ================================
app.post("/buy-data", async (req, res) => {
    const uid = req.headers["x-user-uid"];
    const { phone, network, type, planId } = req.body;

    if (!uid) {
        return res.status(400).json({
            success: false,
            error: "Missing UID"
        });
    }

    try {
        const plan = dataPlans[network]?.[type]?.[planId];

        if (!plan) {
            return res.status(400).json({
                success: false,
                error: "Invalid data plan"
            });
        }

        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const balance = userDoc.data().balance || 0;

        if (balance < plan.price) {
            return res.status(400).json({
                success: false,
                error: "Insufficient balance"
            });
        }

        // Buy data from API
        const result = await buyData(
            phone,
            plan.networkCode,
            planId
        );

        // Deduct wallet balance
        await userRef.update({
            balance: admin.firestore.FieldValue.increment(-plan.price)
        });

        // Save transaction history
        await db.collection("transactions").add({
            uid: uid,
            type: "Data Purchase",
            network: network,
            category: type,
            plan: plan.name,
            phone: phone,
            amount: plan.price,
            status: "Successful",
            transactionId: "TXN" + Date.now(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            charged: plan.price,
            apiCost: plan.apiCost,
            data: result
        });

    } catch (error) {
        console.error("BUY DATA ERROR:", error);

        res.status(500).json({
            success: false,
            error: "Data purchase failed"
        });
    }
});


// ================================
// VERIFY ELECTRICITY METER
// ================================
async function verifyMeter(companyCode, meterType, meterNo) {

    const url =
        `${NELLOBYTE_BASE_URL}/APIVerifyElectricityV1.asp` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}` +
        `&ElectricCompany=${companyCode}` +
        `&MeterNo=${meterNo}` +
        `&MeterType=${meterType}`;

    console.log("VERIFY URL:", url);

    const response = await axios.get(url);

    console.log("VERIFY RESPONSE:", response.data);

    return response.data;

}



// ================================
// BUY ELECTRICITY
// ================================
async function buyElectricity(
    companyCode,
    meterType,
    meterNo,
    amount,
    phone
) {

    const requestId = Date.now().toString();

    const url =
        `${NELLOBYTE_BASE_URL}/APIElectricityV1.asp` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}` +
        `&ElectricCompany=${companyCode}` +
        `&MeterType=${meterType}` +
        `&MeterNo=${meterNo}` +
        `&Amount=${amount}` +
        `&PhoneNo=${phone}` +
        `&RequestID=${requestId}`;

    console.log("BUY ELECTRICITY URL:", url);

    const response = await axios.get(url);

    console.log("BUY ELECTRICITY RESPONSE:", response.data);

    return response.data;

}



// ================================
// VERIFY CABLE TV SMARTCARD
// ================================
async function verifyCable(cableTV, smartCardNo) {

    const url =
        `${NELLOBYTE_BASE_URL}/APIVerifyCableTVV1.asp` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}` +
        `&CableTV=${cableTV}` +
        `&SmartCardNo=${smartCardNo}`;

    console.log("VERIFY CABLE URL:", url);

    const response = await axios.get(url);

    console.log("VERIFY CABLE RESPONSE:", response.data);

    return response.data;

}



// ================================
// BUY CABLE TV SUBSCRIPTION
// ================================
async function buyCable(
    cableTV,
    packageCode,
    smartCardNo,
    amount,
    phone
){

    const requestId = Date.now().toString();

    const url =
        `${NELLOBYTE_BASE_URL}/APICableTVV1.asp` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}` +
        `&CableTV=${cableTV}` +
        `&Package=${packageCode}` +
        `&SmartCardNo=${smartCardNo}` +
        `&PhoneNo=${phone}` +
        `&RequestID=${requestId}`;

    console.log("BUY CABLE URL:", url);

    const response = await axios.get(url);

    console.log("BUY CABLE RESPONSE:", response.data);

    return response.data;

}


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

    if (!uid) {
        return res.status(400).json({
            success: false,
            error: "Missing UID"
        });
    }

    try {
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const balance = userDoc.data().balance || 0;

        if (balance < amount) {
            return res.status(400).json({
                success: false,
                error: "Insufficient balance"
            });
        }

        // Buy Airtime
        const result = await buyAirtime(phone, amount, networkCode);

        // Deduct wallet balance
        await userRef.update({
            balance: admin.firestore.FieldValue.increment(-amount)
        });

        // Save transaction history
        await db.collection("transactions").add({
            uid: uid,
            type: "Airtime Purchase",
            network: networkCode,
            phone: phone,
            amount: amount,
            status: "Successful",
            transactionId: "TXN" + Date.now(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("AIRTIME ERROR:", error);

        res.status(500).json({
            success: false,
            error: "Airtime purchase failed"
        });
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


// ================================
// GET TRANSACTION HISTORY
// ================================
app.get("/transactions", async (req, res) => {
    const uid = req.headers["x-user-uid"];

    console.log("Received UID:", uid);

    if (!uid) {
        return res.status(400).json({
            success: false,
            error: "Missing UID"
        });
    }

    try {
        console.log("Running Firestore query...");
        
        const snapshot = await db.collection("transactions")
    .where("uid", "==", uid)
    .orderBy("createdAt", "desc")
    .get();

        console.log("Documents found:", snapshot.size);

        const transactions = [];

        snapshot.forEach(doc => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log("Transactions:", transactions);

        res.json({
            success: true,
            transactions
        });

    } catch (error) {
        console.error("TRANSACTION ERROR:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
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
                  
