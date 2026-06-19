// lib/api/auth.ts
import { apiClient } from "./client";

export interface LoginResponse {
  status: string;
  data: {
    access_token: string;
    cooperative_id: number;
  };
}

export const AuthService = {
  login: (credentials: any) =>
    apiClient.post<LoginResponse>("/auth/login", credentials),

  logout: () => {
    localStorage.removeItem("nifn_token");
    localStorage.removeItem("nifn_coop_id");
    window.location.href = "/login";
  },
};
