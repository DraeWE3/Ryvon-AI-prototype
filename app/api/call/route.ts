import { NextRequest, NextResponse } from 'next/server';

// POST endpoint - Initiate call
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, assistantId } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Make request to VAPI to initiate call
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: {
          number: phoneNumber,
        },
        assistantId: assistantId || process.env.VAPI_ASSISTANT_ID,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('VAPI API Error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.message || 'Failed to initiate call' 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('VAPI call initiated successfully:', data);

    return NextResponse.json({
      success: true,
      callId: data.id,
      status: data.status,
    });

  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint - Check call status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');

    if (!callId) {
      return NextResponse.json(
        { success: false, error: 'Call ID is required' },
        { status: 400 }
      );
    }

    // Fetch call status from VAPI
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('VAPI Status Check Error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch call status' 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      status: data.status,
      callId: data.id,
      duration: data.duration,
      endedReason: data.endedReason,
    });

  } catch (error) {
    console.error('Error checking call status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}