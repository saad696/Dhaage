import { IActivity } from "../interface/interface";
import Activity from "../models/activity.model";
import { connectToDB } from "../mongoose";

export async function getActivity(userId: string): Promise<IActivity[]> {
  connectToDB();

  try {
    const userActivity = await Activity.find({
      to: userId,
      from: { $ne: userId },
    })
      .populate("from", "name username image _id")
      .populate("to", "name username image _id");

    return userActivity as IActivity[];
  } catch (error) {
    throw new Error("Failed to fetch activity");
  }
}
