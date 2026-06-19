// lib/services/portal.service.ts
import { coopApi } from "../api/coop";

export const PortalService = {
  async getDashboardData(coopId: string) {
    const profile = await coopApi.lookup("", ""); // You might need a getById endpoint
    const balance = await coopApi.balance(coopId);

    // Mocking transactions for the UI design
    const transactions = [
      {
        id: 1,
        name: "Member Deposit",
        date: "12 Oct 2023 10:00",
        amount: "+ ₨ 12,000",
        type: "credit",
      },
      {
        id: 2,
        name: "Inter-coop Transfer",
        date: "11 Oct 2023 14:30",
        amount: "- ₨ 4,500",
        type: "debit",
      },
      {
        id: 3,
        name: "Utility Payment",
        date: "10 Oct 2023 09:15",
        amount: "- ₨ 1,200",
        type: "debit",
      },
      {
        id: 4,
        name: "Liquidity Load",
        date: "09 Oct 2023 11:00",
        amount: "+ ₨ 50,000",
        type: "credit",
      },
    ];

    return { profile, balance, transactions };
  },
};
