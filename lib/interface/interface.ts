import mongoose from "mongoose";

export interface UpdateUserParams {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export interface CreateThreadParams {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

// Define an interface for the User document
export interface IUser {
  id: string;
  _id: any;
  username: string;
  name: string;
  image: string;
  bio?: string;
  totalLikes: number;
  threads: IThread[];
  likes: mongoose.Schema.Types.ObjectId[];
  onboarded: boolean;
  communities: mongoose.Schema.Types.ObjectId[];
  type?: "User" | "Community";
}

export interface IThread {
  _id: any;
  text: string;
  author: IUser;
  community?: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  parentId?: string;
  children: IThread[];
  likes: mongoose.Schema.Types.ObjectId[];
  hasLiked: boolean;
  isComment: boolean;
}

export interface IActivity {
  _id: mongoose.Schema.Types.ObjectId;
  from: IUser;
  to: IUser;
  type: string;
  actionThread: IThread | mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

interface ActivityResponseItem extends IUser, IThread {}
export type ActivityResponse = ActivityResponseItem[];
