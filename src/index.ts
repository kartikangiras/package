/**
 * blinkkit — A lightweight, type-safe SDK for building Solana Blinks.
 *
 * @packageDocumentation
 */

// Core factory
export { createAction } from "./action.js";
export { BlinkAction } from "./action.js";

// Server
export { BlinkServer } from "./server.js";

// Image generation
export { renderImage, generateBlinkImage } from "./image.js";

// Types
export type {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ActionError,
  LinkedAction,
  ActionParameter,
} from "./types.js";

export type {
  ActionMeta,
  HandlerContext,
  HandlerResult,
  BlinkActionOptions,
} from "./action.js";

export type { RenderImageOptions } from "./image.js";
