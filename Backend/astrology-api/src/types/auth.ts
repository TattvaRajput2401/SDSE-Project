export interface AuthPayload {
  _id: string;
  email: string;
  role: "user" | "admin";
}
