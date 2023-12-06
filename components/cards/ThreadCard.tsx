import { likeUnlikeThread } from "@/lib/actions/threads.actions";
import { IThread, IUser } from "@/lib/interface/interface";
import mongoose from "mongoose";
import Actions from "../shared/Actions";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ThreadCardProps {
  id: string;
  currentUserId: string | null;
  _id: mongoose.Schema.Types.ObjectId;
  text: string;
  author: IUser;
  hasLiked: boolean;
  likesCount: number;
  children?: IThread[];
  parentId?: string;
  createdAt?: Date;
  community?: any;
  isComment?: boolean;
}

const ThreadCard: React.FC<ThreadCardProps> = ({
  id,
  currentUserId,
  _id,
  text,
  author,
  community,
  createdAt,
  parentId,
  children,
  isComment,
  hasLiked,
  likesCount,
}) => {
  return (
    <article className="flex w-full flex-col rounded-xl bg-dark-2 p-7">
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image
                src={author.image}
                alt="profile-image"
                fill
                className="cursor-pointer rounded-fill"
              />
            </Link>

            <div className="thread-card_bar" />
          </div>

          <div className="flex w-full flex-col">
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="cursor-pointer text-base-semibold text-light-1">
                {author.name}
              </h4>
            </Link>
            <p className="mt-2 text-small-regular text-light-2">{text}</p>
            <div className="mt-5 flex flex-col gap-3">
              <Actions
                userId={currentUserId?.toString()}
                threadId={_id.toString()}
                hasLiked={hasLiked}
                likesCount={likesCount}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ThreadCard;
