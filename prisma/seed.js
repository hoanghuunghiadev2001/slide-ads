import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "marketing@toyota.binhduong.vn";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const hash = await bcrypt.hash("Marketing@123456", 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
      },
    });
    console.log("Admin created:", user.email);
  } else {
    console.log("Admin already exists:", email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
