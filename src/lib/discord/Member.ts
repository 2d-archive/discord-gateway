import { UserData, MemberData } from "../util";
import { VoiceState } from "lavaclient";
import { BotManager } from "./Manager";

export class GuildMember {
  public user: UserData;
  public id: string;

  public constructor(public manager: BotManager, private _data: MemberData) {
    this.user = _data.user;
    this.id = _data.user.id;
  }

  public get voice(): VoiceState {
    return this.manager.voiceStates.get(this.id);
  }
}
