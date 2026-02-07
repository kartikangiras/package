/**
 * Solana Action Spec type definitions.
 * @see https://docs.dialect.to/documentation/actions/specification
 */

/** Metadata returned by `GET /action` */
export interface ActionGetResponse {
  /** URL of the icon image for the Blink card */
  icon: string;
  /** Title displayed on the Blink card */
  title: string;
  /** Short description displayed on the Blink card */
  description: string;
  /** CTA button label */
  label: string;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Optional error to surface */
  error?: ActionError;
  /** Optional linked actions for multi-step flows */
  links?: {
    actions: LinkedAction[];
  };
}

/** A linked action that can appear as an additional button / input */
export interface LinkedAction {
  /** URL path for this linked action */
  href: string;
  /** Button label */
  label: string;
  /** Optional parameter inputs rendered as form fields */
  parameters?: ActionParameter[];
}

/** Parameter definition for action inputs */
export interface ActionParameter {
  /** Query-parameter name */
  name: string;
  /** Display label */
  label?: string;
  /** Whether this parameter is required */
  required?: boolean;
}

/** Body the wallet sends when executing a Blink */
export interface ActionPostRequest {
  /** Base-58 encoded public key of the user's wallet */
  account: string;
  /** Additional data sent along with the request */
  data?: Record<string, unknown>;
}

/** Response returned by `POST /action` */
export interface ActionPostResponse {
  /** Base-64 encoded serialized Solana transaction */
  transaction: string;
  /** Optional human-readable message */
  message?: string;
}

/** Standard error shape */
export interface ActionError {
  message: string;
}
