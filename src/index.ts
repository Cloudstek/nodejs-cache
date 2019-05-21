import * as moment from 'moment';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Duration } from 'moment';
import { CacheItem, CacheOptions, CacheStore } from './types';

export class Cache<T = unknown> implements CacheStore<T>
{
    private options: CacheOptions;
    private store: Record<string, CacheItem<T>>;

    public constructor(options?: CacheOptions)
    {
        this.store = {};
        this.options = Object.assign({}, {
            name: 'cache.json',
            dir: path.join(process.cwd(), '.cache'),
            ttl: 3600,
            autoCommit: true
        }, options);

        if (this.options.name !== null && this.options.dir !== null) {
            this.store = this.loadFromFile(path.join(this.options.dir, this.options.name));
        }
    }

    public has(key: string): boolean
    {
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

    public get(key: string): T | undefined
    {
        if (!this.has(key)) {
            return;
        }

        return this.store[key].value;
    }

    public set(key: string, value: T, ttl?: number | Duration | false): void
    {
        if (ttl === undefined) {
            ttl = this.options.ttl;
        }

        ttl = this.parseDuration(ttl);

        this.store[key] = {
            expires: ttl.asSeconds() <= 0 ? false : moment.utc().add(ttl).unix(),
            value: value
        };

        if (this.options.autoCommit === true) {
            this.commit();
        }
    }

    public unset(key: string): void
    {
        if (!this.store.hasOwnProperty(key)) {
            return;
        }

        delete this.store[key];

        if (this.options.autoCommit === true) {
            this.commit();
        }
    }

    public commit(): void
    {
        if (this.options.name === null || this.options.dir === null) {
            return;
        }

        fs.ensureDirSync(this.options.dir);
        fs.writeJsonSync(path.join(this.options.dir, this.options.name), this.store);
    }

    public clear(): void
    {
        this.store = {};

        if (this.options.autoCommit === true) {
            this.commit();
        }
    }

    public get keys(): string[]
    {
        return Object.keys(this.store);
    }

    *[Symbol.iterator](): Iterator<[string, T]> {
        for (let [key, value] of Object.entries(this.store)) {
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
    private parseDuration(duration: number | Duration | false): Duration
    {
        if (typeof duration === 'number') {
            if (duration < 0) {
                duration = 0;
            }

            return moment.duration(duration, 'seconds');
        }

        if (duration === false || duration.asSeconds() < 0) {
            return moment.duration(0, 'seconds');
        }

        return duration;
    }

    /**
     * Load cache store from file.
     *
     * @param path
     */
    private loadFromFile(path: string): Record<string, CacheItem<T>>
    {
        try {
            fs.statSync(path);
            return fs.readJsonSync(path);
        } catch(e) {
            return {};
        }
    }
}
