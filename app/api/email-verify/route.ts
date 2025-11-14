import { NextRequest, NextResponse } from "next/server";

import dns from "dns";
import { createSMTPClient } from "@/lib/smtp-client";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { code: 550, message: "Missing email" },
      { status: 400 }
    );
  }

  try {
    const mxRecords = await dns.promises.resolveMx(email.split("@")[1]);
    const client = await createSMTPClient({
      host: mxRecords[0].exchange,
      port: 25,
    });

    await client.connect();
    await client.greet();

    await client.mail("check@verifier.local");
    const rcptResp = await client.rcpt(email);
    await client.quit();

    return NextResponse.json({ success: true, ...rcptResp });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { code: 251, message: "Invalid" },
      { status: 500 }
    );
  }
}
