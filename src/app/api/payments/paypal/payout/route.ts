import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalApiUrl, PayPalPayoutRequest } from '@/lib/paypal';
import { db } from '@/firebase';
import { doc, updateDoc, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, recipientEmail, description }: PayPalPayoutRequest = await req.json();

    // Validate required fields
    if (!userId || !amount || !recipientEmail || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields or invalid amount' },
        { status: 400 }
      );
    }

    // Get user's current balance
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const currentBalance = userData.walletBalance || 0;

    // Check if user has sufficient balance
    if (currentBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
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

    // Create PayPal payout
    const payoutData = {
      sender_batch_header: {
        sender_batch_id: `payout_${userId}_${Date.now()}`,
        email_subject: 'FreelanceHub Withdrawal',
        email_message: 'You have received a payment from FreelanceHub!',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency: 'USD',
          },
          receiver: recipientEmail,
          note: description || 'Withdrawal from FreelanceHub wallet',
          sender_item_id: `item_${userId}_${Date.now()}`,
        },
      ],
    };

    const response = await fetch(`${getPayPalApiUrl()}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payoutData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal payout failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to create PayPal payout' },
        { status: 500 }
      );
    }

    const payoutResult = await response.json();

    // Update user's wallet balance (deduct the amount)
    await updateDoc(userRef, {
      walletBalance: currentBalance - amount,
      lastWithdrawalDate: serverTimestamp(),
    });

    // Add pending transaction record
    const transactionRef = await addDoc(collection(db, 'transactions'), {
      userId,
      type: 'sent',
      amount,
      description: description || 'PayPal withdrawal',
      status: 'pending',
      paypalPayoutBatchId: payoutResult.batch_header.payout_batch_id,
      paypalPayoutItemId: payoutResult.items[0].payout_item_id,
      recipientEmail,
      date: serverTimestamp(),
      paypalData: {
        batchStatus: payoutResult.batch_header.batch_status,
        payoutItemStatus: payoutResult.items[0].transaction_status,
      },
    });

    return NextResponse.json({
      success: true,
      payoutBatchId: payoutResult.batch_header.payout_batch_id,
      payoutItemId: payoutResult.items[0].payout_item_id,
      transactionId: transactionRef.id,
      message: 'Withdrawal initiated successfully',
      status: payoutResult.batch_header.batch_status,
    });

  } catch (error) {
    console.error('Error processing PayPal payout:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
