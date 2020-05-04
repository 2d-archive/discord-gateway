import Logger from "@ayanaware/logger";
import { Manager } from "lavaclient";
import { RESTPlugin } from "lavaclient-rest-plugin";

import { Shard, BotManager } from "../discord";
import { Config, GatewayCodes, SetupOptions } from "../util";
import { Loaders } from "./Loaders";

export class BotHelper {
  #token: string;

  public logger = Logger.get(BotHelper);
  public config = Config.getInstance();
  public manager: BotManager;
  public shard: Shard;
  public loaders: Loaders;
  public music: Manager;

  public constructor(directory: string) {
    this.music = new Manager(this.config.get("nodes"), {
      send: (_, { d }) =>
        this.shard.send(GatewayCodes.VOICE_STATE_UPDATE, { d }),
      plugins: [new RESTPlugin()]
    });

    this.loaders = new Loaders(this, directory);
  }

  public setup(options: SetupOptions) {
    this.#token = options.token;
    this.shard = new Shard({ captureRejections: true });
    this.manager = new BotManager(this, options);

    return this;
  }

  public async init() {
    await this.loaders.loadEvents({
      music: this.music,
      shard: this.shard,
    });

    await this.shard.login(this.#token);
    return this;
  }
}
