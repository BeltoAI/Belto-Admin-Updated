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
    
    // Count reactions by type for the specified user
    const reactions = await MessageReaction.aggregate([
      { $match: { userId: userId } },
      { $group: { 
          _id: "$reactionType", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Format the results into an object
    const formattedResult = {
      likes: 0,
      dislikes: 0
    };

    reactions.forEach(reaction => {
      if (reaction._id === "like") {
        formattedResult.likes = reaction.count;
      } else if (reaction._id === "dislike") {
        formattedResult.dislikes = reaction.count;
      }
    });

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error("Error fetching student reactions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}