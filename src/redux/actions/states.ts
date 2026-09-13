import { AuthTokenInterface } from "@/hooks/interfaces";

export const authenticationstate: {
  auth: boolean | null;
  user: AuthTokenInterface;
} = {
  auth: null,
  user: {
    id: "",
    username: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    birthdate: "",
    gender: "",
    date_created: "",
    email: "",
    profile: "",
    token: null,
    is_active: false,
    is_verified: false,
  },
};
