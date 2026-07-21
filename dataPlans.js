function calculateSellingPrice(apiCost) {
  if (apiCost < 500) return apiCost + 50;
  if (apiCost < 1000) return apiCost + 70;
  if (apiCost < 2000) return apiCost + 100;
  if (apiCost < 5000) return apiCost + 150;
  if (apiCost < 10000) return apiCost + 200;
  if (apiCost < 20000) return apiCost + 300;
  if (apiCost < 50000) return apiCost + 500;
  return apiCost + 1000;
}

const dataPlans = {
  MTN: {
    "500": {
      name: "500 MB - Weekly (SME)",
      apiCost: 307.00,
      price: calculateSellingPrice(307.00),
      networkCode: "1"
    },
    "500.00": {
      name: "500 MB - Monthly (SME)",
      apiCost: 307.00,
      price: calculateSellingPrice(307.00),
      networkCode: "1"
    },
    "1000": {
      name: "1 GB - Weekly (SME)",
      apiCost: 410.00,
      price: calculateSellingPrice(410.00),
      networkCode: "1"
    },
    "1000.00": {
      name: "1 GB - Monthly (SME)",
      apiCost: 563.00,
      price: calculateSellingPrice(563.00),
      networkCode: "1"
    },
    "2000": {
      name: "2 GB - Weekly (SME)",
      apiCost: 820.00,
      price: calculateSellingPrice(820.00),
      networkCode: "1"
    },
    "2000.00": {
      name: "2 GB - Monthly (SME)",
      apiCost: 1117.00,
      price: calculateSellingPrice(1117.00),
      networkCode: "1"
    },
    "3000": {
      name: "3 GB - Weekly (SME)",
      apiCost: 1230.00,
      price: calculateSellingPrice(1230.00),
      networkCode: "1"
    },
    "3000.00": {
      name: "3 GB - Monthly (SME)",
      apiCost: 1629.00,
      price: calculateSellingPrice(1629.00),
      networkCode: "1"
    },
    "5000": {
      name: "5 GB - Weekly (SME)",
      apiCost: 2050.00,
      price: calculateSellingPrice(2050.00),
      networkCode: "1"
    },
    "5000.00": {
      name: "5 GB - Monthly (SME)",
      apiCost: 2511.00,
      price: calculateSellingPrice(2511.00),
      networkCode: "1"
    },
    "100.01": {
      name: "110MB Daily Plan - 1 day (Awoof Data)",
      apiCost: 97.00,
      price: calculateSellingPrice(97.00),
      networkCode: "1"
    },
    "200.01": {
      name: "230MB Daily Plan - 1 day (Awoof Data)",
      apiCost: 194.00,
      price: calculateSellingPrice(194.00),
      networkCode: "1"
    },
    "350.01": {
      name: "500MB Daily Plan - 1 day (Awoof Data)",
      apiCost: 339.50,
      price: calculateSellingPrice(339.50),
      networkCode: "1"
    },
    "500.01": {
      name: "1GB Daily Plan + 1.5mins. - 1 day (Awoof Data)",
      apiCost: 485.00,
      price: calculateSellingPrice(485.00),
      networkCode: "1"
    },
    "750.01": {
      name: "2.5GB Daily Plan - 1 day (Awoof Data)",
      apiCost: 727.50,
      price: calculateSellingPrice(727.50),
      networkCode: "1"
    },
    "900.01": {
      name: "2.5GB 2-Day Plan - 2 days (Awoof Data)",
      apiCost: 873.00,
      price: calculateSellingPrice(873.00),
      networkCode: "1"
    },
    "1000.01": {
      name: "3.2GB 2-Day Plan - 2 days (Awoof Data)",
      apiCost: 970.00,
      price: calculateSellingPrice(970.00),
      networkCode: "1"
    },
    "500.02": {
      name: "500MB Weekly Plan - 7 days (Direct Data)",
      apiCost: 485.00,
      price: calculateSellingPrice(485.00),
      networkCode: "1"
    },
    "800.01": {
      name: "1GB Weekly Plan - 7 days (Direct Data)",
      apiCost: 776.00,
      price: calculateSellingPrice(776.00),
      networkCode: "1"
    },
    "1000.03": {
      name: "1.5GB Weekly Plan - 7 days (Direct Data)",
      apiCost: 970.00,
      price: calculateSellingPrice(970.00),
      networkCode: "1"
    },
    "1500.03": {
      name: "3.5GB Weekly Plan - 7 days (Direct Data)",
      apiCost: 1455.00,
      price: calculateSellingPrice(1455.00),
      networkCode: "1"
    },
    "2500.01": {
      name: "6GB Weekly Plan - 7 days (Direct Data)",
      apiCost: 2425.00,
      price: calculateSellingPrice(2425.00),
      networkCode: "1"
    },
    "3500.01": {
      name: "11GB Weekly Bundle - 7 days (Direct Data)",
      apiCost: 3395.00,
      price: calculateSellingPrice(3395.00),
      networkCode: "1"
    },
    "1500.02": {
      name: "2GB+2mins Monthly Plan - 30 days (Direct Data)",
      apiCost: 1455.00,
      price: calculateSellingPrice(1455.00),
      networkCode: "1"
    },
    "2000.01": {
      name: "2.7GB+2mins Monthly Plan - 30 days (Direct Data)",
      apiCost: 1940.00,
      price: calculateSellingPrice(1940.00),
      networkCode: "1"
    },
    "2500.02": {
      name: "3.5GB+5mins Monthly Plan - 30 days (Direct Data)",
      apiCost: 2425.00,
      price: calculateSellingPrice(2425.00),
      networkCode: "1"
    },
    "3500.02": {
      name: "7GB Monthly Plan - 30 days (Direct Data)",
      apiCost: 3395.00,
      price: calculateSellingPrice(3395.00),
      networkCode: "1"
    },
    "4500.01": {
      name: "10GB+10mins Monthly Plan - 30 days (Direct Data)",
      apiCost: 4365.00,
      price: calculateSellingPrice(4365.00),
      networkCode: "1"
    },
    "5500.01": {
      name: "12.5GB Monthly Plan - 30 days (Direct Data)",
      apiCost: 5335.00,
      price: calculateSellingPrice(5335.00),
      networkCode: "1"
    },
    "6500.01": {
      name: "16.5GB+10mins Monthly Plan - 30 days (Direct Data)",
      apiCost: 6305.00,
      price: calculateSellingPrice(6305.00),
      networkCode: "1"
    },
    "7500.01": {
      name: "20GB Monthly Plan - 30 days (Direct Data)",
      apiCost: 7275.00,
      price: calculateSellingPrice(7275.00),
      networkCode: "1"
    },
    "9000.01": {
      name: "25GB Monthly Plan - 30 days (Direct Data)",
      apiCost: 8730.00,
      price: calculateSellingPrice(8730.00),
      networkCode: "1"
    },
    "11000.01": {
      name: "36GB Monthly Plan - 30 days (Direct Data)",
      apiCost: 10670.00,
      price: calculateSellingPrice(10670.00),
      networkCode: "1"
    },
    "18000.01": {
      name: "75GB Monthly Plan - 30 days (Direct Data)",
      apiCost: 17460.00,
      price: calculateSellingPrice(17460.00),
      networkCode: "1"
    },
    "35000.01": {
      name: "165GB Monthly Plan - 30 days (Direct Data)",
      apiCost: 33950.00,
      price: calculateSellingPrice(33950.00),
      networkCode: "1"
    },
    "40000.01": {
      name: "150GB 2-Month Plan - 60 days (Direct Data)",
      apiCost: 38800.00,
      price: calculateSellingPrice(38800.00),
      networkCode: "1"
    },
    "5000.01": {
      name: "20GB Weekly Plan - 7 days (Direct Data)",
      apiCost: 4850.00,
      price: calculateSellingPrice(4850.00),
      networkCode: "1"
    }
  }
};

module.exports = dataPlans;
    
