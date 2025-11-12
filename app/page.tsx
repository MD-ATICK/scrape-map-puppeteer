"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import logo from "@/assets/logo.svg";
import {
  Facebook,
  Info,
  Instagram,
  Link2,
  Linkedin,
  Loader,
  Network,
  Twitter,
  Unlink,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ScrapeResult } from "@/types";
import Link from "next/link";

export default function Page() {
  const [data, setData] = useState<ScrapeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("furniture");
  const [location, setLocation] = useState<string>("New York");
  const [maxScrape, setMaxScrape] = useState<string>("3");

  const [email, setEmail] = useState<string>("mdatick866@outlook.com");

  const handleScrape = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const startTime = Date.now();
    try {
      const res = await fetch("/api/map-scrape", {
        method: "POST",
        body: JSON.stringify({ search, location, maxScrape }),
        cache: "no-store",
      });
      const data = await res.json();
      setData((prev) => [...prev, ...data.data]);
      setLoading(false);
      const endTime = Date.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`Scraping completed in ${timeTaken} seconds.`);
      setTime(timeTaken);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleClick = async () => {
    const res = await fetch("/api/email-verify", {
      method: "POST",
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <div className="px-8">
      <div className="flex items-center border-b py-4 justify-between">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="logo" height={35} width={35} />
          <p className=" font-semibold text-lg">BearLead</p>
        </div>
        {!loading && time && (
          <p className=" text-muted-foreground text-sm">
            Scraping completed in {time} seconds.
          </p>
        )}
        <div className="flex items-center gap-3">
            <Input
              type="email"
              placeholder="Email "
              value={email}
              className=" w-72"
              onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={handleClick}>
                Verify
              </Button>
        </div>
        <form className="flex items-center gap-3" onSubmit={handleScrape}>
          <Input
            type="text"
            placeholder="Search "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            type="number"
            placeholder="maxScrape"
            value={maxScrape}
            className=" w-72"
            onChange={(e) => setMaxScrape(e.target.value)}
          />
          <Button type="submit" size={"sm"}>
            {/* {loading ? <Loader className=" animate-spin" /> : "Scrape"} */}
            New Scrape
          </Button>
        </form>
      </div>
      <br />

      {loading && (
        <div className="flex items-center text-sm gap-2 justify-center">
          <Loader size={16} className=" text-emerald-500 animate-spin" />
          Scraping Soon...
        </div>
      )}
      {data.length === 0 ? (
        <p className=" text-center p-4 text-sm">No Business Found</p>
      ) : (
        <>
          <div className=" flex items-center justify-between w-full">
            <h1 className="text-xl font-medium mb-4">
              Scraped Businesses ({data.length})
            </h1>
            <Button
              variant={"destructive"}
              size={"sm"}
              disabled={data.length === 0}
              onClick={() => setData([])}
            >
              Reset
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>scrapeNo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Reviews</TableHead>

                <TableHead>Facebook</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Linkedin</TableHead>
                <TableHead>Tiktok</TableHead>

                <TableHead>Website</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="scrollBarHidden">
              {data.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.scrapeNo}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.address}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{item.rating}</TableCell>
                  <TableCell>{item.reviewsCount}</TableCell>

                  <TableCell>
                    <div className=" w-full flex justify-center items-center">
                       {item.facebookUrl ? (
                      <Link href={item.facebookUrl}>
                        {" "}
                        <Facebook className=" text-emerald-500 hover:text-emerald-600" size={20} />
                      </Link>
                    ) : (
                      <Info className=" text-muted-foreground" size={20} />
                    )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className=" w-full flex justify-center items-center">
                       {item.instagramUrl ? (
                      <Link href={item.instagramUrl}>
                        {" "}
                        <Instagram className=" text-emerald-500 hover:text-emerald-600" size={20} />
                      </Link>
                    ) : (
                      <Info className=" text-muted-foreground" size={20} />
                    )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className=" w-full flex justify-center items-center">
                       {item.linkedinUrl ? (
                      <Link href={item.linkedinUrl}>
                        {" "}
                        <Linkedin className=" text-emerald-500 hover:text-emerald-600" size={20} />
                      </Link>
                    ) : (
                      <Info className=" text-muted-foreground" size={20} />
                    )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className=" w-full flex justify-center items-center">
                       {item.tiktokUrl ? (
                      <Link href={item.tiktokUrl}>
                        {" "}
                        <Unlink className=" text-emerald-500 hover:text-emerald-600" size={20} />
                      </Link>
                    ) : (
                      <Info className=" text-muted-foreground" size={20} />
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
                        <Link2 size={20} />
                        Website
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
