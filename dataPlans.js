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

