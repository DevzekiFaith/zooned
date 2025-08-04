import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/firebase';
import { doc, updateDoc, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, bankAccountId, description } = await req.json();

    // Validate required fields
    if (!userId || !amount || !bankAccountId || amount <= 0) {
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

    // Get bank account details
    const bankAccountRef = doc(db, 'bankAccounts', bankAccountId);
    const bankAccountDoc = await getDoc(bankAccountRef);
    
    if (!bankAccountDoc.exists()) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    const bankAccount = bankAccountDoc.data();

    // Create Stripe external account if not exists
    let stripeAccountId = bankAccount.stripeAccountId;
    
    if (!stripeAccountId) {
      // Create external account in Stripe
      const externalAccount = await stripe.accounts.createExternalAccount(
        'acct_connected_account_id', // This should be your connected account ID
        {
          external_account: {
            object: 'bank_account',
            country: bankAccount.country || 'US',
            currency: 'usd',
            account_holder_name: bankAccount.accountHolderName,
            account_holder_type: 'individual',
            routing_number: bankAccount.routingNumber,
            account_number: bankAccount.accountNumber,
          },
        }
      );

      stripeAccountId = externalAccount.id;
      
      // Update bank account with Stripe ID
      await updateDoc(bankAccountRef, {
        stripeAccountId,
        updatedAt: serverTimestamp(),
      });
    }

    // Create transfer to bank account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: stripeAccountId,
      metadata: {
        userId,
        bankAccountId,
        description: description || 'Withdrawal',
        timestamp: new Date().toISOString(),
      },
    });

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
      description: description || 'Withdrawal',
      status: 'pending',
      transferId: transfer.id,
      bankAccountId,
      date: serverTimestamp(),
      stripeData: {
        transferId: transfer.id,
        destination: stripeAccountId,
      },
    });

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      transactionId: transactionRef.id,
      message: 'Withdrawal initiated successfully',
    });

  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
