import Test, { TestInterface } from "ava";
import fs from "fs-extra";
import MockDate from "mockdate";
import moment from "moment";
import path from "path";

import { Cache } from "../src/index";

import { ITestContext } from "./_types";
import * as util from "./_utils";

const test = Test as TestInterface<ITestContext>;

// Set context
test.before((t) => {
    t.context.dirs = [];
});

test.beforeEach(() => {
    MockDate.set(moment.utc("2019-01-01T14:00:00").valueOf());
});

// Defaults
test.serial("init with defaults", (t) => {
    const c = new Cache<string>();

    t.not(undefined, c);
    t.is(c.keys.length, 0);
});

test.serial("load on init with defaults", (t) => {
    const value = util.randomString();

    fs.ensureFileSync(path.join(".cache", "cache.json"));
    fs.writeJsonSync(path.join(".cache", "cache.json"), {
        foo: {
            expires: false,
            value,
        },
    });

    const c = new Cache<string>();

    t.not(undefined, c);
    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), value);
});

test.serial("load on init with object as value", (t) => {
    const value = util.randomString();

    fs.ensureFileSync(path.join(".cache", "cache.json"));
    fs.writeJsonSync(path.join(".cache", "cache.json"), {
        foo: {
            expires: false,
            value: {
                bar: value,
            },
        },
    });

    const c = new Cache<object>();

    t.not(undefined, c);
    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is("object", typeof c.get("foo"));
    t.deepEqual(c.get("foo"), { bar: value });
});

// Custom dir
test.serial("init with custom dir", (t) => {
    const dir = util.randomString();
    t.context.dirs.push(dir);

    const c = new Cache<string>({ dir });

    t.not(undefined, c);
    t.false(util.pathExists(dir));
    t.is(c.keys.length, 0);
});

test.serial("load on init with custom dir", (t) => {
    const dir = util.randomString();
    const value = util.randomString();
    t.context.dirs.push(dir);

    fs.ensureFileSync(path.join(dir, "cache.json"));
    fs.writeJsonSync(path.join(dir, "cache.json"), {
        foo: {
            expires: false,
            value,
        },
    });

    const c = new Cache<string>({ dir });

    t.not(undefined, c);
    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), value);
});

// Custom dir and name
test.serial("init with custom dir and name", (t) => {
    const dir = util.randomString();
    const file = util.randomString();
    t.context.dirs.push(dir);

    const c = new Cache<string>({ dir, name: file });

    t.not(undefined, c);
    t.false(util.pathExists(dir));
    t.is(c.keys.length, 0);
});

test.serial("load on init with custom dir and name", (t) => {
    const dir = util.randomString();
    const file = util.randomString();
    const value = util.randomString();
    t.context.dirs.push(dir);

    fs.ensureFileSync(path.join(dir, file));
    fs.writeJsonSync(path.join(dir, file), {
        foo: {
            expires: false,
            value,
        },
    });

    const c = new Cache<string>({ dir, name: file });

    t.not(undefined, c);
    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), value);
});

test.after.always("cleanup", (t) => {
    util.cleanup(t);
});
