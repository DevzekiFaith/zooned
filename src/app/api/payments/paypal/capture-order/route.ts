import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalApiUrl } from '@/lib/paypal';
import { db } from '@/firebase';
import { doc, updateDoc, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { orderID, userId } = await req.json();

    // Validate required fields
    if (!orderID || !userId) {
      return NextResponse.json(
        { error: 'Missing order ID or user ID' },
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

    // Capture the PayPal order
    const response = await fetch(`${getPayPalApiUrl()}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal order capture failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to capture PayPal payment' },
        { status: 500 }
      );
    }

    const captureData = await response.json();
    
    // Check if capture was successful
    if (captureData.status === 'COMPLETED') {
      const captureAmount = parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value);
      
      try {
        // Update user's wallet balance
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const currentBalance = userDoc.data().walletBalance || 0;
          await updateDoc(userRef, {
            walletBalance: currentBalance + captureAmount,
            totalEarned: (userDoc.data().totalEarned || 0) + captureAmount,
            lastPaymentDate: serverTimestamp(),
          });
        }

        // Add transaction record
        await addDoc(collection(db, 'transactions'), {
          userId,
          type: 'received',
          amount: captureAmount,
          description: captureData.purchase_units[0].description || 'PayPal payment received',
          status: 'completed',
          paypalOrderId: orderID,
          paypalCaptureId: captureData.purchase_units[0].payments.captures[0].id,
          date: serverTimestamp(),
          paypalData: {
            payerId: captureData.payer?.payer_id,
            payerEmail: captureData.payer?.email_address,
            currency: captureData.purchase_units[0].payments.captures[0].amount.currency_code,
          },
        });

        console.log(`PayPal payment processed successfully for user ${userId}: $${captureAmount}`);

        return NextResponse.json({
          success: true,
          captureID: captureData.purchase_units[0].payments.captures[0].id,
          amount: captureAmount,
          status: 'COMPLETED',
        });

      } catch (error) {
        console.error('Error updating wallet after PayPal payment:', error);
        return NextResponse.json(
          { error: 'Payment captured but failed to update wallet' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'PayPal payment was not completed successfully' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json(
      { error: 'Failed to capture PayPal payment' },
      { status: 500 }
    );
  }
}
