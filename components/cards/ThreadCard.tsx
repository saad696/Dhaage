import { likeUnlikeThread } from "@/lib/actions/threads.actions";
import { IThread, IUser } from "@/lib/interface/interface";
import mongoose from "mongoose";
import Actions from "../shared/Actions";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { formatDateString } from "@/lib/utils";

interface ThreadCardProps {
  id: string;
  currentUserId: string | null;
  _id: mongoose.Schema.Types.ObjectId;
  text: string;
  author: Partial<IUser>;
  hasLiked: boolean;
  likesCount: number;
  comments?: IThread[];
  parentId?: string;
  createdAt?: Date;
  community?: any;
  isComment?: boolean;
  profile?: boolean;
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
  comments,
  hasLiked,
  likesCount,
  isComment = false,
  profile = false,
}) => {
  return (
    <article
      className={`flex w-full flex-col rounded-xl ${
        !profile && isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            {author.image && (
              <Link
                href={`/profile/${author.id}`}
                className="relative h-11 w-11"
              >
                <Image
                  src={author.image}
                  alt="profile-image"
                  fill
                  className="cursor-pointer rounded-full"
                />
              </Link>
            )}

            <div className="thread-card_bar" />
          </div>

          <div className="flex w-full flex-col">
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="cursor-pointer text-base-semibold text-light-1">
                {author.name}
              </h4>
            </Link>
            <p className="mt-2 text-small-regular text-light-2">{text}</p>
            <div
              className={`${
                !profile && isComment && "mb-10 "
              } mt-5 flex flex-col gap-3`}
            >
              <Actions
                userId={currentUserId?.toString()}
                threadId={_id.toString()}
                hasLiked={hasLiked}
                likesCount={likesCount}
                profile={profile}
                isCommnet={isComment}
              />
              {!profile && isComment && comments && comments.length && (
                <Link href={`/dhaaga/${_id.toString()}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">Replies</p>
                </Link>
              )}
            </div>
          </div>
        </div>

        {!isComment && community && (
          <Link
            href={`/communities/${community.id}`}
            className="mt-5 flex items-center"
          >
            <p className="text-subtle-medium text-gray-1">
              {formatDateString(createdAt?.toString())}- {community.name}{" "}
              Community
            </p>

            <Image
              src={community.image}
              alt={community.name}
              width={14}
              height={14}
              className="ml-1 rounded-full object-cover"
            />
          </Link>
        )}
      </div>
    </article>
  );
};

export default ThreadCard;
