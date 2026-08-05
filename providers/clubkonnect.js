import axios from "axios";

const NELLOBYTE_BASE_URL = "https://www.nellobytesystems.com";

// ================================
// BUY AIRTIME
// ================================
async function buyAirtime(phone, amount, networkCode) {

    const networkMap = {
        MTN: "01",
        GLO: "02",
        T2MOBILE: "03",
        AIRTEL: "04"
    };

    const normalizedNetwork = networkCode.toUpperCase();
    const networkID = networkMap[normalizedNetwork];

    if (!networkID) {
        throw new Error(`Invalid network: ${networkCode}`);
    }

    const requestId = Date.now().toString();

    const url =
        `${NELLOBYTE_BASE_URL}/APIAirtimeV1.asp` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}` +
        `&MobileNetwork=${networkID}` +
        `&Amount=${amount}` +
        `&MobileNumber=${phone}` +
        `&RequestID=${requestId}`;

    const response = await axios.get(url);

    return response.data;
}

// ================================
// BUY DATA
// ================================
async function buyData(phone, networkCode, planId) {

    const requestId = Date.now().toString();

    const url =
        `${NELLOBYTE_BASE_URL}/APIDatabundleV1.asp` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}` +
        `&MobileNetwork=${networkCode}` +
        `&DataPlan=${planId}` +
        `&MobileNumber=${phone}` +
        `&RequestID=${requestId}`;

    const response = await axios.get(url);

    return response.data;
}

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

    const response = await axios.get(url);

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

    const response = await axios.get(url);

    return response.data;
}

// ================================
// VERIFY CABLE
// ================================
async function verifyCable(cableTV, smartCardNo) {

    const url =
        `${NELLOBYTE_BASE_URL}/APIVerifyCableTVV1.asp` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}` +
        `&CableTV=${cableTV}` +
        `&SmartCardNo=${smartCardNo}`;

    const response = await axios.get(url);

    return response.data;
}

// ================================
// BUY CABLE
// ================================
async function buyCable(
    cableTV,
    packageCode,
    smartCardNo,
    amount,
    phone
) {

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

    const response = await axios.get(url);

    return response.data;
}

// ================================
// GET EDUCATION PACKAGES (JAMB + WAEC)
// ================================
async function getEducationPackages() {

    const jambUrl =
        `${NELLOBYTE_BASE_URL}/APIJAMBPackagesV2.asp` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}`;


    const waecUrl =
        `${NELLOBYTE_BASE_URL}/APIWAECPackagesV2.asp` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}`;


    const jambResponse = await axios.get(jambUrl);

    const waecResponse = await axios.get(waecUrl);


    return {

        jamb: jambResponse.data,

        waec: waecResponse.data

    };

}


// ================================
// BUY EDUCATION PIN
// ================================
async function buyEducation(
    examType,
    phone
){

    const requestId = Date.now().toString();


    let endpoint = "";


    // JAMB
    if(
        examType === "utme-mock" ||
        examType === "utme-no-mock" ||
        examType === "de"
    ){

        endpoint = "APIJAMBV1.asp";

    }

    // WAEC
    else if(
        examType === "waecdirect"
    ){

        endpoint = "APIWAECV1.asp";

    }

    else{

        throw new Error("Invalid education package");

    }


    const url =
        `${NELLOBYTE_BASE_URL}/${endpoint}` +
        `?UserID=${process.env.CK_USERID}` +
        `&APIKey=${process.env.CK_APIKEY}` +
        `&ExamType=${examType}` +
        `&PhoneNo=${phone}` +
        `&RequestID=${requestId}`;


    const response = await axios.get(url);


    return response.data;

}


export {
    buyAirtime,
    buyData,
    verifyMeter,
    buyElectricity,
    verifyCable,
    buyCable,
    getEducationPackages,
    buyEducation
};
