import net from "net";
import tls from "tls";

interface SMTPOptions {
  host: string;
  port?: number;
  timeout?: number;
  useTLS?: boolean;
}

interface SMTPResponse {
  code: number;
  message: string;
}

export async function createSMTPClient(options: SMTPOptions) {
 
  let socket: net.Socket | tls.TLSSocket | null = null;

  async function connect(): Promise<void> {
    const { host, port = 25, useTLS = false, timeout = 8000 } = options;
    socket = useTLS
      ? tls.connect({ host, port, rejectUnauthorized: false })
      : net.createConnection({ host, port });

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Connection timeout")), timeout);

      socket!.once("data", (data) => {
        clearTimeout(timer);
        const response = data.toString();
        if (!response.startsWith("220")) reject(new Error("SMTP not ready: " + response));
        else resolve();
      });

      socket!.once("error", reject);
    });
  }

  async function send(command: string): Promise<SMTPResponse> {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error("Socket not connected"));
      socket.write(command + "\r\n");

      const onData = (data: Buffer) => {
        const response = data.toString();
        const code = parseInt(response.slice(0, 3), 10);
        console.log(code, response);
        socket?.off("data", onData);
        resolve({ code, message: response.trim() });
      };

      socket.on("data", onData);
      socket.once("error", reject);
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
