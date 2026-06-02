import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getMyCoupons,
  patchCouponExpiration,
  patchCouponStatus,
  postCoupon,
} from "../api/couponsApi";

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No hay sesión activa.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function listMyCoupons() {
  const headers = await getAuthHeaders();
  const response = await getMyCoupons(headers);
  return response.data;
}

export async function createCoupon({ code, discountPercent, expiresAt }) {
  const headers = await getAuthHeaders();

  const response = await postCoupon(
    {
      code,
      discountPercent,
      expiresAt,
    },
    headers
  );

  return response.data;
}

export async function updateCouponStatus({ couponId, isActive }) {
  const headers = await getAuthHeaders();

  const response = await patchCouponStatus(
    couponId,
    { isActive },
    headers
  );

  return response.data;
}

export async function updateCouponExpiration({ couponId, expiresAt }) {
  const headers = await getAuthHeaders();

  const response = await patchCouponExpiration(
    couponId,
    { expiresAt },
    headers
  );

  return response.data;
}

export function getCouponStatusLabel(status) {
  const labels = {
    active: "Activo",
    inactive: "Inactivo",
    expired: "Vencido",
  };

  return labels[status] || "Desconocido";
}

export function isCouponEnabled(coupon) {
  return coupon?.status === "active";
}

export function getCouponErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return "Revisá los datos ingresados.";
  }

  if (error?.message) {
    return error.message;
  }

  return "Ocurrió un error al gestionar el cupón.";
}