"use client";

import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import LeadView from "@/components/lead-view";
import FetchingView from "@/components/fetching-view";
import { FetchingDataType, ScrapeResultType } from "@/types";



export default function Page() {
  const [data, setData] = useState<ScrapeResultType[]>([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("furniture");
  const [location, setLocation] = useState<string>("New York");
  const [maxScrape, setMaxScrape] = useState<string>("10");
  const [fetchingData, setFetchingData] = useState<FetchingDataType[]>([]);
  const [downloadLimit, setDownloadLimit] = useState(data.length || 0);


  const [open, setOpen] = useState(true);

  const [email, setEmail] = useState<string>("mdatick866@outlook.com");

  const handleScrape = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const startTime = Date.now();
    try {
      const randomId = Math.random().toString(36).substring(2, 15);
      const currentFetching = {
        id: randomId,
        category: search,
        location: location,
        startedAt: startTime,
        consumedTime: 0,
        maxScrape: maxScrape,
        status: "pending",
      };
      setFetchingData((prev: FetchingDataType[]) => {
        localStorage.setItem(
          "fetchingData",
          JSON.stringify([...prev, currentFetching])
        );
        return [...prev, currentFetching];
      });

      localStorage.setItem("fetchingData", JSON.stringify(fetchingData));
     
      const res = await fetch("/api/map-scrape", {
        method: "POST",
        body: JSON.stringify({ search, location, maxScrape }),
        cache: "no-store",
      });

      const data = await res.json();
      const scarpedData = localStorage.getItem("scrapedData") || "[]";
      const parsedData = JSON.parse(scarpedData);
      const resultData = (data.data as ScrapeResultType[]).map((item) => ({...item, category: currentFetching.category }));
      parsedData.push(...resultData);
      setDownloadLimit(parsedData.length || 0);
      localStorage.setItem("scrapedData", JSON.stringify(parsedData));
      setData((prev) => [...prev, ...resultData]);
      setLoading(false);
      setFetchingData((prev) => {
        const newData = prev.map((item) => {
          if (item.id === randomId) {
            return {
              ...item,
              consumedTime: Date.now() - item.startedAt,
              status: "success",
              scrapedDataCount: Number(data.total)
            };
          }
          return item;
        });

        localStorage.setItem("fetchingData", JSON.stringify(newData));
        return newData;
      });
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

  const handleDownload = async () => {
    const valuesArray = data.slice(0, downloadLimit).map((item) => Object.values(item));
    const header = Object.keys(data[0]);
    delete header[0];
    const csv = [header, ...valuesArray]
      .map((row) =>
        row
          .slice(1)
          .map((col) => col?.toString().split(",").join(" "))
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv.toString()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const randomId = Math.random().toString(36).substring(2, 15);
    a.download = `b2b-google-map-lead-${randomId}.csv`;
    a.click();
  };

  useEffect(() => {
    const storedScrapedData = JSON.parse(
      localStorage.getItem("scrapedData") || "[]"
    );
    setData(storedScrapedData);
    setDownloadLimit(storedScrapedData.length || 0);

    const storedFetchingData = JSON.parse(
      localStorage.getItem("fetchingData") || "[]"
    );
    setFetchingData(storedFetchingData);
  }, []);

  return (
    <div className="px-8 space-y-2">
      {/* MAIN HEADER */}
      <header className="flex items-center border-b py-4 justify-between">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="logo" height={25} width={25} />
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
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button size={"sm"} onClick={handleClick}>
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
          <Button type="submit" size={"sm"} disabled={loading}>
            {/* {loading ? <Loader className=" animate-spin" /> : "Scrape"} */}
            New Scrape
          </Button>
        </form>
      </header>

      <div className=" flex relative">
        {/* LEAD VIEW */}
        <LeadView
          data={data}
          downloadLimit={downloadLimit}
          setDownloadLimit={setDownloadLimit}
          handleDownload={handleDownload}
          setData={setData}
          loading={loading}
          open={open}
          setOpen={setOpen}
        />

        {/* FETCHING VIEW */}
        <FetchingView
          fetchingData={fetchingData}
          setFetchingData={setFetchingData}
          open={open}
        />
      </div>
    </div>
  );
}
