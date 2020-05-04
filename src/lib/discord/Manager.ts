import { REST } from "@klasa/rest";
import { VoiceState } from "lavaclient";
import { BotHelper } from "../framework";
import { SetupOptions, UserData, MemberData } from "../util";
import { GuildMember } from "./Member";
import { getPriority } from "os";

export class BotManager {
  public rest: REST;

  public voiceStates: Map<string, VoiceState> = new Map();
  public users: Map<string, UserData> = new Map();

  public constructor(public helper: BotHelper, options: SetupOptions) {
    this.rest = new REST(options.rest ?? {});
    this.rest.token = options.token;
  }

  public async fetchUser(id: string): Promise<UserData> {
    let user = this.users.get(id);
    if (user) return user;
    return (await this.rest.get(`/users/${id}`)) as UserData;
  }

  public async fetchMember(guild: string, user: string): Promise<GuildMember> {
    const member = await this.rest.get(`/guilds/${guild}/members/${user}`);
    return new GuildMember(this, member as MemberData);
  }
}
