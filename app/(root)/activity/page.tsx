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
    <section>
      <h1 className="head-text mb-10">Activity</h1>
    </section>
  );
}

export default Page;
