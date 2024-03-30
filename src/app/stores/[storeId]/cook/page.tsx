"use client";

import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MoreVertical, Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const NUM_OF_ORDERS = 8;

type Order = RouterOutputs["order"]["getOrders"][number];
type Orders = Order[] | undefined;

type StationInput = { stationName: string };

const QPARAM = "stationId";

export default function Page() {
  const useQP = useQueryParam();
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-row justify-between p-4 text-2xl">
        <StationSelect {...useQP} />
        <StationMenu {...useQP} />
      </div>
      <OrderList />
    </div>
  );
}

function filterByStation(
  orderList: Orders | undefined,
  stationId: number | undefined,
) {
  if (!orderList) return orderList;

  if (!stationId) return orderList;

  const tempOrderList = orderList.map((order) => {
    return {
      ...order,
      list: order.list
        .map((items) => {
          const tempItems = items.filter((item) =>
            item.stations.find((station) => station.id === stationId),
          );

          if (tempItems.length > 0) {
            return tempItems;
          }
          return undefined;
        })
        .filter((r) => r !== undefined),
    } as Order;
  });

  return tempOrderList.filter((ol) => ol.list.length > 0);
}

// paginated orders hourly, completed or not,
function OrderList() {
  const q = useQueryParam();
  const orders = api.order.getOrders.useQuery();
  const [orderList, setOrderList] = useState<Orders>();
  useEffect(() => {
    setOrderList(filterByStation(orders.data, q.stationId));
  }, [orders.data, q.stationId]);

  //   https://stackoverflow.com/questions/43311943/prevent-content-from-expanding-grid-items
  return (
    <div className="grid h-full snap-x snap-proximity grid-flow-col grid-rows-1 gap-2 overflow-x-scroll md:mx-4 md:flex-1 md:grid-flow-row md:grid-cols-4 md:grid-rows-2 md:overflow-hidden">
      {orderList?.slice(0, NUM_OF_ORDERS).map((order) => {
        return (
          <Card
            key={`orderId_${order.id}`}
            className="flex h-[calc(100%-1rem)] w-[calc(100vw-2rem)] snap-center flex-col first:ml-4 last:mr-4 md:w-auto md:first:ml-0 md:last:mr-0"
          >
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>{order.name}</span>
              </CardTitle>
              <CardDescription className="flex justify-between">
                <span>{order.type}</span>
                <span>{order.createdAt}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="grid flex-1 grid-cols-1 overflow-y-scroll">
              <div>
                {order.list?.map((subOrder, subGIdx) => {
                  return (
                    <div className="border-b-2" key={`subOrder${subGIdx}`}>
                      {subOrder.map((item, idx) => {
                        return (
                          <div key={`itemId_${item.id}_${idx}`}>
                            <span>{item.qty}</span>
                            <span className="ml-1">{item.name}</span>
                            {item.stations.map((station) => {
                              return `${station.name}_${station.id}`;
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-300">
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function StationSelect({
  resetQueryParam,
  setQueryParam,
  stationId,
}: ReturnType<typeof useQueryParam>) {
  const stations = api.station.get.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  //   const [value, setValue] = useState<string | null>(
  //     stationId ? stationId.toString() : null,
  //   );

  function setSelectValue(val: string) {
    if (val === "_") {
      resetQueryParam();
    } else {
      setQueryParam(val);
    }
    // setValue(() => {
    // });
  }

  return (
    <>
      <Select
        onValueChange={(value) => {
          setSelectValue(value);
        }}
        defaultValue="_"
      >
        <SelectTrigger className="font-semibol w-[180px] text-xl">
          <SelectValue placeholder="station">
            {stationId && stations.data
              ? stations.data.find((r) => r.id === stationId)?.name
              : "All"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_">All</SelectItem>
          {stations.data?.map((station) => {
            return (
              <SelectItem key={station.id} value={`${station.id}`}>
                {station.name}
              </SelectItem>
            );
          })}
          <div
            className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm text-muted-foreground outline-none"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            + add station
          </div>
        </SelectContent>
      </Select>
      <Create isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}

function Create({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const form = useForm<StationInput>();
  const stationCreate = api.station.create.useMutation();
  const utils = api.useUtils();
  const onSubmit: SubmitHandler<StationInput> = (data) => {
    stationCreate.mutate(
      { name: data.stationName },
      {
        onSuccess() {
          void utils.station.get.invalidate();
          form.reset();
          setIsOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Station</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stationName" className="text-right">
                Name
              </Label>
              <Input
                className="col-span-3"
                id="stationName"
                placeholder="Station Name"
                {...form.register("stationName", { required: true })}
              />
            </div>
          </div>
        </form>
        <DialogFooter className="justify-center gap-2">
          <DialogClose asChild>
            <Button variant="destructive">cancel</Button>
          </DialogClose>
          <Button type="submit">create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StationMenu({
  resetQueryParam,
  stationId,
}: Omit<ReturnType<typeof useQueryParam>, "setQueryParam">) {
  const util = api.useUtils();
  const d = api.station.delete.useMutation({
    onSuccess: async () => {
      await util.station.get.invalidate();
      resetQueryParam();
    },
  });

  if (!stationId) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical />
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              if (stationId) {
                d.mutate({ stationId: stationId });
              }
            }}
          >
            delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}

function useQueryParam() {
  // TODO: component update colliding with query param update
  //   Cannot update a component (`Page`) while rendering a different component (`StationSelect`).
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stationId = searchParams.get(QPARAM);

  //   const [url, setUrl] = useState(pathname);

  //   useEffect(() => {
  //     router.replace(url);
  //   }, [url]);

  function resetQueryParam() {
    router.replace(pathname);
    // setUrl(pathname);
  }

  function setQueryParam(val: string) {
    router.replace(`${pathname}?${QPARAM}=${val}`);
    // setUrl(`${pathname}?${QPARAM}=${val}`);
  }

  return {
    resetQueryParam,
    setQueryParam,
    stationId: stationId ? Number(stationId) : undefined,
  };
}