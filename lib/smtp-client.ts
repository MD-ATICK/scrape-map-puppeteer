import net from "net";
import tls from "tls";

interface SMTPOptions {
  host: string;
  port?: number;
  timeout?: number;
  useTLS?: boolean;
}

interface SMTPResponse {
  message: string;
}

function formatResponse(response: string) {
  const checkBlocked = response.includes("550 5.7.1");
  const deliverable = response.includes("250 2.1.5");
  const undeliverable = response.includes("550-5.1.1");
  const disposable = response.includes("250 recipient");
  switch (true) {
    case checkBlocked:
      return {
        message: "Blocked",
      };
    case deliverable:
      return {
        message: "Deliverable",
      };
    case undeliverable:
      return {
        message: "Undeliverable",
      };
    case disposable:
      return {
        message: "Disposable",
      };
    default:
      return {
        message: "Undeliverable",
      };
  }
}

export async function createSMTPClient(options: SMTPOptions) {
  let socket: net.Socket | tls.TLSSocket | null = null;
  let response: string;

  async function connect(): Promise<void> {
    const { host, port = 25, useTLS = false, timeout = 8000 } = options;
    socket = useTLS
      ? tls.connect({ host, port, rejectUnauthorized: false })
      : net.createConnection({ host, port });

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Connection timeout")),
        timeout
      );

      socket!.once("data", (data) => {
        clearTimeout(timer);
        const response = data.toString();
        if (!response.startsWith("220")) {
          console.log("SMTP Server response:", response);
          reject(null);
        } else resolve();
      });

      socket!.once("error", reject);
    });
  }

  async function send(command: string): Promise<SMTPResponse> {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error("Socket not connected"));
      socket.write(command + "\r\n");

      const onData = (data: Buffer) => {
        response = data.toString();
        const message = formatResponse(response);
        resolve(message);
        socket?.off("data", onData);
      };

      socket.on("data", onData);
      socket.once("error", reject);
      socket.on("end", () => {
        const message = formatResponse(response);
        resolve(message);
      });
    });
  }

  async function greet(hostname = "verifier.local") {
    return send(`EHLO ${hostname}`);
  }

  async function mail(from: string) {
    return send(`MAIL FROM:<${from}>`);
  }

  async function rcpt(to: string) {
    return send(`RCPT TO:<${to}>`);
  }

  async function quit() {
    try {
      await send("QUIT");
    } catch {
    } finally {
      socket?.end();
    }
  }

  return { connect, greet, mail, rcpt, quit };
}
