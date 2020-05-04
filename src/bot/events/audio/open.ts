import { Listener } from "../../../lib";

export default class OpenListener extends Listener {
  public constructor() {
    super("open", {
      event: "open",
      category: "audio",
      emitter: "music"
    });
  }

  public exec(name: string) {
    this.logger.info(`Now connected to lavalink node: ${name}`);
  }
}
