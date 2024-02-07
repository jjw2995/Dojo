"use client";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { Button } from "~/@/components/ui/button";

type Input = { groupName: string };

export default function CreateStore() {
  const [open, setOpen] = useState(false);
  const form = useForm<Input>();
  const storeCreate = api.store.create.useMutation();
  const utils = api.useUtils();
  const onSubmit: SubmitHandler<Input> = (data) => {
    // console.log(data);
    storeCreate.mutate(
      { name: data.groupName },
      {
        onSuccess() {
          void utils.store.get.invalidate();
          form.reset();
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          className=" fixed left-[80%] top-[90%] z-10 m-2 translate-x-[-50%] translate-y-[-50%] rounded-full p-2"
          // variant="outline"
        >
          <Plus />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="text-text fixed left-[50%] top-[50%] z-10 w-[70%] translate-x-[-50%] translate-y-[-50%] rounded-sm bg-background p-2 outline">
          <Dialog.Title>create group</Dialog.Title>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <input
              className="text-black"
              placeholder="Group Name"
              {...form.register("groupName", { required: true })}
            />
            <div className="m-2 flex flex-row justify-around">
              <button className="p-2 outline" type="submit">
                create
              </button>
              <Dialog.Close asChild>
                <button className="p-2 outline">cancel</button>
              </Dialog.Close>
            </div>
          </form>
          <Dialog.Description />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}