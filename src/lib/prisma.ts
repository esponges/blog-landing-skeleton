import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({
  datasourceUrl: import.meta.env.DATABASE_URL,
})

export default prisma;
