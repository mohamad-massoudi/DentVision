/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: Role.SUPER_ADMIN },
  });

  if (existingSuperAdmin) {
    console.log("Super Admin already exists; seed skipped.");
    return;
  }

  await prisma.user.create({
    data: {
      username: "mohamadm",
      password: await bcrypt.hash("mass", 10),
      name: "مدیر کل سیستم",
      role: Role.SUPER_ADMIN,
    },
  });

  console.log("Super Admin created: mohamadm");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
