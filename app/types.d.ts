import { IUser } from "@/lib/interface/interface";

type User = {
  id: string | undefined;
  objectId: any;
  name: string;
  username: string | undefined | null;
  bio: string | undefined;
  image: string | undefined;
  onboarded: boolean
};

// type OmittedIUser = Omit<IUser, "_id" | "likes">;