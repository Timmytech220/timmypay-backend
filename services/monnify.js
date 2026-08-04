import axios from "axios";

const MONNIFY_BASE_URL = "https://sandbox.monnify.com";

async function getMonnifyToken() {
    const authString = Buffer.from(
        `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
    ).toString("base64");

    try {
        const response = await axios.post(
            `${MONNIFY_BASE_URL}/api/v1/auth/login`,
            {},
            {
                headers: {
                    Authorization: `Basic ${authString}`
                }
            }
        );

        return response.data.responseBody.accessToken;

    } catch (error) {
        console.error(
            "Monnify Auth Error:",
            error.response?.data || error.message
        );

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

    const response = await axios.post(
        `${MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data.responseBody.accounts[0];
}

export {
    getMonnifyToken,
    reserveAccount
};
