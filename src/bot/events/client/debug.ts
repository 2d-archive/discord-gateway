import { Listener } from "../../../lib";

export default class DebugListener extends Listener {
  public constructor() {
    super("debug", {
      event: "debug",
      category: "client"
    });
  }

  public exec(msg: string) {
    this.logger.debug(msg);
  }
}
