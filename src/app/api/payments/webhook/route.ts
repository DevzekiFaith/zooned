import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/firebase';
import { doc, updateDoc, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  // Check if Stripe is properly configured
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
      { status: 500 }
    );
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as any);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as any);
        break;
      case 'transfer.created':
        await handleTransferCreated(event.data.object as any);
        break;
      case 'transfer.updated':
        // Handle transfer status updates (including completion)
        await handleTransferUpdated(event.data.object as any);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const { metadata } = paymentIntent;
  const userId = metadata.userId;
  const amount = paymentIntent.amount / 100; // Convert from cents

  if (!userId) {
    console.error('No userId in payment intent metadata');
    return;
  }

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
      description: metadata.description || 'Payment received',
      status: 'completed',
      paymentIntentId: paymentIntent.id,
      projectId: metadata.projectId || null,
      date: serverTimestamp(),
      stripeData: {
        paymentMethodId: paymentIntent.payment_method,
        currency: paymentIntent.currency,
      },
    });

    console.log(`Payment processed successfully for user ${userId}: $${amount}`);
  } catch (error) {
    console.error('Error updating wallet after payment:', error);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  const { metadata } = paymentIntent;
  const userId = metadata.userId;

  if (!userId) return;

  try {
    // Add failed transaction record
    await addDoc(collection(db, 'transactions'), {
      userId,
      type: 'received',
      amount: paymentIntent.amount / 100,
      description: metadata.description || 'Payment failed',
      status: 'failed',
      paymentIntentId: paymentIntent.id,
      projectId: metadata.projectId || null,
      date: serverTimestamp(),
      failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
    });

    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error('Error recording failed payment:', error);
  }
}

async function handleTransferCreated(transfer: any) {
  // Handle withdrawal transfer creation
  console.log('Transfer created:', transfer.id);
}

async function handleTransferUpdated(transfer: any) {
  // Handle transfer status updates (including completion)
  const { metadata, status } = transfer;
  const userId = metadata?.userId;

  if (!userId) return;

  try {
    // Only handle completed transfers
    if (status === 'paid' || status === 'in_transit') {
      // Update transaction status to completed
      await addDoc(collection(db, 'transactions'), {
        userId,
        type: 'sent',
        amount: transfer.amount / 100,
        description: status === 'paid' ? 'Withdrawal completed' : 'Withdrawal in transit',
        status: status === 'paid' ? 'completed' : 'pending',
        transferId: transfer.id,
        date: serverTimestamp(),
      });

      console.log(`Withdrawal ${status} for user ${userId}: $${transfer.amount / 100}`);
    }
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
  }
}
