import { NextRequest, NextResponse } from 'next/server';
import { getPaystackApiUrl, getPaystackHeaders, convertToKobo, generateReference } from '@/lib/paystack';
import { db } from '@/firebase';
import { doc, updateDoc, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'NGN', userId, bankCode, accountNumber, accountName, reason } = await req.json();

    // Validate required fields
    if (!amount || amount <= 0 || !userId || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, userId, bankCode, accountNumber, or accountName' },
        { status: 400 }
      );
    }

    // Check user's wallet balance
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentBalance = userDoc.data().walletBalance || 0;
    if (currentBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    // Step 1: Create transfer recipient
    const recipientData = {
      type: 'nuban',
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency,
      metadata: {
        userId,
        description: reason || 'Freelance earnings withdrawal',
      },
    };

    const recipientResponse = await fetch(`${getPaystackApiUrl()}/transferrecipient`, {
      method: 'POST',
      headers: getPaystackHeaders(),
      body: JSON.stringify(recipientData),
    });

    if (!recipientResponse.ok) {
      const errorData = await recipientResponse.json();
      console.error('Failed to create transfer recipient:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to create transfer recipient' },
        { status: 500 }
      );
    }

    const recipientResult = await recipientResponse.json();
    
    if (!recipientResult.status) {
      return NextResponse.json(
        { error: recipientResult.message || 'Failed to create transfer recipient' },
        { status: 400 }
      );
    }

    const recipientCode = recipientResult.data.recipient_code;

    // Step 2: Initiate transfer
    const amountInKobo = convertToKobo(amount, currency);
    const reference = generateReference('withdrawal');

    const transferData = {
      source: 'balance',
      amount: amountInKobo,
      recipient: recipientCode,
      reason: reason || 'Freelance earnings withdrawal',
      currency,
      reference,
    };

    const transferResponse = await fetch(`${getPaystackApiUrl()}/transfer`, {
      method: 'POST',
      headers: getPaystackHeaders(),
      body: JSON.stringify(transferData),
    });

    if (!transferResponse.ok) {
      const errorData = await transferResponse.json();
      console.error('Failed to initiate transfer:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to initiate transfer' },
        { status: 500 }
      );
    }

    const transferResult = await transferResponse.json();

    if (transferResult.status) {
      try {
        // Update user's wallet balance
        await updateDoc(userRef, {
          walletBalance: currentBalance - amount,
          totalWithdrawn: (userDoc.data().totalWithdrawn || 0) + amount,
          lastWithdrawalDate: serverTimestamp(),
        });

        // Add transaction record
        await addDoc(collection(db, 'transactions'), {
          userId,
          type: 'withdrawn',
          amount,
          description: reason || 'Withdrawal to bank account',
          status: transferResult.data.status || 'pending',
          paystackReference: reference,
          paystackTransferId: transferResult.data.id,
          paystackTransferCode: transferResult.data.transfer_code,
          date: serverTimestamp(),
          bankDetails: {
            accountName,
            accountNumber,
            bankCode,
            recipientCode,
          },
          paystackData: transferResult.data,
        });

        console.log(`Paystack withdrawal initiated for user ${userId}: ${currency} ${amount}`);

        return NextResponse.json({
          status: true,
          message: 'Withdrawal initiated successfully',
          data: {
            amount,
            currency,
            reference,
            transferCode: transferResult.data.transfer_code,
            status: transferResult.data.status,
            recipientCode,
          },
        });

      } catch (error) {
        console.error('Error updating wallet after withdrawal:', error);
        return NextResponse.json(
          { error: 'Transfer initiated but failed to update wallet' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: transferResult.message || 'Failed to initiate transfer' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing Paystack withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
