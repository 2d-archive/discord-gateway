import WebSocket from "ws";
import { EventEmitter } from "events";
import Logger from "@ayanaware/logger";
import { clearInterval } from "timers";

import { GatewayCodes, VoiceCodes, properties, GatewayAddress } from "../util";
import { Payload } from "../util/Interfaces";

export class Shard extends EventEmitter {
  #ws: WebSocket;
  #token: string;

  public ping: number;

  private logger = Logger.custom("Socket", "discord", "");

  private sequence: number = 0;
  private closingSequence: number = 0;
  private session_id: string;

  private heartbeatInterval: number = 0;
  private lastHeartbeat: number = 0;
  private heartbeat: NodeJS.Timeout;
  private lastHeartbeatAcked: boolean = true;

  public get connected(): boolean {
    return this.#ws && this.#ws.readyState === WebSocket.OPEN;
  }

  public destroy(code = 1000, reset = false): Promise<boolean> {
    return new Promise(async (res, rej) => {
      try {
        if (this.#ws) {
          // Clear Heartbeat Interval.
          clearInterval(this.heartbeat);

          // Close
          if (this.connected) this.#ws.close(code);
          else {
            this.debug(`(SHARD) Socket State: ${this.#ws.readyState}`);
            this.#ws.removeAllListeners();

            try {
              this.#ws.close(code);
            } catch (error) {
              /** Do Nothing. */
            }
          }

          this.#ws = null;

          if (this.sequence !== -1) this.closingSequence = this.sequence;

          this.sequence = -1;
          this.session_id = null;

          res(true);
        }
      } catch (error) {
        this.logger.error(error);
        rej(false);
      }
    });
  }

  public send(op: GatewayCodes | VoiceCodes, payload: any) {
    return new Promise((resolve, reject) => {
      try {
        payload = JSON.stringify({ op, ...payload });
      } catch (error) {
        this.logger.error(error);
        return reject(error);
      }

      this.#ws.send(payload, (err) => (err ? reject(err) : resolve(true)));
    });
  }

  public login(token: string) {
    this.debug("(SHARD) Trying to login.");
    this.#token = token;
    this.declare();
  }

  private declare() {
    this.#ws = new WebSocket(`${GatewayAddress}?v=6&encoding=JSON`);
    this.#ws.on("message", this.onMessage.bind(this));
    this.#ws.on("close", this.onClose.bind(this));
    this.#ws.on("error", this.onError.bind(this));
  }

  private reconnect() {
    clearInterval(this.heartbeat);
    this.declare();
    return this.identify();
  }

  private identify() {
    if (this.session_id) {
      this.debug("Resuming Session");
      {
        return this.send(GatewayCodes.RESUME, {
          d: {
            token: this.#token,
            session_id: this.session_id,
            seq: this.closingSequence,
          },
        });
      }
    } else {
      this.debug(
        `(SHARD) Identifying with token (${this.#token.slice(0, 24)}...)`
      );
      {
        return this.send(GatewayCodes.IDENTIFY, {
          d: {
            properties: properties,
            token: this.#token,
          },
        });
      }
    }
  }

  private async onError(error: any) {
    this.logger.error(error);
    return this.reconnect();
  }

  private async onClose(event: Record<string, any>, ...args: any[]) {
    console.log(...args);
    if (this.sequence !== -1) this.closingSequence = this.sequence;

    this.debug(`(SHARD) Closed:
      Code: ${event.code}
      Reason: ${event.reason || "None"}
      Clean: ${event.wasClean}
      `);

    clearInterval(this.heartbeat);
    if (this.#ws) this.clean();

    this.emit("close", event);
  }

  private async onMessage(data: string) {
    const payload: Payload = JSON.parse(data);
    if (payload.s > this.sequence) this.sequence = payload.s;

    switch (payload.t) {
      case "READY":
        this.session_id = payload.d.session_id;
        this.emit("ready");
        break;
    }

    switch (payload.op) {
      case GatewayCodes.HELLO:
        this.heartbeatInterval = payload.d.heartbeat_interval;
        this.setHeartbeatInterval();
        this.identify();
        break;
      case GatewayCodes.RECONNECT:
        this.debug("(RECONNECT) Gateway asked to Reconnect.");
        this.destroy(4000);
        break;
      case GatewayCodes.INVALID_SESSION:
        this.debug(`(SHARD) Invalid Session. Resumable = ${payload.d}`);
        if (payload.d) this.identify();
        this.sequence = -1;
        this.session_id = null;
        break;
      case GatewayCodes.HEARTBEAT_ACK:
        this.ackHeartbeat();
        break;
      case GatewayCodes.HEARTBEAT:
        this.sendHeartbeat("Request");
        break;
    }

    this.emit(payload.t, payload.d);
  }

  private async setHeartbeatInterval() {
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.heartbeat = setInterval(
      () => this.sendHeartbeat(),
      this.heartbeatInterval
    );
  }

  private async ackHeartbeat() {
    this.lastHeartbeatAcked = true;
    this.ping = Date.now() - this.lastHeartbeat;
    this.debug(`(HEARTBEAT) Gateway acknowledged heartbeat. Latency: ${this.ping}ms`);
  }

  private async sendHeartbeat(type = "Timer") {
    if (!this.lastHeartbeatAcked) {
      this.debug(`(HEARTBEAT - ${type}) Assuming Zombie Connection`);
      return this.destroy(4000);
    }

    this.debug(`(HEARTBEAT - ${type}) Sending a Heartbeat.`);
    this.lastHeartbeatAcked = false;
    this.lastHeartbeat = Date.now();
    this.send(GatewayCodes.HEARTBEAT, { d: this.sequence });
  }

  private clean() {
    this.#ws.onopen = this.#ws.onclose = this.#ws.onerror = this.#ws.onmessage = null;
  }

  private debug(log: string) {
    this.emit("debug", log);
  }
}
