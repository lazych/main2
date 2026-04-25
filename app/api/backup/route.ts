import { NextRequest, NextResponse } from 'next/server';
import { checkModeratorAuth } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const auth = await checkModeratorAuth(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    // 2. Trigger SimpleBackups
    const triggerUrl = process.env.SIMPLEBACKUPS_TRIGGER_URL;

    if (!triggerUrl) {
      return NextResponse.json(
        { error: 'SimpleBackups trigger URL not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(triggerUrl, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SimpleBackups trigger failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to trigger backup upstream' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: 'Backup triggered successfully' });
  } catch (error) {
    console.error('Backup trigger error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
