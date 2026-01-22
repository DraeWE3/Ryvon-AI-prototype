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

    // Validate environment variables
    if (!process.env.VAPI_PRIVATE_KEY) {
      console.error('VAPI_PRIVATE_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'API configuration error - Private key missing' },
        { status: 500 }
      );
    }

    if (!process.env.VAPI_PHONE_NUMBER_ID) {
      console.error('VAPI_PHONE_NUMBER_ID is not configured');
      return NextResponse.json(
        { success: false, error: 'Phone number configuration error' },
        { status: 500 }
      );
    }

    console.log('Initiating call with:', {
      phoneNumber,
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      assistantId: assistantId || process.env.VAPI_ASSISTANT_ID,
    });

    // Make request to VAPI to initiate call using PRIVATE key (for server-side calls)
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`, // PRIVATE key for server-side phone calls
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

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      console.error('VAPI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.message || errorText || `Failed to initiate call: ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('VAPI call initiated successfully:', {
      callId: data.id,
      status: data.status,
      phoneNumber: phoneNumber
    });

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

    // Validate environment variable
    if (!process.env.VAPI_PRIVATE_KEY) {
      console.error('VAPI_PRIVATE_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'API configuration error - Private key missing' },
        { status: 500 }
      );
    }

    // Fetch call status from VAPI using PRIVATE key
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`, // PRIVATE key
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      console.error('VAPI Status Check Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.message || 'Failed to fetch call status' 
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
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}