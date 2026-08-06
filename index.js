import express from "express";
import axios from "axios";
import cors from "cors";
import dataPlans from "./dataPlans.js";
import { admin, db } from "./config/firebase.js";
import {
    getMonnifyToken,
    reserveAccount
} from "./services/monnify.js";
import {
    buyAirtime,
    buyData,
    verifyMeter,
    buyElectricity,
    verifyCable,
    buyCable,
    getEducationPackages,
    buyEducation
} from "./providers/clubkonnect.js";
import { getProfit } from "./utils/profitHelper.js";
const app = express();

// --- CONFIGURATION ---
const MONNIFY_BASE_URL = 'https://sandbox.monnify.com';


// Added x-user-uid to allowedHeaders to prevent blocking
app.use(cors({ 
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'x-user-uid'] 
}));
app.use(express.json());





// --- ROUTES ---
app.get("/", (req, res) => res.send("TimmyPay Backend is Running!"));


// ================================
// GET DATA PLANS (Dynamic Prices)
// ================================
app.get("/data-plans", async (req, res) => {

    try {

        // Load current profit settings
        const settingsDoc = await db
            .collection("settings")
            .doc("profitSettings")
            .get();

        const settings = settingsDoc.exists
            ? settingsDoc.data()
            : {};

        // Make a deep copy so we don't modify the original object
        const plans = JSON.parse(JSON.stringify(dataPlans));

        // Loop through every network
        for (const network in plans) {

            // Loop through every category
            for (const category in plans[network]) {

                const profit = getProfit(settings, network, category);

                // Loop through every plan
                for (const planId in plans[network][category]) {

                    const plan = plans[network][category][planId];

                    const apiCost = Number(plan.apiCost || 0);

                    plan.price = apiCost + profit;

                }

            }

        }

        res.json({
            success: true,
            plans
        });

    } catch (error) {

        console.error("DATA PLANS ERROR:", error);

        res.status(500).json({
            success: false,
            error: "Could not load data plans"
        });

    }

});





// ================================
// GET EDUCATION PACKAGES
// ================================
app.get("/education-packages", async (req, res) => {

    try {

        const packages = await getEducationPackages();

        res.json({
            success: true,
            packages
        });


    } catch(error){

        console.error(
            "EDUCATION PACKAGES ERROR:",
            error.message
        );

        res.status(500).json({

            success:false,

            error:"Could not load education packages"

        });

    }

});


