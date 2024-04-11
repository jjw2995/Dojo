import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { useFieldArray, useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Plus, X } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { z } from "zod";

export default function OptionModal({ itemId }: { itemId: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className=" m-2 p-2">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <Tabs defaultValue="create">
          <DialogTitle className="mb-2">Options</DialogTitle>
          <TabsList className="w-full">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <OptionCreate itemId={itemId} />
          </TabsContent>
          <TabsContent value="edit">Change your password here.</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export const optionInputSchema = z.object({
  name: z.string(),
  minSelect: z.number(),
  maxSelect: z.number(),
  choices: z.array(z.object({ name: z.string(), price: z.number() })),
});

type OptionInputType = typeof optionInputSchema._type;

function OptionCreate({ itemId }: { itemId: number }) {
  const form = useForm<OptionInputType>();
  const optionCreate = api.option.create.useMutation({
    onSuccess(data, variables, context) {
      form.reset();
    },
  });
  //   error with useFieldArray, it just says string not assignable to
  const choices = useFieldArray({ name: "choices", control: form.control });

  const choicesArr = form.watch("choices", []);

  return (
    <div className="mt-6 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="">option name</Label>
        <Input
          className="w-60 text-end"
          placeholder="option name"
          {...form.register("name", { required: true })}
        />
      </div>
      <div className="flex items-end justify-between">
        <div className="text-center">
          <Label htmlFor="">min select</Label>
          <Input
            type="number"
            className="w-20 text-end"
            {...form.register("minSelect", {
              required: true,
              valueAsNumber: true,
              value: 0,
              disabled: choicesArr.length < 1,
            })}
          />
        </div>

        <div className="text-center">
          <Label htmlFor="">max select</Label>
          <Input
            type="number"
            className="w-20 text-end"
            {...form.register("maxSelect", {
              required: true,
              valueAsNumber: true,
              disabled: choicesArr.length < 1,
            })}
          />
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            choices.append({ name: "", price: 0 });
          }}
        >
          add
          <br />
          choice
        </Button>
      </div>

      <div className="py-4">
        <div className="h-[14rem] overflow-y-auto">
          {choices.fields.map((field, index) => {
            let onFocus = false;
            return (
              <Card key={field.id} className="relative m-2 p-4">
                <Button
                  variant="ghost"
                  className="absolute left-1 top-1 m-0 flex h-6 w-6 rounded-full p-0 focus:bg-red-600 focus:text-accent"
                  onBlur={() => {
                    onFocus = false;
                  }}
                  onClick={() => {
                    if (onFocus) {
                      choices.remove(index);
                    }
                    onFocus = true;
                  }}
                >
                  <X className="h-4 w-4 translate-x-[0.5px]" />
                </Button>
                <CardContent className="ml-4 space-y-1 p-0">
                  <div className="flex items-center justify-between tracking-tight">
                    <Label className="text-sm leading-tight">selectable</Label>
                    <Input
                      {...form.register(`choices.${index}.name` as const, {
                        required: true,
                      })}
                      className="w-36"
                      placeholder="name"
                    />
                  </div>
                  <div className="flex items-center justify-between tracking-tight">
                    <Label className="text-sm leading-tight">price</Label>
                    <Input
                      type="number"
                      placeholder="price"
                      {...form.register(`choices.${index}.price` as const, {
                        required: true,
                        valueAsNumber: true,
                      })}
                      className="w-36"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <Button
        onClick={() => {
          optionCreate.mutate({ ...form.getValues(), itemId: itemId });
        }}
      >
        create option
      </Button>
    </div>
  );
}
