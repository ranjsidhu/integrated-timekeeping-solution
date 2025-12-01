import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connString =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : process.env.LOCAL_DATABASE_URL;

const adapter = new PrismaPg({
  connectionString: connString,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
