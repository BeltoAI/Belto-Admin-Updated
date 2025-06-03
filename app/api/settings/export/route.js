import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Setting from '@/models/Setting';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch user's settings
    const settings = await Setting.findOne({ userId: user.userId });
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }
    
    // Return the settings data for client-side PDF generation
    const settingsData = {
      user: {
        name: user.name,
        email: user.email
      },
      settings: {
        allowCopyPaste: settings.allowCopyPaste,
        copyPasteLectureOverride: settings.copyPasteLectureOverride,
        notifications: settings.notifications,
        exportFilters: settings.exportFilters
      },
      generatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(settingsData);
  } catch (error) {
    console.error('Error exporting settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}