import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
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
import { ScrapeResultType } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { DynamicPagination } from "./dynamic-pagination";
import {  useState } from "react";
import { Input } from "./ui/input";
import { format } from "date-fns";

type Props = {
  data: ScrapeResultType[];
  setData: (data: ScrapeResultType[]) => void;
  loading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleDownload : () => void;
  downloadLimit: number;
  setDownloadLimit: (limit: number) => void;
};
export default function LeadView({
  data,
  setData,
  loading,
  handleDownload,
  downloadLimit,
  setDownloadLimit
}: Props) {

  const [currentPage, setCurrentPage] = useState(1);

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
              <Input type="number" placeholder="Limit" value={downloadLimit} onChange={(e) => setDownloadLimit(Number(e.target.value))} />
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
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
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
              {data.slice((currentPage - 1) * 20, currentPage * 20).map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category || ''}</TableCell>
                  <TableCell> {item.address && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={"outline"} onClick={() => {
                            navigator.clipboard.writeText(item.address || "");
                            toast.success("Copied!");
                          }}>
                            <LocationEdit size={15} />
                            Address
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent> {item.address} </TooltipContent>
                      </Tooltip>
                    )}</TableCell>
                  <TableCell>
                    {item.email && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={"outline"} onClick={() => {
                            navigator.clipboard.writeText(item.email || "");
                            toast.success("Copied!");
                          }}>
                            <Mail size={15} />
                            Email
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent> {item.email} </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>{item.status_code}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        " text-xs px-2 py-1 font-medium",
                        item.status_code === 250 &&
                          "bg-emerald-600/20 text-emerald-600",
                        item.status_code === 251 &&
                          " bg-yellow-600/20 text-yellow-600 font-light",
                        (item.status_code === 550 ||
                          item.status_code === 551) &&
                          "  text-yellow-600 bg-yellow-600/20 font-extralight"
                      )}
                    >
                      {item.email_status}
                    </span>
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
          <DynamicPagination totalItems={data.length} itemsPerPage={20} currentPage={currentPage} setCurrentPage={(page: number) => setCurrentPage(page)} />
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
