/**
 * Seed: one OWNER admin + several STUDENT accounts.
 * Passwords come from env (never hardcode production secrets).
 *
 *   SEED_ADMIN_PASSWORD   (default: ChangeMeAdmin!23)
 *   SEED_STUDENT_PASSWORD (default: ChangeMeStudent!23)
 */
import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const ARGON2_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTS);
}

async function upsertUser(input: {
  username: string;
  email: string;
  phone: string | null;
  displayName: string;
  role: UserRole;
  password: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}) {
  const usernameNormalized = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);

  return prisma.user.upsert({
    where: { usernameNormalized },
    create: {
      username: input.username.trim(),
      usernameNormalized,
      email,
      phone: input.phone,
      displayName: input.displayName,
      role: input.role,
      passwordHash,
      emailVerifiedAt: input.emailVerified ? new Date() : null,
      phoneVerifiedAt: input.phoneVerified ? new Date() : null,
    },
    update: {
      email,
      phone: input.phone,
      displayName: input.displayName,
      role: input.role,
      passwordHash,
      emailVerifiedAt: input.emailVerified ? new Date() : null,
      phoneVerifiedAt: input.phoneVerified ? new Date() : null,
    },
  });
}

async function main() {
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeAdmin!23";
  const studentPassword =
    process.env.SEED_STUDENT_PASSWORD ?? "ChangeMeStudent!23";

  const admin = await upsertUser({
    username: "admin",
    email: "admin@zharfa.local",
    phone: "09120000000",
    displayName: "مدیر ژرفا",
    role: UserRole.OWNER,
    password: adminPassword,
    emailVerified: true,
    phoneVerified: true,
  });

  const students = [
    {
      username: "sara",
      email: "sara@example.com",
      phone: "09121111111",
      displayName: "سارا محمدی",
    },
    {
      username: "reza",
      email: "reza@example.com",
      phone: "09122222222",
      displayName: "رضا احمدی",
    },
    {
      username: "niloofar",
      email: "niloofar@example.com",
      phone: "09123333333",
      displayName: "نیلوفر رضایی",
    },
    {
      username: "amir",
      email: "amir@example.com",
      phone: null,
      displayName: "امیر حسینی",
    },
  ];

  const createdStudents = [];
  for (const s of students) {
    createdStudents.push(
      await upsertUser({
        ...s,
        role: UserRole.STUDENT,
        password: studentPassword,
        emailVerified: true,
        phoneVerified: Boolean(s.phone),
      }),
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        admin: { id: admin.id, username: admin.username, email: admin.email },
        students: createdStudents.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
        })),
        note: "Passwords from SEED_ADMIN_PASSWORD / SEED_STUDENT_PASSWORD (see README)",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
