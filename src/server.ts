import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { BlinkAction } from "./action.js";
import type { ActionPostRequest, ActionError } from "./types.js";

// ────────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────────

const SOLANA_ACTION_VERSION = "1";
const BLOCKCHAIN_IDS = "solana:mainnet";

// ────────────────────────────────────────────────────────────────────────────────
// BlinkServer
// ────────────────────────────────────────────────────────────────────────────────

export class BlinkServer {
  public readonly app: Hono;
  private readonly actions: BlinkAction[] = [];

  constructor() {
    this.app = new Hono();
    this.setupCors();
  }

  // ──── CORS Middleware ──────────────────────────────────────────────────────

  private setupCors(): void {
    // Preflight + every response
    this.app.use("*", async (c, next) => {
      // Handle preflight OPTIONS
      if (c.req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: this.corsHeaders(),
        });
      }

      await next();

      // Attach CORS + Solana Action headers to every response
      const headers = this.corsHeaders();
      for (const [key, value] of Object.entries(headers)) {
        c.res.headers.set(key, value);
      }
    });
  }

  private corsHeaders(): Record<string, string> {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
      "X-Action-Version": SOLANA_ACTION_VERSION,
      "X-Blockchain-Ids": BLOCKCHAIN_IDS,
    };
  }

  // ──── Action Registration ─────────────────────────────────────────────────

  /**
   * Register a `BlinkAction` and auto-generate its GET (metadata) and
   * POST (transaction) routes.
   */
  register(action: BlinkAction): this {
    this.actions.push(action);

    const path = action.path;

    // GET — returns Action metadata JSON (Solana Actions spec)
    this.app.get(path, (c) => {
      return c.json(action.getMetadata());
    });

    // POST — validate, run handler, return transaction
    this.app.post(path, async (c) => {
      try {
        const body = (await c.req.json()) as ActionPostRequest & Record<string, unknown>;

        const account = body.account;
        if (!account || typeof account !== "string") {
          const err: ActionError = { message: "Missing or invalid `account` field." };
          return c.json(err, 400);
        }

        // Validate input through Zod schema if the action defines one
        const dataToValidate = body.data ?? body;
        const validation = action.validateInput(dataToValidate);

        if (!validation.success) {
          const zodErr = (validation as { success: false; error: { issues: { message: string }[] } }).error;
          const err: ActionError = {
            message: zodErr.issues.map((i) => i.message).join("; "),
          };
          return c.json(err, 422);
        }

        const result = await action.execute(account, body as Record<string, unknown>, validation.data);
        return c.json(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        const err: ActionError = { message };
        return c.json(err, 500);
      }
    });

    return this;
  }

  // ──── Direct route helpers ────────────────────────────────────────────────

  /** Expose the underlying Hono app for custom routes. */
  get hono(): Hono {
    return this.app;
  }

  // ──── actions.json ────────────────────────────────────────────────────────

  /**
   * Serve an `actions.json` manifest at the well-known path that
   * wallets use for discovery.
   */
  serveActionsJson(baseUrl: string): this {
    const rules = this.actions.map((a) => ({
      pathPattern: a.path,
      apiPath: `${baseUrl}${a.path}`,
    }));

    this.app.get("/actions.json", (c) => c.json({ rules }));
    return this;
  }

  // ──── Start ───────────────────────────────────────────────────────────────

  /**
   * Start the HTTP server.
   *
   * @param port - Port number (default `3000`)
   */
  start(port: number = 3000): void {
    serve(
      { fetch: this.app.fetch, port },
      (info) => {
        console.log(`🚀 BlinkKit server running on http://localhost:${info.port}`);
        console.log(`   Registered actions:`);
        for (const action of this.actions) {
          console.log(`     GET  ${action.path}  → metadata`);
          console.log(`     POST ${action.path}  → transaction`);
        }
      },
    );
  }
}
