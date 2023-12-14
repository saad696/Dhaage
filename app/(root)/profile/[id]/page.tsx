import ProfileHeader from "@/components/shared/ProfileHeader";
import ThreadsTab from "@/components/shared/ThreadsTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import { fetchUser } from "@/lib/actions/users.action";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(params.id);
  if (!userInfo) redirect("/");
  if (userInfo && !userInfo.onboarded) {
    redirect("/onboarding");
  }

  return (
    <section>
      {userInfo ? (
        <>
          <ProfileHeader
            id={userInfo.id}
            _id={userInfo._id}
            username={userInfo.username}
            name={userInfo.name}
            image={userInfo.image}
            bio={userInfo.bio}
            totalLikes={userInfo.totalLikes}
          />

          <div className="mt-9">
            <Tabs defaultValue="dhaage" className="w-full">
              <TabsList className="tab">
                {profileTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.label}
                    value={tab.value}
                    className="tab"
                  >
                    <Image
                      src={tab.icon}
                      alt={tab.label}
                      width={24}
                      height={24}
                    />
                    <p className="max-sm:hidden">{tab.label}</p>
                  </TabsTrigger>
                ))}
              </TabsList>
              {profileTabs.map((tab) => (
                <TabsContent
                  key={`content-${tab.value}`}
                  value={tab.value}
                  className="w-full text-light-1"
                >
                  <ThreadsTab
                    currentUserId={user.id}
                    accountId={userInfo._id.toString()}
                    accountType="User"
                    totalLikes={userInfo.totalLikes}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </>
      ) : (
        <h1 className="no-result">Profile not available</h1>
      )}
    </section>
  );
}

export default Page;
