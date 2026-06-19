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

export interface LoginResponse {
  status: string;
  data: { access_token: string; cooperative_id: number };
}
