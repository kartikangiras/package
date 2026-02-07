import { type ZodSchema, type ZodError } from "zod";
import type { ActionGetResponse, ActionPostResponse, ActionError } from "./types.js";

export interface ActionMeta {
  title: string;
  icon: string;
  description: string;
  label: string;
  disabled?: boolean;
  error?: ActionError;
  links?: ActionGetResponse["links"];
}

export interface HandlerContext<T = unknown> {
  body: Record<string, unknown>;
  account: string;
  validatedInput: T;
}
export interface HandlerResult {
  transaction: string;
  message?: string;
}

export interface BlinkActionOptions<TSchema extends ZodSchema = ZodSchema> {
  path: string;
  meta: ActionMeta;
  validate?: TSchema;
  handler: (ctx: HandlerContext<TSchema extends ZodSchema<infer O> ? O : unknown>) => Promise<HandlerResult>;
}

export class BlinkAction<TSchema extends ZodSchema = ZodSchema> {
  public readonly path: string;
  public readonly meta: ActionMeta;
  public readonly validate?: TSchema;
  public readonly handler: BlinkActionOptions<TSchema>["handler"];

  constructor(options: BlinkActionOptions<TSchema>) {
    this.path = options.path.startsWith("/") ? options.path : `/${options.path}`;
    this.meta = options.meta;
    this.validate = options.validate;
    this.handler = options.handler;
  }

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

  validateInput(data: unknown): { success: true; data: unknown } | { success: false; error: ZodError } {
    if (!this.validate) return { success: true, data };
    return this.validate.safeParse(data) as
      | { success: true; data: unknown }
      | { success: false; error: ZodError };
  }

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

export function createAction<TSchema extends ZodSchema>(
  options: BlinkActionOptions<TSchema>,
): BlinkAction<TSchema> {
  return new BlinkAction(options);
}