// ================================
// GET PROFIT WALLET
// ================================
app.get("/profit-wallet", async (req, res) => {

    try {

        const walletDoc = await db
            .collection("profit")
            .doc("wallet")
            .get();

        if (!walletDoc.exists) {

            return res.json({
                success: true,
                wallet: {
                    availableProfit: 0,
                    totalProfit: 0,
                    withdrawnProfit: 0
                }
            });

        }

        res.json({
            success: true,
            wallet: walletDoc.data()
        });

    } catch (error) {

        console.error("GET PROFIT WALLET ERROR:", error);

        res.status(500).json({
            success: false,
            error: error.message
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

                orderid: "MOCK" + Date.now(),

                customer_name: "TEST CUSTOMER"

            };

        } else {

            // ==========================
            // REAL API
            // ==========================
            result = await buyElectricity(
                companyCode,
                meterType,
                meterNo,
                apiCost,
                phone
            );

        }

        console.log("BUY RESULT:", result);

        if (
            result.statuscode !== "100" &&
            result.status !== "ORDER_RECEIVED"
        ) {

            return res.json({

                success: false,

                error:
                result.status || "Purchase failed"

            });

        }

        // ==========================
        // PROFIT
        // ==========================

        const profit =
            Number((amount - apiCost).toFixed(2));

        // ==========================
        // DEDUCT WALLET
        // ==========================

        await userRef.update({

            balance:
            admin.firestore.FieldValue.increment(-amount)

        });

        // ==========================
        // SAVE TRANSACTION
        // ==========================

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

            customerName:
            result.customer_name || "",

            token:
            result.metertoken || "",

            orderId:
            result.orderid || "",

            mock:
            meterNo === "12345678901",

            status:
            "Successful",

            transactionId:
            "TXN" + Date.now(),

            createdAt:
            admin.firestore.FieldValue.serverTimestamp()

        });

        return res.json({

            success: true,

            mock:
            meterNo === "12345678901",

            token:
            result.metertoken || "",

            orderId:
            result.orderid || "",

            customerName:
            result.customer_name || "",

            amount,

            apiCost,

            profit

        });

    }

    catch (error) {

        console.error("BUY ELECTRICITY ERROR:", error);

        return res.status(500).json({

            success: false,

            error:
            error.message || "Electricity purchase failed"

        });

    }

});






        
// ================================
// BUY EDUCATION PIN
// ================================
app.post("/buy-education", async (req, res) => {

    const uid = req.headers["x-user-uid"];

    const {
        examType,
        phone,
        packageName,
        apiCost
    } = req.body;

    if (!uid) {
        return res.status(400).json({
            success: false,
            error: "Missing UID"
        });
    }

    try {

        // ==========================
        // LOAD PROFIT SETTINGS
        // ==========================

        const settingsDoc = await db
            .collection("settings")
            .doc("profitSettings")
            .get();

        const settings = settingsDoc.exists
            ? settingsDoc.data()
            : {};

        // ==========================
        // CALCULATE COST & PROFIT
        // ==========================

        const cost = Number(apiCost || 0);

        const profit = Number(
            settings.educationProfit || 0
        );

        const sellingPrice = cost + profit;

        // ==========================
        // USER WALLET
        // ==========================

        const walletRef =
            db.collection("users").doc(uid);

        const walletDoc =
            await walletRef.get();

        if (!walletDoc.exists) {

            return res.status(404).json({
                success: false,
                error: "User not found"
            });

        }

        const wallet =
            walletDoc.data();

        const balance =
            Number(wallet.balance || 0);

        if (balance < sellingPrice) {

            return res.status(400).json({
                success: false,
                error: "Insufficient wallet balance"
            });

        }

        // ==========================
        // BUY FROM CLUBKONNECT
        // ==========================

        const result =
            await buyEducation(
                examType,
                phone
            );

        console.log(
            "EDUCATION RESPONSE:",
            result
        );

        if (
            result.statuscode &&
            result.statuscode !== "200"
        ) {

            return res.status(400).json({
                success: false,
                error:
                    result.remark ||
                    "Education purchase failed"
            });

        }

        // ==========================
        // DEDUCT USER WALLET
        // ==========================

        await walletRef.update({

            balance:
                admin.firestore.FieldValue.increment(
                    -sellingPrice
                )

        });

        // ==========================
        // SAVE TRANSACTION
        // ==========================

        await db.collection("transactions").add({

            uid,

            // Service information
            type: "Education Purchase",

            network: "Education",

            category: "Exam PIN",

            plan: packageName,

            examType,

            // Customer information
            phone,

            // Financial information
            amount: sellingPrice,

            apiCost: cost,

            profit,

            // PIN information
            pin:
                result.carddetails || "",

            // Status
            status: "Successful",

            transactionId:
                "TXN" + Date.now(),

            provider: "ClubKonnect",

            createdAt:
                admin.firestore.FieldValue.serverTimestamp()

        });

        // ==========================
        // RESPONSE
        // ==========================

        res.json({

            success: true,

            charged: sellingPrice,

            apiCost: cost,

            profit,

            data: result

        });

    } catch (error) {

        console.error(
            "BUY EDUCATION ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            error:
                error.message ||
                "Education purchase failed"

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

        // ============================
        // GET SELECTED PLAN
        // ============================

        const plan = dataPlans[network]?.[type]?.[planId];

        if (!plan) {
            return res.status(400).json({
                success: false,
                error: "Invalid data plan"
            });
        }

        // ============================
        // LOAD PROFIT SETTINGS
        // ============================

        const settingsDoc = await db
            .collection("settings")
            .doc("profitSettings")
            .get();

        const settings = settingsDoc.exists
            ? settingsDoc.data()
            : {};

        console.log("=================================");
        console.log("Profit Settings:", settings);
        console.log("=================================");

        // ============================
        // GET PROFIT
        // ============================

        const profit = getProfit(settings, network, type);

        console.log("Network:", network);
        console.log("Type:", type);
        console.log("Profit:", profit);

        // ============================
        // CALCULATE PRICE
        // ============================

        const apiCost = Number(plan.apiCost || 0);
        const sellingPrice = apiCost + profit;

        console.log("API Cost:", apiCost);
        console.log("Selling Price:", sellingPrice);

        // ============================
        // GET USER
        // ============================

        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const balance = Number(userDoc.data().balance || 0);

        console.log("User Balance:", balance);

        if (balance < sellingPrice) {
            return res.status(400).json({
                success: false,
                error: "Insufficient balance"
            });
        }

        // ============================
        // BUY DATA FROM PROVIDER
        // ============================

        const result = await buyData(
            phone,
            plan.networkCode,
            planId
        );

        // ============================
        // DEDUCT WALLET
        // ============================

        await userRef.update({
            balance: admin.firestore.FieldValue.increment(-sellingPrice)
        });

        
// ============================
// UPDATE PROFIT WALLET
// ============================

try {

    console.log("Updating Profit Wallet...");

    await db.collection("profit")
        .doc("wallet")
        .set({

            availableProfit: admin.firestore.FieldValue.increment(Number(profit)),

            totalProfit: admin.firestore.FieldValue.increment(Number(profit)),

            updatedAt: admin.firestore.FieldValue.serverTimestamp()

        }, { merge: true });

    console.log("Profit Wallet Updated Successfully");

} catch (err) {

    console.error("PROFIT WALLET ERROR:", err);

}

        const walletDoc = await db.collection("profit").doc("wallet").get();

console.log("Wallet Exists:", walletDoc.exists);
console.log("Wallet Data:", walletDoc.data());
        // ============================
        // SAVE TRANSACTION
        // ============================

        await db.collection("transactions").add({

            uid,

            type: "Data Purchase",

            network,

            category: type,

            plan: plan.name,

            phone,

            amount: sellingPrice,

            apiCost,

            profit,

            status: "Successful",

            transactionId: "TXN" + Date.now(),

            createdAt: admin.firestore.FieldValue.serverTimestamp()

        });

        // ============================
        // RESPONSE
        // ============================

        res.json({

            success: true,

            charged: sellingPrice,

            apiCost,

            profit,

            data: result

        });

    } catch (error) {

        console.error("BUY DATA ERROR:", error);

        res.status(500).json({

            success: false,

            error: error.message || "Data purchase failed"

        });

    }

});



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
                  
