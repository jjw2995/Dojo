"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "~/trpc/react";

type Input = { itemName: string; itemPriceInCent: number };

export default function Page({
  params,
}: {
  params: { storeId: string; categoryId: string };
}) {
  // const a = api.category.get.useQuery();
  console.log(params);
  const [open, setOpen] = useState(true);
  const form = useForm<Input>();
  const stationCreate = api.category.create.useMutation();
  const stations = api.station.get.useQuery();

  const utils = api.useUtils();
  const onSubmit: SubmitHandler<Input> = (data) => {
    stationCreate.mutate(
      { name: data.itemName },
      {
        onSuccess(data, variables, context) {
          utils.category.get.invalidate();
          form.reset();
          setOpen(false);
        },
      },
    );
  };

  return (
    <div className="text-2xl">
      <button
        onClick={() => {
          window.history.back();
        }}
      >
        {" "}
        back{" "}
      </button>
      <div className="">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input
            className="m-2 rounded p-2 outline"
            placeholder="item name"
            {...form.register("itemName", { required: true })}
          />
          <input
            placeholder="price"
            className="m-2 rounded p-2 outline"
            type="number"
            {...form.register("itemPriceInCent", {
              required: true,
              min: 0,
            })}
          />

          <div className="p-2">
            <p>Notify</p>
            <div className="flex ">
              {stations.data?.map((v) => (
                <div className="m-2" key={v.id}>
                  {v.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p>options</p>
            <Options />
          </div>

          <div>
            <p>tax</p>
          </div>

          <div className="m-2 flex flex-row justify-around">
            <button className="p-2 outline" type="submit">
              create item
            </button>
          </div>
        </form>
      </div>
      create item
    </div>
  );
}

function Options() {
  const [] = useState({ numChoices: 1, minSelect: 0, maxSelect: 1 });

  return (
    <Dialog.Root
      // open={open}
      onOpenChange={(isOpen) => {
        // abstract dialog & call "confirm close dialog"
      }}
    >
      <Dialog.Trigger asChild>
        <button className=" m-2 rounded-full p-2 text-xl outline">+</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* <Dialog.Overlay className="z-50"> */}
        <Dialog.Content className="relative z-40 h-[70%] w-[90%] bg-white p-2 text-text outline">
          {/* <Dialog.Content className="fixed z-40 h-[70%] w-[90%] overflow-hidden rounded-sm bg-white p-2 text-text outline"> */}
          <Tabs.Root defaultValue="tab1">
            <Tabs.List className="flex justify-around">
              <Tabs.Trigger
                value="tab1"
                className="data-[state=active]:underline"
              >
                add
              </Tabs.Trigger>
              <Tabs.Trigger
                value="tab2"
                className="data-[state=active]:underline"
              >
                existing
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="tab1">tab1 content</Tabs.Content>
            <Tabs.Content value="tab2">tab2 content</Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
        {/* </Dialog.Overlay> */}
      </Dialog.Portal>
    </Dialog.Root>
  );
}