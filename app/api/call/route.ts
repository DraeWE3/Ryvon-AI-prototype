import { NextResponse } from 'next/server';
import twilio from 'twilio';

interface CallRequest {
  phoneNumber: string;
  productName: string;
  productDescription?: string;
  pitch: string;
  voiceType: string;
}

export async function POST(req: Request) {
  try {
    const { 
      phoneNumber, 
      productName, 
      productDescription, 
      pitch, 
      voiceType 
    }: CallRequest = await req.json();

    // Validate inputs
    if (!phoneNumber || !productName || !pitch) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      );
    }

    // Validate Twilio credentials
    if (!process.env.TWILIO_ACCOUNT_SID || 
        !process.env.TWILIO_AUTH_TOKEN || 
        !process.env.TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio credentials');
      return NextResponse.json(
        { error: 'Twilio credentials not configured', success: false },
        { status: 500 }
      );
    }

    console.log('Making call to:', phoneNumber);

    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Map voice types to Twilio voices
    const voiceMap: { [key: string]: string } = {
      professional: 'Polly.Matthew',
      friendly: 'Polly.Joanna',
      energetic: 'Polly.Justin',
      calm: 'Polly.Amy',
    };

    // Clean the pitch text
    const cleanPitch = pitch
      .replace(/[<>]/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    // Check if we have a public URL (not localhost)
    const isPublicUrl = !cleanBaseUrl.includes('localhost') && !cleanBaseUrl.includes('127.0.0.1');

    if (isPublicUrl) {
      // Use URL-based TwiML (works with Cloudflare tunnel, ngrok, etc.)
      const params = new URLSearchParams({
        pitch: cleanPitch,
        productName: productName,
        voice: voiceMap[voiceType] || 'Polly.Joanna',
      });

      const twimlUrl = `${cleanBaseUrl}/api/call/twiml?${params.toString()}`;
      
      console.log('Using URL-based TwiML:', twimlUrl);

      const call = await client.calls.create({
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        url: twimlUrl,
        method: 'GET',
        statusCallback: `${cleanBaseUrl}/api/call/status`,
        statusCallbackMethod: 'POST',
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: false,
      });

      console.log('Call initiated:', call.sid);

      return NextResponse.json({
        success: true,
        callId: call.sid,
        status: call.status,
        message: 'Call initiated successfully',
      });

    } else {
      // Use inline TwiML for localhost
      console.log('Using inline TwiML (localhost detected)');

      const escapeXml = (str: string) => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const selectedVoice = voiceMap[voiceType] || 'Polly.Joanna';
      const safePitch = escapeXml(cleanPitch);
      const safeProductName = escapeXml(productName);

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${selectedVoice}">
    Hello! This is a call from ${safeProductName}. How are you doing today?
  </Say>
  <Pause length="1"/>
  <Say voice="${selectedVoice}">
    ${safePitch}
  </Say>
  <Pause length="2"/>
  <Say voice="${selectedVoice}">
    Thank you for your time. Have a great day!
  </Say>
</Response>`;

      const call = await client.calls.create({
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        twiml: twiml,
        record: false,
      });

      console.log('Call initiated:', call.sid);

      return NextResponse.json({
        success: true,
        callId: call.sid,
        status: call.status,
        message: 'Call initiated successfully (inline TwiML)',
      });
    }

  } catch (error: any) {
    console.error('Call API Error:', error);
    
    // More detailed error logging
    if (error.code) {
      console.error('Twilio Error Code:', error.code);
    }
    if (error.moreInfo) {
      console.error('More Info:', error.moreInfo);
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to initiate call',
        success: false,
        details: error.code ? `Twilio Error ${error.code}` : undefined
      },
      { status: 500 }
    );
  }
}

// Get call status
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const callId = searchParams.get('callId');

  if (!callId) {
    return NextResponse.json(
      { error: 'Call ID required' },
      { status: 400 }
    );
  }

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const call = await client.calls(callId).fetch();
    
    return NextResponse.json({
      success: true,
      status: call.status,
      duration: call.duration,
    });
  } catch (error: any) {
    console.error('Get call status error:', error);
    return NextResponse.json(
      { error: 'Failed to get call status', details: error.message },
      { status: 500 }
    );
  }
}