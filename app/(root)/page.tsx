import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/threads.actions";
import { UserButton, currentUser } from "@clerk/nextjs";

export default async function Home() {
  const user = await currentUser();
  const data = await fetchPosts(1, 30, user?.id);

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {!data?.posts.length ? (
          <p className="no-result">No Dhaage found</p>
        ) : (
          data.posts.map((post) => {
            return (
              <ThreadCard
                key={post._id.toString()}
                id={post._id.toString()}
                currentUserId={user?.id || null}
                text={post.text}
                _id={post._id}
                author={post.author}
                comments={post.children}
                parentId={post.parentId}
                createdAt={post.createdAt}
                community={post.community}
                hasLiked={post.hasLiked}
                likesCount={post.likes.length}
              />
            );
          })
        )}
      </section>
    </>
  );
}
