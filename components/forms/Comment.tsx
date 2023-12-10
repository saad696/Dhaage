"use client";

import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { commentValidation } from "@/lib/validations/threads.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";
import { addComment } from "@/lib/actions/threads.actions";
import { useToast } from "../ui/use-toast";

interface Props {
  threadId: string;
  currentUserImage: string;
  currentUserId: string;
}

const Comment: React.FC<Props> = ({
  threadId,
  currentUserImage,
  currentUserId,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof commentValidation>>({
    resolver: zodResolver(commentValidation),
    defaultValues: {
      thread: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof commentValidation>) => {
    try {
      await addComment(
        threadId,
        currentUserId.toString(),
        values.thread,
        pathname
      );
      toast({
        title: "Comment Added",
        description: "Your comment has been added sucessfully.",
      });
      form.reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
          <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 w-full">
                <FormLabel>
                  <Image
                    src={currentUserImage}
                    alt="Profile picture"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                </FormLabel>
                <FormControl className="border-none bg-transparent">
                  <Input
                    type="text"
                    placeholder="Comment..."
                    className="no-focus text-light-1 outline-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="comment-form_btn">
            Reply
          </Button>
        </form>
      </Form>
    </>
  );
};

export default Comment;
