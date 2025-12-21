import { NextResponse } from 'next/server';
import { db } from '@/backend/db/db';
import { project } from '@/backend/db/tables/project';
import { insertProjectSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';

// Mock user ID for dev until auth is fully hooked up
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function GET() {
    try {
        const allSites = await db.select().from(project).where(eq(project.ownerId, MOCK_USER_ID));
        return NextResponse.json(allSites);
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = insertProjectSchema.parse(body);

        const [newProject] = await db.insert(project).values({
            ...validatedData,
            ownerId: MOCK_USER_ID,
        }).returning();

        return NextResponse.json(newProject);
    } catch (error) {
        console.error('Failed to create project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
