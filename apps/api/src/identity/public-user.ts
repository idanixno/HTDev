import type { User } from "@zharfa/database";

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  displayName: string;
  role: User["role"];
  emailVerified: boolean;
  phoneVerified: boolean;
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    displayName: user.displayName,
    role: user.role,
    emailVerified: Boolean(user.emailVerifiedAt),
    phoneVerified: Boolean(user.phoneVerifiedAt),
  };
}
