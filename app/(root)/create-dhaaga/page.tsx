import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/users.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (userInfo && !userInfo.onboarded) {
    redirect("/onboarding");
  }

  return (
    <>
      <h1 className="head-text">Create Dhaaga</h1>
      {
        userInfo && <PostThread userId={userInfo._id} />
      }
    </>
  );
}

export default Page;
