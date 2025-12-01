import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.LOCAL_DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
