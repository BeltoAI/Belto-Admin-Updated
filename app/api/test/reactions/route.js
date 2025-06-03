import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MessageReaction from "@/models/MessageReaction";

export async function GET(request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    // Get all reactions for debugging
    const allReactions = await MessageReaction.find(
      userId ? { userId } : {}
    ).limit(10);
    
    // Count by reaction type
    const countByType = await MessageReaction.aggregate([
      { $group: { 
          _id: "$reactionType", 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    // Count by userId
    const countByUser = await MessageReaction.aggregate([
      { $group: { 
          _id: "$userId", 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    return NextResponse.json({
      message: "Test API for MessageReaction data",
      sampleReactions: allReactions,
      countByType,
      topUsers: countByUser
    });
  } catch (error) {
    console.error("Error in test API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}