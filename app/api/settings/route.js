import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Setting from '@/models/Setting';
import { verifyAuth } from '@/lib/auth';

const defaultSettings = (userId) => ({
  userId,
  allowCopyPaste: true,
  copyPasteLectureOverride: false,
  notifications: {
    email: false,
    flaggedContent: false,
    weeklySummaries: false,
    aiUsageLimits: false,
    contentEdits: false
  },
  exportFilters: {
    dateRange: 'all',
    course: ''
  }
});

// GET settings for the authenticated user
export async function GET(request) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let settings = await Setting.findOne({ userId: user.userId });
    if (!settings) {
      settings = await Setting.create(defaultSettings(user.userId));
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update settings for the authenticated user
export async function PUT(request) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const updatedSettings = await request.json();
    console.log("Received settings update:", updatedSettings);
    // Remove non-user-set fields
    delete updatedSettings._id;
    delete updatedSettings.userId;
    delete updatedSettings.createdAt;
    delete updatedSettings.updatedAt;
    delete updatedSettings.__v;
    
    const updatePayload = {
      allowCopyPaste: updatedSettings.allowCopyPaste,
      copyPasteLectureOverride: updatedSettings.copyPasteLectureOverride,
      notifications: updatedSettings.notifications,
      exportFilters: updatedSettings.exportFilters,
    };

    const settings = await Setting.findOneAndUpdate(
      { userId: user.userId },
      { $set: updatePayload },
      { new: true, upsert: true, runValidators: true }
    );
      
    console.log("Updated settings in database:", settings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create or update settings for the authenticated user
export async function POST(request) {
  try {
    await connectDB();
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await request.json();
    console.log("Received settings creation payload:", payload);
    // Remove non-user-set fields
    delete payload._id;
    delete payload.userId;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.__v;
    
    let settings = await Setting.findOne({ userId: user.userId });
    if (settings) {
      // Update existing settings
      settings = await Setting.findOneAndUpdate(
        { userId: user.userId },
        { $set: {
            allowCopyPaste: payload.allowCopyPaste,
            copyPasteLectureOverride: payload.copyPasteLectureOverride,
            notifications: payload.notifications,
            exportFilters: payload.exportFilters,
          }
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new settings combining defaults with user-provided payload
      settings = await Setting.create({
        ...defaultSettings(user.userId),
        ...payload,
        userId: user.userId
      });
    }
    
    console.log("Settings after POST:", settings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error creating/updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}