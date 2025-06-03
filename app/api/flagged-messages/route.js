import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import FlaggedMessage from '../../../models/FlaggedMessage';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userIdsParam = searchParams.get('userIds');
    
    if (!userIdsParam) {
      return NextResponse.json(
        { error: 'userIds query parameter is required' },
        { status: 400 }
      );
    }
    
    // Convert string IDs to ObjectIds for proper MongoDB querying
    const userIds = userIdsParam.split(',').map(id => {
      try {
        return new mongoose.Types.ObjectId(id.trim());
      } catch (e) {
        console.error(`Invalid ObjectId: ${id}`, e);
        return null;
      }
    }).filter(id => id !== null);
    
    if (userIds.length === 0) {
      return NextResponse.json({ flaggedMessages: [] });
    }

    const flaggedMessages = await FlaggedMessage.find({
      userId: { $in: userIds }
    }).sort({ createdAt: -1 });

    console.log(`Found ${flaggedMessages.length} flagged messages`);
    return NextResponse.json({ flaggedMessages });
  } catch (error) {
    console.error('Error fetching flagged messages:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}