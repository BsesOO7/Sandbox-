import { apiClient } from "../api/client";

export const AuthService = {
  async login(credentials: any) {
    const data: any = await apiClient.post("/auth/login", credentials);

    if (data.status === "success") {
      // THE KEY: Saving to storage
      localStorage.setItem("nifn_token", data.data.access_token);
      localStorage.setItem("nifn_coop_id", String(data.data.cooperative_id));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem("nifn_token");
    localStorage.removeItem("nifn_coop_id");
    // Redirect to login and refresh to clear memory
    window.location.href = "/login";
  },
};
