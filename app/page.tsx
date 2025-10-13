"use client";

import { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScrapeResult = {
	name: string | null;
	address: string | null;
	phone: string | null;
	website: string | null;
};

export default function Page() {
	const [data, setData] = useState<ScrapeResult[]>([]);
	const [loading, setLoading] = useState(false);

	const handleScrape = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/test");
			const data = await res.json();
			setData(data.data || []);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching data:", error);
			setLoading(false);
		}
	};
	// useEffect(() => {
	// 	fetch("/api/test")
	// 		.then(res => res.json())
	// 		.then(res => {
	// 			setData(res.data || []);
	// 			setLoading(false);
	// 		});
	// }, []);

	return (
		<div className='p-8'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-semibold mb-4'>Scraped Businesses</h1>
				<Button size={"sm"} disabled={loading} onClick={handleScrape}>
					{loading ? <Loader className=' animate-spin' /> : "Scrape"}
				</Button>
			</div>
			<br />
			{loading ? (
				<div className='flex items-center text-sm gap-2'>
					<Loader size={16} className=' text-emerald-500 animate-spin' />
					Scraping Soon...
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Address</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Website</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className='scrollBarHidden'>
						{data.map((item, idx) => (
							<TableRow key={idx}>
								<TableCell>{item.name}</TableCell>
								<TableCell>{item.address}</TableCell>
								<TableCell>{item.phone}</TableCell>
								<TableCell>
									{item.website ? (
										<a
											href={item.website}
											target='_blank'
											rel='noopener noreferrer'
											className='text-blue-600 underline'
										>
											{item.website}
										</a>
									) : (
										"-"
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
