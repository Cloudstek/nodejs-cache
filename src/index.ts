import * as fs from "fs-extra";
import * as moment from "moment";
import { Duration } from "moment";
import * as path from "path";
import { ICacheItem, ICacheOptions, ICacheStore } from "./types";

export class Cache<T = unknown> implements ICacheStore<T> {
    private options: ICacheOptions;
    private store: Record<string, ICacheItem<T>>;

    public constructor(options?: ICacheOptions) {
        this.store = {};
        this.options = Object.assign({}, {
            autoCommit: true,
            dir: path.join(process.cwd(), ".cache"),
            name: "cache.json",
            ttl: 3600,
        }, options);

        if (this.options.name !== null && this.options.dir !== null) {
            this.store = this.loadFromFile(path.join(this.options.dir, this.options.name));
        }
    }

    public has(key: string): boolean {
        if (!this.store.hasOwnProperty(key)) {
            return false;
        }

        const item = this.store[key];

        // Check if item has expired, and if so, remove it.
        if (item.expires !== false && item.expires <= moment.utc().unix()) {
            delete this.store[key];

            if (this.options.autoCommit === true) {
                this.commit();
            }

            return false;
        }

        return true;
    }

    public all() {
        const entries = Object.entries(this.store);

        const values: any = {};

        for (const [key, value] of entries) {
            if (value.expires !== false && moment.unix(value.expires).utc() <= moment.utc()) {
                continue;
            }

            values[key] = value.value;
        }

        return values;
    }

    public get(key: string): T | undefined {
        if (!this.has(key)) {
            return;
        }

        return this.store[key].value;
    }

    public set(key: string, value: T, ttl?: number | Duration | false): void {
        if (ttl === undefined) {
            ttl = this.options.ttl;
        }

        ttl = this.parseDuration(ttl);

        this.store[key] = {
            expires: ttl.asSeconds() <= 0 ? false : moment.utc().add(ttl).unix(),
            value,
        };

        if (this.options.autoCommit === true) {
            this.commit();
        }
    }

    public unset(key: string): void {
        if (!this.store.hasOwnProperty(key)) {
            return;
        }

        delete this.store[key];

        if (this.options.autoCommit === true) {
            this.commit();
        }
    }

    public commit(): void {
        if (this.options.name === null || this.options.dir === null) {
            return;
        }

        fs.ensureDirSync(this.options.dir);
        fs.writeJsonSync(path.join(this.options.dir, this.options.name), this.store);
    }

    public clear(): void {
        this.store = {};

        if (this.options.autoCommit === true) {
            this.commit();
        }
    }

    public get keys(): string[] {
        let entries = Object.entries(this.store);

        entries = entries.filter((entry) => {
            if (entry[1].expires !== false && moment.unix(entry[1].expires).utc() <= moment.utc()) {
                return false;
            }

            return true;
        });

        return Object.keys(entries);
    }

    public get length(): number {
        return this.keys.length;
    }

    public *[Symbol.iterator](): Iterator<[string, T]> {
        const entries = Object.entries(this.store);

        for (const [key, value] of entries) {
            if (value.expires !== false && moment.unix(value.expires).utc() <= moment.utc()) {
                continue;
            }

            yield [key, value.value];
        }
    }

    /**
     * Parse duration
     *
     * @param duration Duration in seconds or as moment.js duration
     */
    private parseDuration(duration: number | Duration | false): Duration {
        if (typeof duration === "number") {
            if (duration < 0) {
                duration = 0;
            }

            return moment.duration(duration, "seconds");
        }

        if (duration === false || duration.asSeconds() < 0) {
            return moment.duration(0, "seconds");
        }

        return duration;
    }

    /**
     * Load cache store from file.
     *
     * @param p
     */
    private loadFromFile(file: string): Record<string, ICacheItem<T>> {
        try {
            fs.statSync(file);
            return fs.readJsonSync(file);
        } catch (e) {
            return {};
        }
    }
}
