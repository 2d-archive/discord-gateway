import { RESTOptions } from "@klasa/rest";

export interface Payload {
  op: number;
  t: string;
  s: number;
  d: Record<string, any> | any;
}

export type EventType = "on" | "off" | "once";
export interface EventOptions {
  type?: EventType;
  event: string | string[];
  emitter?: string;
  category?: string;
}

export interface SetupOptions {
  rest?: RESTOptions;
  token: string;
}

export interface MessageData {
  type: number;
  tts: boolean;
  timestamp: string;
  pinned: boolean;
  nonce: string;
  mentions: any[];
  mention_roles: any[];
  mention_everyone: boolean;
  member: MemberData;
  id: string;
  flags: number;
  embeds: any[];
  edited_timestamp: null;
  content: string;
  channel_id: string;
  author: UserData;
  attachments: any[];
  guild_id: string;
}

export interface MemberData {
  roles: string[];
  premium_since: number | null;
  nick: string | null;
  mute: boolean;
  joined_at: string;
  hoisted_role: string;
  deaf: boolean;
  user: UserData;
}

export interface UserData {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}
