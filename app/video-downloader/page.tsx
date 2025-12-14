"use client"

import { Button } from "@/components/ui/button"


export default function page() {

    const url = "https://www.youtube.com/watch?v=MImVtCiRt0Q"
    const handleDownload = async () => {
        const res = await fetch("/api/video-downloader", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: url,
            }),
        })
        const data = await res.json()
        console.log(data)
    }

    return (
        <div className=" p-4">
            <Button onClick={handleDownload}>
                Download
            </Button>
        </div>
    )
}
