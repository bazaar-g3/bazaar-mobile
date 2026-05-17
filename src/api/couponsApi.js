import catalogApi from "./catalogApi";

export function getMyCoupons(headers) {
  return catalogApi.get("/coupons/my", { headers });
}

export function postCoupon(payload, headers) {
  return catalogApi.post("/coupons", payload, { headers });
}

export function patchCouponStatus(couponId, payload, headers) {
  return catalogApi.patch(`/coupons/${couponId}/status`, payload, { headers });
}

export function patchCouponExpiration(couponId, payload, headers) {
  return catalogApi.patch(`/coupons/${couponId}/expiration`, payload, { headers });
}