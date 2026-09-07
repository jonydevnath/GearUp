import { Role } from "../../../generated/prisma/enums";

export interface RegisterUserPayload {
  fullName: string;
  email: string;
  password: string;
  role?: Extract<Role, 'CUSTOMER' | 'PROVIDER'>;
  phone: string;
}

export interface IloginUser {
  email: string;
  password: string;
}
