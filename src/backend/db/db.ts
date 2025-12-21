import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/backend/db/tables/schema';

const connectionString = process.env.DATABASE_URL as string;

// Configuration optimisée pour Supabase Transaction Mode
// max: 1 permet d'éviter "max clients reached" en dev avec hot-reloading
export const client = postgres(connectionString, { 
    prepare: false,
    max: process.env.NODE_ENV === 'production' ? 10 : 1 // Limite à 1 connection en dev pour éviter le spam
});

export const db = drizzle(client, { schema });
