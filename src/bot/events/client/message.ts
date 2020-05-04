import { Listener, MessageData } from "../../../lib";
import { Message } from "../../../lib/discord/Message";

export default class MessageListener extends Listener {
  public constructor() {
    super("message", {
      event: "MESSAGE_CREATE",
      category: "client",
    });
  }

  public async exec(message: MessageData) {
    this.handle(await new Message(this.helper.manager, message)._patch());
  }

  public async handle(message: Message) {
    if (!message.guild_id || message.author.bot) return;
    if (!message.content.startsWith("vua!")) return;

    const [cmd, ...args] = message.content.slice(4).split(/ +/g);

    switch (cmd.toLowerCase()) {
      case "ping":
        message.sendMessage(
          `My ping is *${Math.round(this.helper.shard.ping)}ms*`
        );
        break;
      case "join":
        if (!message.member.voice || !message.member.voice.channel_id) return message.sendMessage("Please join a voice channel");

        await this.helper.music.join({
          channel: message.member.voice.channel_id,
          guild: message.guild_id,
        }, { deaf: true });

        message.sendMessage("Successfully Joined your Voice Channel.");
        break;
      case "play":
        let player = this.helper.music.players.get(message.guild_id);
        if (!player) return message.sendMessage("Please make me join a voice channel");

        const songs = await this.helper.music.resolve(args.join(" "));
        await player.play(songs.tracks[0].track);
        player.on("end", () => this.helper.music.leave(message.guild_id));
        break;
    }
  }
}
