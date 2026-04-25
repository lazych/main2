import { NextRequest, NextResponse } from 'next/server';
import { createLicenseKey } from '@/lib/license';
import { checkModeratorAuth } from '@/lib/api-auth';

export const runtime = 'nodejs';

// POST /api/license/generate
export async function POST(request: NextRequest) {
  try {
    // Check for moderator authentication
    const auth = await checkModeratorAuth(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await request.json();

    const {
      prefix,
      expiresInDays,
      maxUses,
      metadata,
    } = body;

    const license = await createLicenseKey({
      prefix,
      expiresInDays,
      maxUses,
      metadata,
    });

    return NextResponse.json({
      success: true,
      license: {
        key: license.key,
        expiresAt: license.expiresAt,
        maxUses: license.maxUses,
        createdAt: license.createdAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating license key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate license key' },
      { status: 500 }
    );
  }
}
