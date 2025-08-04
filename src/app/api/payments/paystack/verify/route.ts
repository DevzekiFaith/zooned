import { NextRequest, NextResponse } from 'next/server';
import { getPaystackApiUrl, getPaystackHeaders, convertFromKobo } from '@/lib/paystack';
import { db } from '@/firebase';
import { doc, updateDoc, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { reference, userId } = await req.json();

    // Validate required fields
    if (!reference || !userId) {
      return NextResponse.json(
        { error: 'Missing transaction reference or user ID' },
        { status: 400 }
      );
    }

    // Verify transaction with Paystack
    const response = await fetch(`${getPaystackApiUrl()}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: getPaystackHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Paystack transaction verification failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to verify Paystack transaction' },
        { status: 500 }
      );
    }

    const verificationData = await response.json();

    if (verificationData.status && verificationData.data.status === 'success') {
      const transaction = verificationData.data;
      const amount = convertFromKobo(transaction.amount, transaction.currency);
      
      try {
        // Update user's wallet balance
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const currentBalance = userDoc.data().walletBalance || 0;
          await updateDoc(userRef, {
            walletBalance: currentBalance + amount,
            totalEarned: (userDoc.data().totalEarned || 0) + amount,
            lastPaymentDate: serverTimestamp(),
          });
        }

        // Add transaction record
        await addDoc(collection(db, 'transactions'), {
          userId,
          type: 'received',
          amount,
          description: transaction.metadata?.description || 'Paystack payment received',
          status: 'completed',
          paystackReference: transaction.reference,
          paystackTransactionId: transaction.id,
          date: serverTimestamp(),
          paystackData: {
            gateway_response: transaction.gateway_response,
            channel: transaction.channel,
            currency: transaction.currency,
            customer: {
              email: transaction.customer.email,
              customer_code: transaction.customer.customer_code,
            },
            authorization: {
              authorization_code: transaction.authorization?.authorization_code,
              card_type: transaction.authorization?.card_type,
              last4: transaction.authorization?.last4,
              bank: transaction.authorization?.bank,
            },
          },
        });

        console.log(`Paystack payment processed successfully for user ${userId}: ${transaction.currency} ${amount}`);

        return NextResponse.json({
          status: true,
          message: 'Payment verified and wallet updated successfully',
          data: {
            amount,
            currency: transaction.currency,
            reference: transaction.reference,
            channel: transaction.channel,
            gateway_response: transaction.gateway_response,
          },
        });

      } catch (error) {
        console.error('Error updating wallet after Paystack payment:', error);
        return NextResponse.json(
          { error: 'Payment verified but failed to update wallet' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { 
          error: 'Transaction verification failed', 
          message: verificationData.message,
          status: verificationData.data?.status 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error verifying Paystack transaction:', error);
    return NextResponse.json(
      { error: 'Failed to verify Paystack transaction' },
      { status: 500 }
    );
  }
}
