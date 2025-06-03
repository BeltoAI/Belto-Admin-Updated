import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MessageReaction from "@/models/MessageReaction";

export async function GET(request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    
    console.log(`Processing analytics request for userId: ${userId}`);
    
    // Get like count
    const likesCount = await MessageReaction.countDocuments({
      userId: userId,
      reactionType: "like"
    });
    
    // Get dislike count
    const dislikesCount = await MessageReaction.countDocuments({
      userId: userId,
      reactionType: "dislike"
    });
    
    // Count distinct sessions
    const sessions = await MessageReaction.distinct("sessionId", { userId: userId });
    const promptsMade = sessions.length;
    
    // Calculate time spent (basic estimate)
    // This aggregates session durations by finding first and last message timestamps
    const timeData = await MessageReaction.aggregate([
      { $match: { userId: userId } },
      { $group: { 
          _id: "$sessionId", 
          firstMessage: { $min: "$timestamp" },
          lastMessage: { $max: "$timestamp" }
        } 
      },
      { $project: {
          duration: { $subtract: ["$lastMessage", "$firstMessage"] }
        }
      },
      { $group: {
          _id: null,
          totalDuration: { $sum: "$duration" }
        }
      }
    ]);
    
    // Convert milliseconds to hours (rounded to 1 decimal place)
    const timeSpentHours = Math.max(0.1, Math.round((timeData[0]?.totalDuration || 0) / 3600000 * 10) / 10);
    
    const response = {
      analytics: {
        timeSpent: `${timeSpentHours}h`,
        promptsMade: promptsMade,
        likesGiven: likesCount,
        dislikesGiven: dislikesCount
      }
    };
    
    console.log("Returning analytics:", response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching student analytics:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}