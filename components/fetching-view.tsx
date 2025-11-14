import { cn, formatSmartDate } from "@/lib/utils";
import { FetchingDataType } from "@/types";
import { Check, Loader2 } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

type Props = {
  fetchingData: FetchingDataType[];
  setFetchingData: (data: FetchingDataType[]) => void;
  open: boolean;
};
export default function FetchingView({
  fetchingData,
  setFetchingData,
  open,
}: Props) {
  return (
    <div
      className={cn(
        " sticky top-0  p-3  bg-black right-0 h-[150vh] overflow-clip whitespace-nowrap border-l pl-3 space-y-3  duration-300",
        open ? " w-[350px]" : " w-0"
      )}
    >
      <div className="flex justify-between pt-3 items-center gap-6">
        <div className="flex items-center gap-2">
          <p className=" font-medium">Fetching Data</p>
          <p className=" w-fit font-medium px-2 text-gray-200 bg-emerald-700">
            {fetchingData.length}
          </p>
        </div>
        <Button
          variant={"destructive"}
          size={"sm"}
          disabled={fetchingData.length === 0}
          onClick={() => {
            localStorage.setItem("fetchingData", "[]");
            setFetchingData([]);
          }}
        >
          Reset
        </Button>
      </div>
      {fetchingData.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            " p-3 px-5 rounded-md border w-full space-y-1",
            item.status === "pending"
              ? " border-yellow-500/40"
              : " border-green-500/40"
          )}
        >
          <div className=" text-sm overflow-hidden capitalize flex items-center gap-1">
            <p>{item.category}</p>
            <span>in</span>
            <p>{item.location}</p>
          </div>
          <div className=" flex items-center gap-5">
            <div className="flex items-center gap-2">
              <p>Queried : </p>
              <p className=" bg-emerald-800 border px-2 ml-2">
                {item.maxScrape}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p>Scraped : </p>
              <p className=" bg-emerald-800 border px-2 ml-2">
                {item.scrapedDataCount || "-"}
              </p>
            </div>
            
          </div>
          <div className="flex items-center gap-2 justify-between">
            <div className=" capitalize">
              {item.status === "pending" ? (
                <div className="flex items-center text-sm gap-2 text-yellow-500">
                  <Loader2
                    size={15}
                    className=" text-yellow-500 animate-spin"
                  />
                  <p>Pending</p>
                </div>
              ) : (
                <div className="flex items-center text-sm gap-2 text-emerald-500">
                  <Check size={15} className=" text-emerald-500 " />
                  <p>Success</p> -{" "}
                  <span className=" text-sm text-muted-foreground">
                    {formatSmartDate(item.startedAt)}{" "}
                  </span>
                </div>
              )}
            </div>
            <p className=" text-muted-foreground">
              {item.consumedTime > 0 &&
                `( ${Math.floor(item.consumedTime / 1000)}s )`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
