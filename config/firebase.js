import admin from "firebase-admin";

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

export { admin, db };
