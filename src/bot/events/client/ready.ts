import { Listener } from "../../../lib";

export default class ReadyListener extends Listener {
  public constructor() {
    super("ready", {
      event: "ready",
      category: "client"
    });
  }

  public async exec() {
    await this.helper.music.init("696575960971083776");
    this.logger.info("Now Ready.");
  }
}
