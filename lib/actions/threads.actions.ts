"use server";

import { revalidatePath } from "next/cache";
import {
  ActivityResponse,
  CreateThreadParams,
  IThread,
  IUser,
} from "../interface/interface";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import mongoose from "mongoose";
import { LRUCache } from "lru-cache";
import { cacheKeyPosts, cacheOptions } from "@/constants";
import Activity from "../models/activity.model";

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
  connectToDB();
  try {

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
    throw new Error(`Failed to create dhaaga: ${error.message}`);
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
          posts = await populateHasLiked(posts, userId, true);
        }
      }
      cache.set(cacheKeyPosts, { posts: posts, isNext: isNext });
      return { posts, isNext };
    } else {
      return { posts: data?.posts as IThread[], isNext: data?.isNext };
    }
  } catch (error: any) {
    throw new Error(`Failed to fetch dhaage: ${error.message}`);
  }
}

export async function likeUnlikeThread(
  userId: string,
  threadId: string,
  isLike: boolean = false,
  path: string
) {
  try {
    connectToDB();
    // Find the user and the thread
    const user = await User.findOne({ id: userId });
    const thread = await Thread.findById(threadId);

    const threadOwner = await User.findOne({ _id: thread.author });

    if (!user || !thread) {
      throw new Error("User or thread not found");
    }

    if (isLike) {
      // Add the user's ID to the thread's likes and vice versa
      thread.likes.push(user._id);
      user.likes.push(thread._id);
      threadOwner.totalLikes += 1;

      let activity = new Activity({
        from: user._id,
        to: threadOwner._id,
        actionThread: thread._id,
        type: "like",
      });

      await activity.save();
    } else {
      thread.likes = thread.likes.filter((id: any) => !id.equals(user._id));
      user.likes = user.likes.filter((id: any) => !id.equals(thread._id));
      threadOwner.totalLikes -= 1;

      await Activity.findOneAndUpdate({
        to: threadOwner._id,
        status: "delete",
      });
    }

    // Save the changes
    await thread.save();
    await user.save();
    await threadOwner.save();

    cache.delete(cacheKeyPosts);
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Process failed: ${error.message}`);
  }
}

export async function likedBy(threadId: string): Promise<any> {
  try {
    connectToDB()
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
  } catch (error: any) {
    throw new Error(
      `Process failed to get the liked by list: ${error.message}`
    );
  }
}

export async function fetchThreadById(
  id: string,
  userId: string | undefined
): Promise<IThread> {
  connectToDB();

  try {
    let thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: "User",
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: "User",
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: "Thread",
            populate: {
              path: "author",
              model: "User",
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    if (userId) {
      thread = await populateHasLiked(thread, userId);
    }

    return thread;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch the dhaaga by id '${id}': ${error.message}`
    );
  }
}

export async function addComment(
  threadId: string,
  userId: string,
  commentText: string,
  path: string
) {
  connectToDB();

  try {
    const orignalThread = await Thread.findById(threadId);

    if (!orignalThread) {
      throw new Error("Dhaaga not found");
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
      isComment: true,
    });

    const saveCommentThread: IThread = await commentThread.save();

    orignalThread.children.push(saveCommentThread._id);
    await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {
      $push: { threads: saveCommentThread._id },
    });

    await orignalThread.save();

    /* add to activity */
    const activity = new Activity({
      from: userId,
      to: orignalThread.author._id,
      actionThread: orignalThread._id,
      type: "comment",
    });

    await activity.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment: ${error.message}`);
  }
}

/* helper */
async function populateHasLiked(
  thread: any,
  userId: string,
  mainFetch = false
) {
  const user = await User.findOne({ id: userId });
  const likesSet = new Set(user.likes.map(String));

  if (mainFetch) {
    thread = thread.map((post: IThread) => ({
      // @ts-ignore
      ...post._doc,
      hasLiked: likesSet.has(String(post._id)),
    }));
  } else {
    // Add 'hasLiked' property to the thread
    thread = {
      ...thread._doc,
      hasLiked: likesSet.has(String(thread._id)),
    };
  }

  if (!mainFetch) {
    // If the thread has children, recursively add 'hasLiked' to them
    if (thread.children && thread.children.length > 0) {
      thread.children = await Promise.all(
        thread.children.map((child: IThread) => populateHasLiked(child, userId))
      );
    }
  }

  return thread;
}

// export async function getActivity(userId: string): Promise<ActivityResponse> {
//   connectToDB();

//   try {
//     const userThreads = await Thread.find({ author: userId });

//     const childThreadIds = userThreads.reduce((acc, userThread: IThread) => {
//       return acc.concat(userThread.children);
//     }, []);

//     const replies = (await Thread.find({
//       _id: { $in: childThreadIds },
//       author: { $ne: userId },
//     }).populate({
//       path: "author",
//       model: "User",
//       select: "name username image _id",
//     })) as IThread[];

//     const likesIds = userThreads.reduce((acc, userThread: IThread) => {
//       return acc.concat(userThread.likes);
//     }, []);

//     const likes = await User.find({
//       _id: { $in: likesIds, $ne: userId },
//     }).select("name username image _id");

//     return [...replies, ...likes];
//   } catch (error) {
//     throw new Error("Failed to fetch activity");
//   }
// }
