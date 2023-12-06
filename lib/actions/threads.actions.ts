"use server";

import { revalidatePath } from "next/cache";
import { CreateThreadParams, IThread, IUser } from "../interface/interface";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import mongoose from "mongoose";
import { LRUCache } from "lru-cache";
import { cacheKeyLikedBy, cacheKeyPosts, cacheOptions } from "@/constants";

// Create a new cache
const cache = new LRUCache<string, { posts: IThread[]; isNext: boolean }>(
  cacheOptions
);

export async function createThread({
  text,
  author,
  communityId,
  path,
}: CreateThreadParams): Promise<void> {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author: new mongoose.Types.ObjectId(author),
      community: null,
    });

    // updating specific user
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    cache.delete(cacheKeyPosts);
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchPosts(
  pageNumber = 1,
  pageSize = 20,
  userId: string | undefined
): Promise<{ posts: IThread[]; isNext: any } | null> {
  try {
    // Create a unique key for this set of parameters
    let data = cache.get(cacheKeyPosts);

    if (!data?.posts && !data?.isNext) {
      connectToDB();
      // Calculating the pages to skip
      const skipPostsCount = (pageNumber - 1) * pageSize;

      const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: "desc" })
        .skip(skipPostsCount)
        .limit(pageSize)
        .populate({ path: "author", model: "User" })
        .populate({
          path: "children",
          populate: {
            path: "author",
            model: "User",
            select: "_id name parentId image",
          },
        });

      const totalPosts = await Thread.countDocuments({
        parentId: { $in: [null, undefined] },
      });

      let posts = (await threadsQuery.exec()) as IThread[];
      const isNext = totalPosts > skipPostsCount + posts.length;

      if (userId) {
        // Fetch the user
        const user = (await User.findOne({ id: userId })) as IUser;
        if (user) {
          // Convert the user's likes array into a Set
          const likesSet = new Set(user.likes.map(String));
          // Map through the posts and add a 'hasLiked' property
          posts = posts.map((post) => ({
            // @ts-ignore
            ...post._doc,
            hasLiked: likesSet.has(String(post._id)),
          }));
        }
      }
      cache.set(cacheKeyPosts, { posts: posts, isNext: isNext });
      return { posts, isNext };
    } else {
      return { posts: data?.posts as IThread[], isNext: data?.isNext };
    }
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function likeUnlikeThread(
  userId: string,
  threadId: string,
  isLike: boolean = false,
  path: string
) {
  connectToDB();
  // Find the user and the thread
  const user = await User.findOne({ id: userId });
  const thread = await Thread.findById(threadId);

  if (!user || !thread) {
    throw new Error("User or thread not found");
  }

  if (isLike) {
    // Add the user's ID to the thread's likes and vice versa
    thread.likes.push(user._id);
    user.likes.push(thread._id);
  } else {
    thread.likes = thread.likes.filter((id: any) => !id.equals(user._id));
    user.likes = user.likes.filter((id: any) => !id.equals(thread._id));
  }

  // Save the changes
  await thread.save();
  await user.save();

  cache.delete(cacheKeyPosts);
  revalidatePath(path);
}

export async function likedBy(threadId: string): Promise<any> {
  const likedByQuery = Thread.findById(threadId)
    .populate({
      path: "likes",
      model: "User",
      select: "username image",
    })
    .lean();

  const data = (await likedByQuery.exec()) as IThread;

  if (!data) {
    throw new Error("Thread not found");
  }

  return JSON.stringify(data.likes);
}
