import { NextResponse } from 'next/server';
import { db } from '@/backend/db/db';
import { keywords } from '@/backend/db/tables/keywords';
import { insertKeywordSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const siteId = searchParams.get('siteId');

        if (!siteId) {
            return NextResponse.json({ error: 'Site ID required' }, { status: 400 });
        }

        const allKeywords = await db.select().from(keywords).where(eq(keywords.projectId, siteId));
        return NextResponse.json(allKeywords);
    } catch (error) {
        console.error('Failed to fetch keywords:', error);
        return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = insertKeywordSchema.parse(body);

        const [newKeyword] = await db.insert(keywords).values(validatedData).returning();

        return NextResponse.json(newKeyword);
    } catch (error) {
        console.error('Failed to create keyword:', error);
        return NextResponse.json({ error: 'Failed to create keyword' }, { status: 500 });
    }
}
