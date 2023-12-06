import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface Props {
  threadId: string;
  likesCount: number;
}

export default async function LikedBy() {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <p className="text-light-1 my-auto cursor-pointer">{likesCount}</p>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Liked By</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96 w-full"></ScrollArea>
          <DialogFooter className="sm:justify-start"></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
