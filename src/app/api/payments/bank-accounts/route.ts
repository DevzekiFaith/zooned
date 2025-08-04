import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { BankAccount } from '@/lib/stripe';

// GET - Fetch user's bank accounts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const bankAccountsQuery = query(
      collection(db, 'bankAccounts'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(bankAccountsQuery);
    const bankAccounts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ bankAccounts });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank accounts' },
      { status: 500 }
    );
  }
}

// POST - Add new bank account
export async function POST(req: NextRequest) {
  try {
    const bankAccountData = await req.json();
    
    const {
      userId,
      accountHolderName,
      accountNumber,
      routingNumber,
      bankName,
      accountType,
      country = 'US'
    } = bankAccountData;

    // Validate required fields
    if (!userId || !accountHolderName || !accountNumber || !routingNumber || !bankName) {
      return NextResponse.json(
        { error: 'Missing required bank account information' },
        { status: 400 }
      );
    }

    // Basic validation for US bank accounts
    if (country === 'US') {
      if (routingNumber.length !== 9) {
        return NextResponse.json(
          { error: 'Invalid routing number' },
          { status: 400 }
        );
      }
      
      if (accountNumber.length < 4 || accountNumber.length > 17) {
        return NextResponse.json(
          { error: 'Invalid account number' },
          { status: 400 }
        );
      }
    }

    // Check if this is the first bank account (make it default)
    const existingAccountsQuery = query(
      collection(db, 'bankAccounts'),
      where('userId', '==', userId)
    );
    const existingAccounts = await getDocs(existingAccountsQuery);
    const isFirstAccount = existingAccounts.empty;

    // Create new bank account
    const newBankAccount = {
      userId,
      accountHolderName,
      accountNumber: accountNumber.slice(-4), // Store only last 4 digits for security
      accountNumberFull: accountNumber, // This should be encrypted in production
      routingNumber,
      bankName,
      accountType: accountType || 'checking',
      isDefault: isFirstAccount,
      isVerified: false, // Will be verified through micro-deposits or other means
      country,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'bankAccounts'), newBankAccount);

    return NextResponse.json({
      success: true,
      bankAccountId: docRef.id,
      message: 'Bank account added successfully',
    });

  } catch (error) {
    console.error('Error adding bank account:', error);
    return NextResponse.json(
      { error: 'Failed to add bank account' },
      { status: 500 }
    );
  }
}

// PUT - Update bank account
export async function PUT(req: NextRequest) {
  try {
    const { bankAccountId, ...updateData } = await req.json();

    if (!bankAccountId) {
      return NextResponse.json(
        { error: 'Bank account ID is required' },
        { status: 400 }
      );
    }

    const bankAccountRef = doc(db, 'bankAccounts', bankAccountId);
    await updateDoc(bankAccountRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Bank account updated successfully',
    });

  } catch (error) {
    console.error('Error updating bank account:', error);
    return NextResponse.json(
      { error: 'Failed to update bank account' },
      { status: 500 }
    );
  }
}

// DELETE - Remove bank account
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bankAccountId = searchParams.get('bankAccountId');

    if (!bankAccountId) {
      return NextResponse.json(
        { error: 'Bank account ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, 'bankAccounts', bankAccountId));

    return NextResponse.json({
      success: true,
      message: 'Bank account removed successfully',
    });

  } catch (error) {
    console.error('Error removing bank account:', error);
    return NextResponse.json(
      { error: 'Failed to remove bank account' },
      { status: 500 }
    );
  }
}
