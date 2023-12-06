"use client";

import { likeUnlikeThread, likedBy } from "@/lib/actions/threads.actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "../ui/use-toast";
import { Separator } from "@radix-ui/react-separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";

interface Props {
  userId: string | undefined;
  threadId: string;
  hasLiked: boolean;
  likesCount: number;
}

const Actions: React.FC<Props> = ({
  userId,
  threadId,
  hasLiked,
  likesCount,
}) => {
  const [likedByList, setLikedByList] = useState<
    {
      image: string;
      username: string;
      _id: string;
    }[]
  >([]);
  const pathname = usePathname();
  const { toast } = useToast();

  const likeUnlike = async () => {
    if (userId) {
      await likeUnlikeThread(userId, threadId, !hasLiked, pathname);
    } else {
      toast({
        title: "Login Required",
        description: "Please login/sign up to like dhaaga",
      });
    }
  };

  const getLikedBy = async () => {
    try {
      const data = await likedBy(threadId);
      setLikedByList(JSON.parse(data));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Server Error",
        description: "Something went wrong while fetching liked by users list.",
      });
    }
  };

  const copyThreadURL = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/thread/${threadId.toString()}`
    );
    toast({
      title: "Copied!",
      description: "Link copied to your clipboard 🎉",
    });
  };

  return (
    <>
      <div className="flex gap-3.5">
        <div className="flex items-center gap-2 likedBy-dialog">
          <Image
            src={`/assets/heart-${hasLiked ? "red" : "gray"}.svg`}
            alt="heart"
            width={24}
            height={24}
            className="cursor-pointer object-contain"
            onClick={likeUnlike}
          />
          <Dialog>
            <DialogTrigger asChild>
              <p
                className="text-light-1 my-auto cursor-pointer"
                onClick={getLikedBy}
              >
                {likesCount}
              </p>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-light-1">Liked By</DialogTitle>
              </DialogHeader>
              <div className="p-6 h-96 overflow-y-auto">
                {likedByList.length ? (
                  likedByList.map((data) => {
                    return (
                      <>
                        <div
                          className="flex items-center justify-between"
                          key={data.username}
                        >
                          <Image
                            src={data.image}
                            alt="profile-image"
                            className="cursor-pointer rounded-full"
                            height={56}
                            width={56}
                          />
                          <p className="text-base-semibold text-light-1">
                            @{data.username}
                          </p>
                        </div>
                        {likedByList.length > 1 && (
                          <Separator className="my-6 border border-slate-800" />
                        )}
                      </>
                    );
                  })
                ) : (
                  <p className="no-result">Nothing to show</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Link href={`/dhaaga/${threadId.toString()}`}>
          <Image
            src={"/assets/reply.svg"}
            alt="reply"
            width={24}
            height={24}
            className="cursor-pointer object-contain"
          />
        </Link>
        <Image
          src={"/assets/repost.svg"}
          alt="repost"
          width={24}
          height={24}
          className="cursor-pointer object-contain"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Image
              src={"/assets/share.svg"}
              alt="share"
              width={24}
              height={24}
              className="cursor-pointer object-contain"
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-light-1">Share link</DialogTitle>
              <DialogDescription>
                Anyone who has this link will be able to view this.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 mt-6">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only text-light-1">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={`${
                    window.location.origin
                  }/dhaaga/${threadId.toString()}`}
                  readOnly
                  className="border border-dark-4 bg-dark-3 text-light-1 no-focus"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="px-3"
                onClick={copyThreadURL}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* liked by dialog */}

      {/* liked by dialog */}
    </>
  );
};

export default Actions;
