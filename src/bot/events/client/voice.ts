import { Listener } from "../../../lib";

export default class VoiceUpdatesListener extends Listener {
  public constructor() {
    super("debug", {
      event: ["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"],
      category: "client",
    });
  }

  public exec(event: string, update: any) {
    if (event === "VOICE_STATE_UPDATE") {
      this.helper.manager.voiceStates.set(update.user_id, update);
      this.helper.music.stateUpdate(update);
    } else this.helper.music.serverUpdate(update);

    return this.logger.debug("(VOICE) Provided voice updates to Lavaclient.");
  }
}
