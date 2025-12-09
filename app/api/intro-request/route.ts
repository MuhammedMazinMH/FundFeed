import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time Firebase initialization
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Lazy import to avoid build-time initialization
  const { createIntroRequest, hasIntroRequest } = await import('@/lib/firestore');
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    // For client-side requests, we'll check if user is authenticated via cookie/session
    // In a real app, you'd verify the Firebase ID token here
    const body = await request.json();
    const { roundId, startupName, userId } = body;

    // Validate required fields
    if (!roundId || !startupName) {
      return NextResponse.json(
        { error: 'Missing required fields: roundId and startupName' },
        { status: 400 }
      );
    }

    // Check if user ID is provided (should come from authenticated session)
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check for existing request (idempotency)
    const existingRequest = await hasIntroRequest(userId, roundId);
    if (existingRequest) {
      return NextResponse.json(
        { message: 'Intro already requested', alreadyRequested: true },
        { status: 200 }
      );
    }

    // Create the intro request
    const requestId = await createIntroRequest({
      investorId: userId,
      roundId,
      startupName,
    });

    return NextResponse.json(
      { message: 'Intro request created successfully', requestId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating intro request:', error);
    return NextResponse.json(
      { error: 'Failed to create intro request' },
      { status: 500 }
    );
  }
}
