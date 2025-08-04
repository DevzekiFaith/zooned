import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalApiUrl, PayPalOrderRequest } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    // Check if PayPal is properly configured
    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'PayPal is not configured. Please set PayPal environment variables.' },
        { status: 500 }
      );
    }

    const { amount, currency = 'USD', description, userId, projectId }: PayPalOrderRequest = await req.json();

    // Validate required fields
    if (!amount || amount <= 0 || !userId) {
      return NextResponse.json(
        { error: 'Invalid amount or missing user ID' },
        { status: 400 }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to authenticate with PayPal' },
        { status: 500 }
      );
    }

    // Create PayPal order
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: description || 'Freelance service payment',
          custom_id: `${userId}_${projectId || 'general'}_${Date.now()}`,
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
        brand_name: 'FreelanceHub',
        locale: 'en-US',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    };

    const response = await fetch(`${getPayPalApiUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal order creation failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to create PayPal order' },
        { status: 500 }
      );
    }

    const order = await response.json();

    return NextResponse.json({
      orderID: order.id,
      approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href,
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
