import { type ZodSchema, type ZodError } from "zod";
import type { ActionGetResponse, ActionPostResponse, ActionError } from "./types.js";

// ────────────────────────────────────────────────────────────────────────────────
// Public types
// ────────────────────────────────────────────────────────────────────────────────

/** Metadata displayed on the Blink card. */
export interface ActionMeta {
  title: string;
  icon: string;
  description: string;
  label: string;
  disabled?: boolean;
  error?: ActionError;
  links?: ActionGetResponse["links"];
}

/** Context passed into the action handler. */
export interface HandlerContext<T = unknown> {
  /** Raw POST body */
  body: Record<string, unknown>;
  /** Wallet public key (base-58) */
  account: string;
  /** Validated & parsed input (only present when a Zod schema is provided) */
  validatedInput: T;
}

/** What the handler must return. */
export interface HandlerResult {
  /** Base-64 encoded serialized transaction */
  transaction: string;
  /** Optional human-readable message */
  message?: string;
}

export interface BlinkActionOptions<TSchema extends ZodSchema = ZodSchema> {
  /** Route path, e.g. "/donate" */
  path: string;
  /** Blink card metadata */
  meta: ActionMeta;
  /** Optional Zod schema to validate the POST body */
  validate?: TSchema;
  /** Business-logic handler that builds and returns a transaction */
  handler: (ctx: HandlerContext<TSchema extends ZodSchema<infer O> ? O : unknown>) => Promise<HandlerResult>;
}

// ────────────────────────────────────────────────────────────────────────────────
// BlinkAction class
// ────────────────────────────────────────────────────────────────────────────────

export class BlinkAction<TSchema extends ZodSchema = ZodSchema> {
  public readonly path: string;
  public readonly meta: ActionMeta;
  public readonly validate?: TSchema;
  public readonly handler: BlinkActionOptions<TSchema>["handler"];

  constructor(options: BlinkActionOptions<TSchema>) {
    // Normalise path so it always starts with `/`
    this.path = options.path.startsWith("/") ? options.path : `/${options.path}`;
    this.meta = options.meta;
    this.validate = options.validate;
    this.handler = options.handler;
  }

  /** Build the standard GET metadata response. */
  getMetadata(): ActionGetResponse {
    return {
      icon: this.meta.icon,
      title: this.meta.title,
      description: this.meta.description,
      label: this.meta.label,
      ...(this.meta.disabled !== undefined && { disabled: this.meta.disabled }),
      ...(this.meta.error && { error: this.meta.error }),
      ...(this.meta.links && { links: this.meta.links }),
    };
  }

  /** Validate an incoming body against the Zod schema (if provided). */
  validateInput(data: unknown): { success: true; data: unknown } | { success: false; error: ZodError } {
    if (!this.validate) return { success: true, data };
    return this.validate.safeParse(data) as
      | { success: true; data: unknown }
      | { success: false; error: ZodError };
  }

  /** Execute the handler with proper context. */
  async execute(account: string, body: Record<string, unknown>, validatedInput: unknown): Promise<ActionPostResponse> {
    const result = await this.handler({
      account,
      body,
      validatedInput: validatedInput as never,
    });
    return {
      transaction: result.transaction,
      ...(result.message && { message: result.message }),
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// Factory function
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Create a type-safe Solana Blink Action.
 *
 * @example
 * ```ts
 * import { createAction } from "blinkkit";
 * import { z } from "zod";
 *
 * const donate = createAction({
 *   path: "/donate",
 *   meta: {
 *     title: "Donate SOL",
 *     icon: "https://example.com/icon.png",
 *     description: "Send a donation",
 *     label: "Donate",
 *   },
 *   validate: z.object({ amount: z.number().positive() }),
 *   handler: async ({ account, validatedInput }) => {
 *     return { transaction: "<base64-tx>", message: `Thanks ${account}!` };
 *   },
 * });
 * ```
 */
export function createAction<TSchema extends ZodSchema>(
  options: BlinkActionOptions<TSchema>,
): BlinkAction<TSchema> {
  return new BlinkAction(options);
}
