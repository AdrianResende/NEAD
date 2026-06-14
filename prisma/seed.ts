import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@nead.com" },
    update: {
      nome: "Administrador",
      password: hash,
      role: "admin",
      ativo: true,
      mustChangePassword: true,
    },
    create: {
      nome: "Administrador",
      email: "admin@nead.com",
      password: hash,
      role: "admin",
      ativo: true,
      mustChangePassword: true,
    },
  });
  console.log("Seed concluído — admin@nead.com / admin123");
}

main().finally(() => prisma.$disconnect());
