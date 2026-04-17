import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@nead.com" },
    update: {},
    create: { nome: "Administrador", email: "admin@nead.com", password: hash, role: "admin" },
  });
  console.log("Seed concluído — admin@nead.com / admin123");
}

main().finally(() => prisma.$disconnect());
