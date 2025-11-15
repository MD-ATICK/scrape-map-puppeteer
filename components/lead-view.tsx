import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronUp,
  Facebook,
  Info,
  Instagram,
  Link2,
  Linkedin,
  LocationEdit,
  Mail,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn, formatSmartDate } from "@/lib/utils";
import { EmailStatus, ScrapeResultType } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { DynamicPagination } from "./dynamic-pagination";
import { useState } from "react";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {
  data: ScrapeResultType[];
  setData: (data: ScrapeResultType[]) => void;
  loading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleDownload: () => void;
  downloadLimit: number;
  setDownloadLimit: (limit: number) => void;
};
export default function LeadView({
  data,
  setData,
  loading,
  handleDownload,
  downloadLimit,
  setDownloadLimit,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState(false);
  const itemPerPage = 40;

  const [selectedItem, setSelectedItem] = useState("");

  const sortedData = sort
    ? [...data].sort((a) =>
        a.email_status === "Invalid" || a.email_status === "Blocked" ? -1 : 1
      )
    : data;
  return (
    <div className=" w-full">
      {data.length === 0 ? (
        <p className=" text-center p-4 text-sm">No Business Found</p>
      ) : (
        <>
          {/* TOP BAR */}
          <div className=" flex items-center justify-between w-full px-2">
            {/* LEFT CONTENT  */}
            <h1 className="  px-2 py-1 bg-emerald-800  mb-4">
              Scraped Businesses ({data.length})
            </h1>

            {/* ACTION BUTTONS */}
            <div className=" flex items-center gap-3">
              {/* SIDEBAR BUTTON */}
              {/* <Button
              size={"sm"}
              onClick={() => setOpen(!open)}
            >
              {
                open ? 'Hide' : 'Show'
              }
            </Button> */}
              <Input
                type="number"
                placeholder="Limit"
                value={downloadLimit}
                onChange={(e) => setDownloadLimit(Number(e.target.value))}
              />
              {/* RESET BUTTON */}
              <Button
                size={"sm"}
                disabled={data.length === 0}
                onClick={handleDownload}
              >
                Download
              </Button>
              {/* RESET BUTTON */}
              <Button
                variant={"destructive"}
                size={"sm"}
                disabled={data.length === 0}
                onClick={() => {
                  localStorage.setItem("scrapedData", "[]");
                  setData([]);
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* TABLE */}
          <Table>
            {/* TABLE HEADER */}
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>
                  <Button onClick={() => setSort(!sort)} variant={"outline"}>
                    Status{" "}
                    {sort ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </Button>
                </TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Reviews</TableHead>

                <TableHead>Facebook</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Linkedin</TableHead>
                <TableHead>Tiktok</TableHead>

                <TableHead>Website</TableHead>
                <TableHead>Lead Scraped At</TableHead>
              </TableRow>
            </TableHeader>

            {/* TABLE BODY */}
            <TableBody className="scrollBarHidden">
              {/* LOADING SKELETON */}
              {loading &&
                Array.from({ length: 10 }, (_, i) => i + 1).map((item, idx) => (
                  <SingleLeadSkeleton key={idx} />
                ))}

              {/* RESULT LEAD SHOWING */}
              {sortedData
                .slice(
                  (currentPage - 1) * itemPerPage,
                  currentPage * itemPerPage
                )
                .map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category || ""}</TableCell>
                    <TableCell>
                      {" "}
                      {item.address && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant={"outline"}
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  item.address || ""
                                );
                                toast.success("Copied!");
                              }}
                            >
                              <LocationEdit size={15} />
                              Address
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent> {item.address} </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.email != "null" && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant={"outline"}
                              onClick={() => {
                                navigator.clipboard.writeText(item.email || "");
                                toast.success("Copied!");
                              }}
                            >
                              <Mail size={15} />
                              Email
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent> {item.email} </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell className="flex items-center gap-4">
                      <span
                        onClick={() => setSelectedItem(item.name)}
                        className={cn(
                          " text-xs px-2 cursor-pointer text-muted-foreground py-1 font-light",
                          item.email_status === EmailStatus.Deliverable
                            ? "bg-emerald-600/20 text-emerald-600"
                            : " bg-yellow-600/20 text-yellow-600 font-light"
                          // item.email_status === EmailStatus.Undeliverable &&
                          //   " bg-yellow-600/20 text-yellow-600 font-light",
                          // (item.email_status === EmailStatus.Disposable ||
                          //   item.email_status === EmailStatus.Blocked ||
                          //   item.email_status === EmailStatus.Invalid) &&
                          //   "  text-yellow-600 bg-yellow-600/20 font-extralight"
                        )}
                      >
                        {item.email_status}
                      </span>
                      <Select
                        onValueChange={(value) => {
                          const newData = data.map((dv) =>
                            dv.name === item.name
                              ? {
                                  ...dv,
                                  email_status: value as EmailStatus,
                                }
                              : dv
                          );
                          localStorage.setItem(
                            "scrapedData",
                            JSON.stringify(newData)
                          );
                          setData(newData);
                          setSelectedItem("");
                        }}
                      >
                        <SelectTrigger className=" w-full">
                          <SelectValue placeholder="Select a phone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Deliverable">
                            Deliverable
                          </SelectItem>
                          <SelectItem value="Undeliverable">
                            Undeliverable
                          </SelectItem>
                          <SelectItem value="Disposable">Disposable</SelectItem>
                          <SelectItem value="Invalid">Invalid</SelectItem>
                          <SelectItem value="Blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>{item.rating}</TableCell>
                    <TableCell>{item.reviewsCount}</TableCell>

                    <TableCell>
                      <div className=" w-full flex justify-center items-center">
                        {item.facebookUrl ? (
                          <Link href={item.facebookUrl}>
                            {" "}
                            <Facebook
                              className=" text-emerald-500 hover:text-emerald-600"
                              size={16}
                            />
                          </Link>
                        ) : (
                          <Info className=" text-muted-foreground" size={16} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className=" w-full flex justify-center items-center">
                        {item.instagramUrl ? (
                          <Link href={item.instagramUrl}>
                            {" "}
                            <Instagram
                              className=" text-emerald-500 hover:text-emerald-600"
                              size={16}
                            />
                          </Link>
                        ) : (
                          <Info className=" text-muted-foreground" size={16} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className=" w-full flex justify-center items-center">
                        {item.linkedinUrl ? (
                          <Link href={item.linkedinUrl}>
                            {" "}
                            <Linkedin
                              className=" text-emerald-500 hover:text-emerald-600"
                              size={16}
                            />
                          </Link>
                        ) : (
                          <Info className=" text-muted-foreground" size={16} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className=" w-full flex justify-center items-center">
                        {item.tiktokUrl ? (
                          <Link href={item.tiktokUrl}>
                            {" "}
                            <Unlink
                              className=" text-emerald-500 hover:text-emerald-600"
                              size={16}
                            />
                          </Link>
                        ) : (
                          <Info className=" text-muted-foreground" size={16} />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {item.website ? (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-500 flex items-center gap-2"
                        >
                          <Link2 size={16} />
                          Website
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {item.lead_scraped_at ? (
                        <span className=" px-2 py-1 font-medium">
                          {/* {format(new Date(item.lead_scraped_at), "dd MMM yyyy, hh:mm a")} */}
                          {formatSmartDate(item.lead_scraped_at)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <DynamicPagination
            totalItems={data.length}
            itemsPerPage={itemPerPage}
            currentPage={currentPage}
            setCurrentPage={(page: number) => setCurrentPage(page)}
          />
        </>
      )}
    </div>
  );
}

const SingleLeadSkeleton = () => {
  return (
    <TableRow>
      <TableCell h-16>
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell h-16>
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>

      <TableCell h-16>
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell h-16>
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
      <TableCell className="w-full h-16">
        <Skeleton className="w-full h-5 rounded-md" />
      </TableCell>
    </TableRow>
  );
};
