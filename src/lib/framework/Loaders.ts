import { EventEmitter } from "events";
import { readdirSync, lstatSync } from "fs";
import { join } from "path";
import Logger from "@ayanaware/logger";

import { Listener } from "./Listener";
import { BotHelper } from "./Helper";

function recursive(directory: string, files: string[] = []): string[] {
  for (const path of readdirSync(directory)) {
    const fullPath = join(directory, path);
    if (path.endsWith(".js")) files.push(fullPath);
    else if (lstatSync(fullPath)) files.concat(recursive(fullPath, files));
  }

  return files;
}

export class Loaders {
  public logger = Logger.get(Loaders);
  public events: Map<string, Listener> = new Map();
  public constructor(public helper: BotHelper, public directory: string) {}

  public loadEvents(emitters: Record<string, EventEmitter>) {
    return new Promise((res) => {
      for (const filePath of recursive(join(this.directory, "events"))) {
        try {
          const lst: Listener = new (((_) => _.default)(require(filePath)))();
          this.events.set(`${lst.category}-${lst.name}`, lst._patch(this.helper));
          
          if (Array.isArray(lst.event))
            for (const evt of lst.event) {
              emitters[lst.emitter][lst.type](evt, lst.exec.bind(lst, evt));
            }
          else emitters[lst.emitter][lst.type](lst.event, lst.exec.bind(lst));
        } catch (error) {
          this.logger.error(error);
          continue;
        }
      }

      res(true);
    });
  }
}
