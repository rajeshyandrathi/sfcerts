
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserDownloads } from '@/lib/downloads';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const downloads = await getUserDownloads(user.id);
    return NextResponse.json(downloads);
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch downloads' },
      { status: 500 }
    );
  }
}
