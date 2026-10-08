/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs");
const path = require("node:path");
const prisma = new PrismaClient();
async function main() {
  const destination = path.resolve("prisma/dev-before-notifications-2026-10-08.db");
  if (!destination.startsWith(path.resolve("prisma") + path.sep)) throw new Error("Invalid backup destination");
  if (fs.existsSync(destination)) throw new Error("Backup already exists; refusing to overwrite.");
  // SQLite makes a consistent backup, including committed WAL contents.
  await prisma.$executeRawUnsafe("VACUUM INTO '" + destination.replaceAll("'", "''") + "'");
  console.log("Backup created:", destination);
  for (const table of ["User", "Clinic", "Patient", "MedicalReport", "XRayImage"]) {
    const [row] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM "${table}"`);
    console.log(table, String(row.count));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
