import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Adm!n@8686$$$", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "it@toyota.binhduong.vn",
      password: hash,
    },
  });
}

main().then(() => prisma.$disconnect());