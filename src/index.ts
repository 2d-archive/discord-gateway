import { BotHelper, Config } from "./lib";

new BotHelper(`${__dirname}/bot`)
  .setup(Config.getInstance().get("options"))
  .init();
