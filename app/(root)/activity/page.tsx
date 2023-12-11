import { getActivity } from "@/lib/actions/activity.actions";
import { fetchUser } from "@/lib/actions/users.action";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import moment from "moment";

async function Page() {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo) return null;

  if (userInfo && !userInfo.onboarded) {
    redirect("/onboarding");
  }

  const activity = await getActivity(userInfo._id.toString());

  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>

      <div className="mt-10 flex flex-col gap-5">
        {activity.length > 0 ? (
          activity.map((activity) => {
            return (
              <Link
                key={activity._id.toString()}
                href={`/dhaaga/${activity.actionThread}`}
              >
                <article className="activity-card justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={activity.from.image}
                      alt="profile-image"
                      width={26}
                      height={26}
                      className="rounded-full object-cover"
                    />
                    <p className="!text-small-regular md:!text-base-regular text-light-1">
                      <span className="mr-1 text-primary-500">
                        @{activity.from.username}
                      </span>
                      {activity.type === "like"
                        ? "liked your Dhaaga"
                        : "replies to your dhaaga"}
                    </p>
                  </div>
                  <p className="text-light-3 !text-small-regular md:!text-base-regular">
                    {moment(activity.createdAt).fromNow()}
                  </p>
                </article>
              </Link>
            );
          })
        ) : (
          <p className="no-result">No activity yet!</p>
        )}
      </div>
    </section>
  );
}

export default Page;
