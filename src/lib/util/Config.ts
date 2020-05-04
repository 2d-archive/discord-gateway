/**
 * @file A configuration helper
 * @author MeLike2D
 */

import Logger from "@ayanaware/logger";
import * as dotprop from "dot-prop";
import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";

type node_env = "production" | "development";

const logger = Logger.get("Config");

/**
 * A class to help with configuration.
 * @since 3.0.0
 */
export class Config {
  private static _config: Config;

  public parsed: Record<string, any>;
  readonly #nodeEnv = Config.determineNodeEnv();
  readonly #path = path.join(process.cwd(), "config.yml");

  private constructor() {
    this.parse();
  }

  public parse(): void {
    if (!fs.existsSync(this.#path)) {
      logger.error("Please create a 'config.yml'");

      return process.exit(1);
    }

    const data = fs.readFileSync(this.#path, { encoding: "utf8" });
    this.parsed = YAML.parse(data);
  }

  /**
   * Gets a value from the 'config.yml'
   * @param path - A path to the desired value.
   */
  public get<T>(path: string): T {
    return dotprop.get(this.parsed, path);
  }

  /**
   * Gets a value from the 'config.yml' based on the node environment.
   * @param path - The path to the desired value.
   */
  public getEnv<T>(path: string): T {
    const found = dotprop.get<any>(this.parsed, path);

    return found[this.#nodeEnv];
  }

  /**
   * Set something in the config... for whatever reason.
   * @param path - Path to the value you want to overwrite/set.
   * @param value - The value.
   */
  public set(path: string, value: any): void {
    dotprop.set(this.parsed, path, value);
    fs.writeFileSync(this.#path, YAML.stringify(this.parsed), {
      encoding: "utf8",
    });

    this.parse();
  }

  /**
   * Delete something from the config... for yet again some random ass reason.
   * @param path - Path to the value you want to delete.
   */
  public delete(path: string): void {
    dotprop.delete(this.parsed, path);
    fs.writeFileSync(this.#path, YAML.stringify(this.parsed), {
      encoding: "utf8",
    });

    this.parse();
  }

  /**
   * Get an instance of Config.
   */
  public static getInstance(): Config {
    if (!Config._config) {
      Config._config = new Config();

      return Config._config;
    }

    return Config._config;
  }

  public static determineNodeEnv(): node_env {
    if (process.env.NODE_ENV) return process.env.NODE_ENV as node_env;

    const flag = ["development", "production"].find((f) =>
      process.argv.includes(`--${f}`)
    );
    return (flag ?? "production") as node_env;
  }
}
