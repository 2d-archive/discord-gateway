import { UserData, MessageData } from "../util";
import { GuildMember } from "./Member";
import { BotManager } from "./Manager";

export class Message {
  public author: UserData;
  public member: GuildMember;

  public guild_id: string;
  public tts: boolean;
  public createdAt: Date;
  public pinned: boolean;
  public nonce: string;
  public id: string;
  public content: string;

  public constructor(public manager: BotManager, private _data: MessageData) {
    this.tts = _data.tts ?? false;
    this.createdAt = new Date(_data.timestamp ?? Date.now());
    this.pinned = _data.pinned ?? false;
    this.nonce = _data.nonce;
    this.id = _data.id;
    this.content = _data.content;
    this.guild_id = _data.guild_id;
  }

  async _patch() {
    this.author = await this.manager.fetchUser(this._data.author.id);
    if (this._data.guild_id) {
      this.member = await this.manager.fetchMember(
        this._data.guild_id,
        this._data.author.id
      );
    }
    return this;
  }

  public async sendMessage(content: string) {
    return this.manager.rest.post(
      `/channels/${this._data.channel_id}/messages`,
      {
        data: {
          content,
        },
      }
    );
  }
}
