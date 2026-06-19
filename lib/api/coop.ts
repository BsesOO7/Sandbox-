import { request } from "./client";

export const coopApi = {
  enroll: (body: any) =>
    request("/cooperative/enroll", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  list: () => request<any>("/cooperative/all"),
  lookup: (name: string, acc: string) =>
    request(
      `/cooperative/lookup?name=${encodeURIComponent(name)}&account_number=${acc}`,
    ),
  balance: (id: string) => request<any>(`/cooperative/balance_inquiry/${id}`),
};
