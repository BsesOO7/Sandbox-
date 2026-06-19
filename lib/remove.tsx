// lib/sandbox-service.ts
import { ASSET_CODE, ASSET_SCALE } from "./types";

export const BASE_URL = "http://localhost:8001/api/v1";

export interface EnrollRequest {
  name: string;
  pan: string;
  regNo: string;
  authority: string;
  regDate: string;
  type: string;
  code: string;
  email: string;
  password: string;
}

export const SandboxService = {
  async enroll(input: EnrollRequest) {
    const body = {
      cooperative_name: input.name,
      registration_number: input.regNo,
      pan_number: input.pan,
      registration_authority: input.authority,
      registration_date: input.regDate,
      cooperative_type: input.type,
      cooperative_code: input.code,
      cooperative_email: input.email,
      email: input.email,
      password: input.password,
    };

    const res = await fetch(`${BASE_URL}/cooperative/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok)
      throw new Error(
        data.detail?.[0]?.msg || data.error || "Enrollment failed",
      );
    return { data, body, status: res.status };
  },

  async getBalance(coopId: string) {
    const res = await fetch(
      `${BASE_URL}/cooperative/balance_inquiry/${coopId}`,
    );
    const data = await res.json();
    if (!res.ok) throw new Error("Balance inquiry failed");
    return data;
  },

  async deposit(
    coopId: string | number,
    regNo: string,
    amount: number,
    description: string,
  ) {
    const body = {
      cooperative_id: String(coopId),
      account_number: String(regNo), // Using registration number as account number
      amount: Number(amount),
      description: description,
    };

    const res = await fetch(`${BASE_URL}/wallet/load`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Deposit failed");
    return { data, body, status: res.status };
  },

  async lookupCooperative(name: string, regNo: string) {
    const params = new URLSearchParams({ name, account_number: regNo });
    const res = await fetch(
      `${BASE_URL}/cooperative/lookup?${params.toString()}`,
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cooperative lookup failed");
    return data;
  },

  async listCooperatives() {
    // Ensure this matches the endpoint that returns all coops
    const res = await fetch(`${BASE_URL}/cooperative/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch cooperative list");

    // Return data.data if that's where the list is, else return the array
    return data.data || (Array.isArray(data) ? data : []);
  },

  async createWallet(coopId: string | number, regNo: string, email: string) {
    const body = {
      cooperative_id: String(coopId),
      account_number: String(regNo),
      email: email,
    };

    const res = await fetch(`${BASE_URL}/wallet/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Wallet creation failed");

    return { data, body, status: res.status };
  },

  async getBalanceInquiry(coopId: string | number) {
    const res = await fetch(
      `${BASE_URL}/cooperative/balance_inquiry/${String(coopId)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!res.ok) throw new Error("Balance inquiry failed");
    return await res.json();
  },

  async transfer(
    senderId: string,
    receiverId: string,
    amount: number,
    description: string,
  ) {
    const body = {
      sender_id: String(senderId),
      receiver_id: String(receiverId),
      amount: Number(amount),
      description: description, // Matches your middleware requirements
    };

    const res = await fetch(`${BASE_URL}/payment/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Transfer failed");
    return { data, body, status: res.status };
  },
};
