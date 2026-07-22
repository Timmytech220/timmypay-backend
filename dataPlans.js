fucion calculateSellingPrice(apiCost) {
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

    SME: {

      "500": {
        name: "500 MB Weekly",
        validity: "7 Days",
        category: "SME",
        apiCost: 307.00,
        price: calculateSellingPrice(307.00),
        networkCode: "01"
      },

      "500.00": {
        name: "500 MB Monthly",
        validity: "30 Days",
        category: "SME",
        apiCost: 307.00,
        price: calculateSellingPrice(307.00),
        networkCode: "01"
      },

      "1000": {
        name: "1 GB Weekly",
        validity: "7 Days",
        category: "SME",
        apiCost: 410.00,
        price: calculateSellingPrice(410.00),
        networkCode: "01"
      },

      "1000.00": {
        name: "1 GB Monthly",
        validity: "30 Days",
        category: "SME",
        apiCost: 563.00,
        price: calculateSellingPrice(563.00),
        networkCode: "01"
      },

      "2000": {
        name: "2 GB Weekly",
        validity: "7 Days",
        category: "SME",
        apiCost: 820.00,
        price: calculateSellingPrice(820.00),
        networkCode: "01"
      },

      "2000.00": {
        name: "2 GB Monthly",
        validity: "30 Days",
        category: "SME",
        apiCost: 1117.00,
        price: calculateSellingPrice(1117.00),
        networkCode: "01"
      },

      "3000": {
        name: "3 GB Weekly",
        validity: "7 Days",
        category: "SME",
        apiCost: 1230.00,
        price: calculateSellingPrice(1230.00),
        networkCode: "01"
      },

      "3000.00": {
        name: "3 GB Monthly",
        validity: "30 Days",
        category: "SME",
        apiCost: 1629.00,
        price: calculateSellingPrice(1629.00),
        networkCode: "01"
      },

      "5000": {
        name: "5 GB Weekly",
        validity: "7 Days",
        category: "SME",
        apiCost: 2050.00,
        price: calculateSellingPrice(2050.00),
        networkCode: "01"
      },

      "5000.00": {
        name: "5 GB Monthly",
        validity: "30 Days",
        category: "SME",
        apiCost: 2511.00,
        price: calculateSellingPrice(2511.00),
        networkCode: "01"
      }

    },

    AWOOF: {

      "100.01": {
        name: "110MB Daily Plan",
        validity: "1 Day",
        category: "AWOOF",
        apiCost: 97.00,
        price: calculateSellingPrice(97.00),
        networkCode: "01"
      },

      "200.01": {
        name: "230MB Daily Plan",
        validity: "1 Day",
        category: "AWOOF",
        apiCost: 194.00,
        price: calculateSellingPrice(194.00),
        networkCode: "01"
      },

      "350.01": {
        name: "500MB Daily Plan",
        validity: "1 Day",
        category: "AWOOF",
        apiCost: 339.50,
        price: calculateSellingPrice(339.50),
        networkCode: "01"
      },

      "500.01": {
        name: "1GB Daily Plan + 1.5mins",
        validity: "1 Day",
        category: "AWOOF",
        apiCost: 485.00,
        price: calculateSellingPrice(485.00),
        networkCode: "01"
      },

      "750.01": {
        name: "2.5GB Daily Plan",
        validity: "1 Day",
        category: "AWOOF",
        apiCost: 727.50,
        price: calculateSellingPrice(727.50),
        networkCode: "01"
      },

      "900.01": {
        name: "2.5GB 2-Day Plan",
        validity: "2 Days",
        category: "AWOOF",
        apiCost: 873.00,
        price: calculateSellingPrice(873.00),
        networkCode: "01"
      },

      "1000.01": {
        name: "3.2GB 2-Day Plan",
        validity: "2 Days",
        category: "AWOOF",
        apiCost: 970.00,
        price: calculateSellingPrice(970.00),
        networkCode: "01"
      }

    },

    DIRECT: {

      "500.02": {
        name: "500MB Weekly Plan",
        validity: "7 Days",
        category: "DIRECT",
        apiCost: 485.00,
        price: calculateSellingPrice(485.00),
        networkCode: "01"
      },

      "800.01": {
        name: "1GB Weekly Plan",
        validity: "7 Days",
        category: "DIRECT",
        apiCost: 776.00,
        price: calculateSellingPrice(776.00),
        networkCode: "01"
      },

      "1000.03": {
        name: "1.5GB Weekly Plan",
        validity: "7 Days",
        category: "DIRECT",
        apiCost: 970.00,
        price: calculateSellingPrice(970.00),
        networkCode: "01"
      },

      "1500.03": {
        name: "3.5GB Weekly Plan",
        validity: "7 Days",
        category: "DIRECT",
        apiCost: 1455.00,
        price: calculateSellingPrice(1455.00),
        networkCode: "01"
      },

      "2500.01": {
        name: "6GB Weekly Plan",
        validity: "7 Days",
        category: "DIRECT",
        apiCost: 2425.00,
        price: calculateSellingPrice(2425.00),
        networkCode: "01"
      },

      "3500.01": {
        name: "11GB Weekly Bundle",
        validity: "7 Days",
        category: "DIRECT",
        apiCost: 3395.00,
        price: calculateSellingPrice(3395.00),
        networkCode: "01"
      },

      "5000.01": {
        name: "20GB Weekly Plan",
        validity: "7 Days",
        category: "DIRECT",
        apiCost: 4850.00,
        price: calculateSellingPrice(4850.00),
        networkCode: "01"
      },

      "1500.02": {
        name: "2GB + 2mins Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 1455.00,
        price: calculateSellingPrice(1455.00),
        networkCode: "01"
      },

      "2000.01": {
        name: "2.7GB + 2mins Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 1940.00,
        price: calculateSellingPrice(1940.00),
        networkCode: "01"
      },

      "2500.02": {
        name: "3.5GB + 5mins Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 2425.00,
        price: calculateSellingPrice(2425.00),
        networkCode: "01"
      },

      "3500.02": {
        name: "7GB Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 3395.00,
        price: calculateSellingPrice(3395.00),
        networkCode: "01"
      },

      "4500.01": {
        name: "10GB + 10mins Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 4365.00,
        price: calculateSellingPrice(4365.00),
        networkCode: "01"
      },

      "5500.01": {
        name: "12.5GB Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 5335.00,
        price: calculateSellingPrice(5335.00),
        networkCode: "01"
      },

      "6500.01": {
        name: "16.5GB + 10mins Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 6305.00,
        price: calculateSellingPrice(6305.00),
        networkCode: "01"
      },

      "7500.01": {
        name: "20GB Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 7275.00,
        price: calculateSellingPrice(7275.00),
        networkCode: "01"
      },

      "9000.01": {
        name: "25GB Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 8730.00,
        price: calculateSellingPrice(8730.00),
        networkCode: "01"
      },

      "11000.01": {
        name: "36GB Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 10670.00,
        price: calculateSellingPrice(10670.00),
        networkCode: "01"
      },

      "18000.01": {
        name: "75GB Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 17460.00,
        price: calculateSellingPrice(17460.00),
        networkCode: "01"
      },

      "35000.01": {
        name: "165GB Monthly Plan",
        validity: "30 Days",
        category: "DIRECT",
        apiCost: 33950.00,
        price: calculateSellingPrice(33950.00),
        networkCode: "01"
      },

      "40000.01": {
        name: "150GB 2-Month Plan",
        validity: "60 Days",
        category: "DIRECT",
        apiCost: 38800.00,
        price: calculateSellingPrice(38800.00),
        networkCode: "01"
      }

    }

  },

  GLO: {

  SME: {

    "200": {
      name: "200 MB",
      validity: "14 Days",
      category: "SME",
      apiCost: 94.00,
      price: calculateSellingPrice(94.00),
      networkCode: "02"
    },

    "500": {
      name: "500 MB",
      validity: "7 Days",
      category: "SME",
      apiCost: 230.00,
      price: calculateSellingPrice(230.00),
      networkCode: "02"
    },

    "1000.11": {
      name: "1 GB",
      validity: "3 Days",
      category: "SME",
      apiCost: 322.00,
      price: calculateSellingPrice(322.00),
      networkCode: "02"
    },

    "3000.11": {
      name: "3 GB",
      validity: "3 Days",
      category: "SME",
      apiCost: 968.00,
      price: calculateSellingPrice(968.00),
      networkCode: "02"
    },

    "5000.11": {
      name: "5 GB",
      validity: "3 Days",
      category: "SME",
      apiCost: 1614.00,
      price: calculateSellingPrice(1614.00),
      networkCode: "02"
    },

    "1000.12": {
      name: "1 GB",
      validity: "7 Days",
      category: "SME",
      apiCost: 357.00,
      price: calculateSellingPrice(357.00),
      networkCode: "02"
    },

    "3000.12": {
      name: "3 GB",
      validity: "7 Days",
      category: "SME",
      apiCost: 1072.00,
      price: calculateSellingPrice(1072.00),
      networkCode: "02"
    },

    "5000.12": {
      name: "5 GB",
      validity: "7 Days",
      category: "SME",
      apiCost: 1787.00,
      price: calculateSellingPrice(1787.00),
      networkCode: "02"
    },

    "1000.21": {
      name: "1 GB Night Plan",
      validity: "14 Days",
      category: "SME",
      apiCost: 357.00,
      price: calculateSellingPrice(357.00),
      networkCode: "02"
    },

    "3000.21": {
      name: "3 GB Night Plan",
      validity: "14 Days",
      category: "SME",
      apiCost: 1072.00,
      price: calculateSellingPrice(1072.00),
      networkCode: "02"
    },

    "5000.21": {
      name: "5 GB Night Plan",
      validity: "14 Days",
      category: "SME",
      apiCost: 1787.00,
      price: calculateSellingPrice(1787.00),
      networkCode: "02"
    },

    "10000.21": {
      name: "10 GB Night Plan",
      validity: "14 Days",
      category: "SME",
      apiCost: 3574.00,
      price: calculateSellingPrice(3574.00),
      networkCode: "02"
    },

    "1000": {
      name: "1 GB",
      validity: "30 Days",
      category: "SME",
      apiCost: 461.00,
      price: calculateSellingPrice(461.00),
      networkCode: "02"
    },

    "2000": {
      name: "2 GB",
      validity: "30 Days",
      category: "SME",
      apiCost: 922.00,
      price: calculateSellingPrice(922.00),
      networkCode: "02"
    },

    "3000": {
      name: "3 GB",
      validity: "30 Days",
      category: "SME",
      apiCost: 1383.00,
      price: calculateSellingPrice(1383.00),
      networkCode: "02"
    },

    "5000": {
      name: "5 GB",
      validity: "30 Days",
      category: "SME",
      apiCost: 2306.00,
      price: calculateSellingPrice(2306.00),
      networkCode: "02"
    },

    "10000": {
      name: "10 GB",
      validity: "30 Days",
      category: "SME",
      apiCost: 4612.00,
      price: calculateSellingPrice(4612.00),
      networkCode: "02"
    }

  },

  AWOOF: {

    "100.01": {
      name: "125MB",
      validity: "1 Day",
      category: "AWOOF",
      apiCost: 97.00,
      price: calculateSellingPrice(97.00),
      networkCode: "02"
    },

    "200.01": {
      name: "260MB",
      validity: "2 Days",
      category: "AWOOF",
      apiCost: 194.00,
      price: calculateSellingPrice(194.00),
      networkCode: "02"
    },

    "500.02": {
      name: "2GB",
      validity: "1 Day",
      category: "AWOOF",
      apiCost: 485.00,
      price: calculateSellingPrice(485.00),
      networkCode: "02"
    },

    "500.03": {
      name: "2.5GB Weekend Plan",
      validity: "Weekend (Sat & Sun)",
      category: "AWOOF",
      apiCost: 485.00,
      price: calculateSellingPrice(485.00),
      networkCode: "02"
    },

    "200.02": {
      name: "875MB Weekend Plan",
      validity: "Sunday",
      category: "AWOOF",
      apiCost: 194.00,
      price: calculateSellingPrice(194.00),
      networkCode: "02"
    }

  },

  DIRECT: {

    "500.01": {
      name: "1.5GB",
      validity: "14 Days",
      category: "DIRECT",
      apiCost: 485.00,
      price: calculateSellingPrice(485.00),
      networkCode: "02"
    },

    "1000.01": {
      name: "2.6GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 970.00,
      price: calculateSellingPrice(970.00),
      networkCode: "02"
    },

    "1500.01": {
      name: "5GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 1455.00,
      price: calculateSellingPrice(1455.00),
      networkCode: "02"
    },

    "2000.01": {
      name: "6.15GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 1940.00,
      price: calculateSellingPrice(1940.00),
      networkCode: "02"
    },

    "2500.01": {
      name: "7.5GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 2425.00,
      price: calculateSellingPrice(2425.00),
      networkCode: "02"
    },

    "3000.01": {
      name: "10GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 2910.00,
      price: calculateSellingPrice(2910.00),
      networkCode: "02"
    },

    "4000.01": {
      name: "12.5GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 3880.00,
      price: calculateSellingPrice(3880.00),
      networkCode: "02"
    },

    "5000.01": {
      name: "16GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 4850.00,
      price: calculateSellingPrice(4850.00),
      networkCode: "02"
    },

    "8000.01": {
      name: "28GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 7760.00,
      price: calculateSellingPrice(7760.00),
      networkCode: "02"
    },

    "10000.01": {
      name: "38GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 9700.00,
      price: calculateSellingPrice(9700.00),
      networkCode: "02"
    },

    "15000.01": {
      name: "64GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 14550.00,
      price: calculateSellingPrice(14550.00),
      networkCode: "02"
    },

    "20000.01": {
      name: "107GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 19400.00,
      price: calculateSellingPrice(19400.00),
      networkCode: "02"
    },

    "1500.02": {
      name: "6GB",
      validity: "7 Days",
      category: "DIRECT",
      apiCost: 1455.00,
      price: calculateSellingPrice(1455.00),
      networkCode: "02"
    },

    "30000.01": {
      name: "165GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 29100.00,
      price: calculateSellingPrice(29100.00),
      networkCode: "02"
    },

    "36000.01": {
      name: "220GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 38800.00,
      price: calculateSellingPrice(38800.00),
      networkCode: "02"
    },

    "50000.01": {
      name: "320GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 48500.00,
      price: calculateSellingPrice(48500.00),
      networkCode: "02"
    },

    "60000.01": {
      name: "380GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 58200.00,
      price: calculateSellingPrice(58200.00),
      networkCode: "02"
    },

    "75000.01": {
      name: "475GB",
      validity: "30 Days",
      category: "DIRECT",
      apiCost: 72750.00,
      price: calculateSellingPrice(72750.00),
      networkCode: "02"
    },

    "150000.03": {
      name: "1TB (1000GB)",
      validity: "365 Days",
      category: "DIRECT",
      apiCost: 145500.00,
      price: calculateSellingPrice(145500.00),
      networkCode: "02"
    }

  }

},


  
