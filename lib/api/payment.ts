// lib/api/payment.ts
import { request } from "./client";

export const paymentApi = {
  createWallet: (body: any) =>
    request("/wallet/create", { method: "POST", body: JSON.stringify(body) }),
  load: (body: any) =>
    request("/wallet/load", { method: "POST", body: JSON.stringify(body) }),
  transfer: (body: any) =>
    request("/payment/transfer", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
