import { Duration } from "moment";

export interface ICacheOptions {
    /**
     * Cache file name.
     */
    name?: string | null;
    /**
     * Directory to save cache files.
     */
    dir?: string | null;
    /**
     * Default time to live for new cache items.
     */
    ttl?: number | Duration | false;
    /**
     * Automaitcally commit changes to file.
     *
     * When false, you have to commit changes to the cache store manually by calling store().
     */
    autoCommit?: boolean;
}

export interface ICacheItem<T> {
    expires: number | false;
    value: T;
}

export interface ICacheStore<T> extends Iterable<[string, T]> {
    /**
     * List all keys in cache store.
     */
    readonly keys: string[];

    /**
     * Number of items in cache store.
     */
    readonly length: number;

    /**
     * Check if cache store contains item by key.
     *
     * @param  key
     */
    has(key: string): boolean;

    /**
     * Get cache item
     *
     * @param  key
     */
    get(key: string): T;

    /**
     * Set cache item
     *
     * @param key
     * @param value
     * @param ttl   Time to live for this item
     */
    set(key: string, value: T, ttl?: number | Duration): void;

    /**
     * Unset cache item.
     *
     * @param key
     */
    unset(key: string): void;

    /**
     * Commit cache store to storage.
     */
    commit(): void;

    /**
     * Clear cache store.
     */
    clear(): void;
}
