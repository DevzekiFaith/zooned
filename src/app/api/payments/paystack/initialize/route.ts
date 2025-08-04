import { NextRequest, NextResponse } from 'next/server';
import { getPaystackApiUrl, getPaystackHeaders, convertToKobo, generateReference, PaystackTransactionRequest } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    // Check if Paystack is properly configured
    if (!process.env.PAYSTACK_SECRET_KEY || !process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      return NextResponse.json(
        { error: 'Paystack is not configured. Please set Paystack environment variables.' },
        { status: 500 }
      );
    }

    const { amount, currency = 'NGN', email, userId, projectId, description }: PaystackTransactionRequest & { userId: string } = await req.json();

    // Validate required fields
    if (!amount || amount <= 0 || !email || !userId) {
      return NextResponse.json(
        { error: 'Invalid amount, email, or missing user ID' },
        { status: 400 }
      );
    }

    // Convert amount to kobo (smallest currency unit)
    const amountInKobo = convertToKobo(amount, currency);
    const reference = generateReference('freelancehub');

    // Initialize Paystack transaction
    const transactionData = {
      amount: amountInKobo,
      currency,
      email,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      metadata: {
        userId,
        projectId: projectId || null,
        description: description || 'Freelance service payment',
        custom_fields: [
          {
            display_name: 'User ID',
            variable_name: 'user_id',
            value: userId,
          },
        ],
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    };

    const response = await fetch(`${getPaystackApiUrl()}/transaction/initialize`, {
      method: 'POST',
      headers: getPaystackHeaders(),
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Paystack transaction initialization failed:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to initialize Paystack transaction' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.status) {
      return NextResponse.json({
        status: true,
        message: 'Transaction initialized successfully',
        data: {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference,
        },
      });
    } else {
      return NextResponse.json(
        { error: data.message || 'Failed to initialize transaction' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error initializing Paystack transaction:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Paystack transaction' },
      { status: 500 }
    );
  }
}
