// lib/services/sandbox.ts
import { coopApi } from "../api/coop";
import { paymentApi } from "../api/payment";
import { EnrollRequest } from "../api/types";

export const SandboxService = {
  async enroll(input: EnrollRequest) {
    const payload = {
      cooperative_name: input.name,
      account_number: input.regNo,
      pan_number: input.pan,
      registration_authority: input.authority,
      registration_date: input.regDate,
      cooperative_type: input.type,
      cooperative_code: input.code,
      cooperative_email: input.email,
      email: input.email,
      password: input.password,
    };
    const data = await coopApi.enroll(payload);
    return { data, body: payload }; // Return body for the API Exchange log
  },

  async createWallet(coopId: string, regNo: string, email: string) {
    const payload = {
      cooperative_id: String(coopId),
      account_number: String(regNo),
      email,
    };
    const data = await paymentApi.createWallet(payload);
    return { data, body: payload };
  },

  async transfer(
    sender: string,
    receiver: string,
    amount: number,
    desc: string,
  ) {
    const payload = {
      sender_id: String(sender),
      receiver_id: String(receiver),
      amount,
      description: desc,
    };
    const data = await paymentApi.transfer(payload);
    return { data, body: payload };
  },

  async deposit(coopId: string, regNo: string, amount: number) {
    const payload = {
      cooperative_id: String(coopId),
      account_number: String(regNo),
      amount,
      description: "Sandbox Deposit",
    };
    const data = await paymentApi.load(payload);
    return { data, body: payload };
  },
};
