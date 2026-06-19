// lib/api/portal.ts
import { apiClient } from "./client";

export const PortalService = {
  getProfile: (id: string) => apiClient.get(`/cooperative/${id}`),

  getBalance: (id: string) =>
    apiClient.get<{ balance: string; currency: string }>(
      `/cooperative/balance_inquiry/${id}`,
    ),

  getTransactionHistory: (id: string) =>
    apiClient.get<any>(`/payment/history/${id}`),

  loadFunds: (payload: {
    cooperative_id: string;
    account_number: string;
    amount: number;
    description: string;
  }) => apiClient.post("/wallet/load", payload),

  lookupCooperative: (name: string, accountNumber: string) =>
    apiClient.get<any>(
      `/cooperative/lookup?name=${encodeURIComponent(name)}&account_number=${accountNumber}`,
    ),

  // Execute the transfer
  transferFunds: (payload: {
    sender_id: string;
    receiver_id: string;
    amount: number;
    description: string;
  }) => apiClient.post("/payment/transfer", payload),
};
