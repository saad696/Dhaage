import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/threads.actions";
import { fetchUser } from "@/lib/actions/users.action";
import { IThread } from "@/lib/interface/interface";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();

  const userInfo = await fetchUser(user?.id || "");

  if (userInfo && !userInfo?.onboarded) {
    redirect("/onboarding");
  }

  const thread = await fetchThreadById(params.id, user?.id);

  return (
    <section className="relative">
      <div>
        <ThreadCard
          key={thread._id.toString()}
          id={thread._id.toString()}
          currentUserId={user?.id || null}
          text={thread.text}
          _id={thread._id}
          author={thread.author}
          comments={thread.children}
          parentId={thread.parentId}
          createdAt={thread.createdAt}
          community={thread.community}
          hasLiked={thread.hasLiked}
          likesCount={thread.likes.length}
        />
      </div>

      {user && userInfo && (
        <>
          <div className="mt-7">
            <Comment
              threadId={thread._id.toString()}
              currentUserImage={userInfo.image}
              currentUserId={userInfo._id.toString()}
            />
          </div>

          <div className="mt-10">
            {thread.children.map((commentThread: IThread) => (
              <ThreadCard
                key={commentThread._id.toString()}
                id={commentThread._id.toString()}
                currentUserId={user?.id || null}
                text={commentThread.text}
                _id={commentThread._id}
                author={commentThread.author}
                comments={commentThread.children}
                parentId={commentThread.parentId}
                createdAt={commentThread.createdAt}
                community={commentThread.community}
                hasLiked={commentThread.hasLiked}
                likesCount={commentThread.likes.length}
                isComment={true}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Page;
