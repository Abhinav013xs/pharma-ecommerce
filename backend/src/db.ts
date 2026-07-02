import { PrismaClient } from '@prisma/client';
import { dbInstance } from './mockData.js';

export const prisma = new PrismaClient({
  log: ['error']
});

export let isDbConnected = false;

// Immediately test connection in the background
async function checkDbConnection() {
  try {
    await prisma.$connect();
    // Do a simple test query
    await prisma.user.findFirst();
    isDbConnected = true;
    console.log("🟢 PostgreSQL Database connected successfully via Prisma.");
  } catch (error) {
    isDbConnected = false;
    console.warn("⚠️  PostgreSQL Database offline or not configured. Falling back to In-Memory Mock Database.");
  }
}

checkDbConnection();

/**
 * Executes a database operation with auto-fallback to mock data if the database is offline.
 * @param prismaQuery Function containing PrismaClient calls
 * @param mockQuery Function containing MockDatabase calls
 */
export async function dbOperation<T>(
  prismaQuery: (client: PrismaClient) => Promise<T>,
  mockQuery: () => T | Promise<T>
): Promise<T> {
  if (isDbConnected) {
    try {
      return await prismaQuery(prisma);
    } catch (error) {
      console.error("Prisma query failed, falling back to mock database:", error);
      return await mockQuery();
    }
  } else {
    return await mockQuery();
  }
}
