import { fetchUserPosts } from "@/lib/actions/users.action";
import React from "react";
import ThreadCard from "../cards/ThreadCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CornerUpRight, FileText } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { IThread } from "@/lib/interface/interface";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
  totalLikes?: number;
}

const ThreadsTab: React.FC<Props> = async ({
  currentUserId,
  accountId,
  accountType,
  totalLikes = 0,
}) => {
  let data: any;

  if (accountType === "Community") {
    data = await fetchCommunityPosts(accountId);
  } else {
    data = await fetchUserPosts(accountId);
  }

  const primaryThreads = data.threads.filter(
    (thread: IThread) => thread.isComment !== true
  );

  const commentThreads = data.threads.filter(
    (thread: IThread) => thread.isComment === true
  );

  return (
    <>
      <section className="mt-9 flex flex-col gap-10">
        {accountType !== "Community" && (
          <div>
            <p className="text-base-medium md:text-heading4-medium text-light-2 flex items-center gap-1">
              Overall Likes on Dhaage:
              <span>{totalLikes}</span>
              {/* <Image
              src={`/assets/heart-red.svg`}
              alt="heart"
              width={640} // base value
              height={480} // base value
              className="h-[18px] w-[18px] md:h-[36px] md:w-[36px] object-contain"
            /> */}
            </p>
          </div>
        )}
        <Tabs defaultValue="primary" className="w-full">
          <TabsList className="tab">
            <TabsTrigger key={"primary"} value={"primary"} className="tab">
              <FileText />
              <p className="max-sm:hidden">Primary</p>
              <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                {primaryThreads && primaryThreads.length
                  ? primaryThreads.length
                  : 0}
              </p>
            </TabsTrigger>
            <TabsTrigger key={"comment"} value={"comment"} className="tab">
              <CornerUpRight />
              <p className="max-sm:hidden">Replies</p>
              <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                {commentThreads && commentThreads.length
                  ? commentThreads.length
                  : 0}
              </p>
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-col h-screen mt-10">
            <ScrollArea className="h-1/2">
              <TabsContent
                key={`content-primary`}
                value={"primary"}
                className="w-full text-light-1 space-y-6"
              >
                {primaryThreads && primaryThreads.length ? (
                  primaryThreads.map((thread: any) => (
                    <ThreadCard
                      key={thread._id.toString()}
                      id={thread._id.toString()}
                      currentUserId={currentUserId}
                      text={thread.text}
                      _id={thread._id}
                      author={
                        accountType === "User"
                          ? {
                              name: data.name,
                              image: data.image,
                              id: data.id,
                            }
                          : {
                              name: thread.author.name,
                              image: thread.author.image,
                              id: thread.author.id,
                            }
                      }
                      comments={thread.children}
                      parentId={thread.parentId}
                      createdAt={thread.createdAt}
                      community={thread.community}
                      hasLiked={thread.hasLiked}
                      likesCount={thread.likes.length}
                      profile={true}
                    />
                  ))
                ) : (
                  <p className="no-result">Nothing posted yet!</p>
                )}
              </TabsContent>
              <TabsContent
                key={`content-comment`}
                value={"comment"}
                className="w-full text-light-1 space-y-6"
              >
                {commentThreads && commentThreads.length ? (
                  commentThreads.map((thread: any) => (
                    <ThreadCard
                      key={thread._id.toString()}
                      id={thread._id.toString()}
                      currentUserId={currentUserId}
                      text={thread.text}
                      _id={thread._id}
                      author={
                        accountType === "User"
                          ? {
                              name: data.name,
                              image: data.image,
                              id: data.id,
                            }
                          : {
                              name: thread.author.name,
                              image: thread.author.image,
                              id: thread.author.id,
                            }
                      }
                      comments={thread.children}
                      parentId={thread.parentId}
                      createdAt={thread.createdAt}
                      community={thread.community}
                      hasLiked={thread.hasLiked}
                      likesCount={thread.likes.length}
                      profile={true}
                      isComment={true}
                    />
                  ))
                ) : (
                  <p className="no-result">Nothing posted yet!</p>
                )}
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </section>
    </>
  );
};

export default ThreadsTab;
