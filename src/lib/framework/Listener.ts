import Logger from "@ayanaware/logger";

import { BotHelper } from "./Helper";
import { EventType, EventOptions } from "../util";

export abstract class Listener {
  public helper: BotHelper;
  public logger = Logger.custom(
    () => this.name,
    "vua",
    () => `listeners.${this.category}.`
  );

  public type: EventType;
  public category: string;
  public emitter: string;
  public event: string | string[];
  public abstract exec(...args: any[]): any;

  public constructor(public name: string, options: EventOptions) {
    this.type = options.type ?? "on";
    this.emitter = options.emitter ?? "shard";
    this.event = options.event;
    this.category = options.category ?? "default"
  }

  _patch(helper: BotHelper) {
    this.helper = helper;
    return this;
  }
}
