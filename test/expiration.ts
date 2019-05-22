import Test, { TestInterface } from "ava";
import * as fs from "fs-extra";
import * as MockDate from "mockdate";
import * as moment from "moment";
import * as path from "path";

import { Cache } from "../src/index";

import { ITestContext } from "./_types";
import * as util from "./_utils";

const test = Test as TestInterface<ITestContext>;

// Set context
test.before((t) => {
    t.context.dirs = [];
});

test.beforeEach((t) => {
    const dir = util.randomString();

    t.context.dirs.push(dir);
    t.context.options = {
        autoCommit: false,
        dir,
        ttl: 3600,
    };
});

test.serial("check expiration on new item", (t) => {
    const value = util.randomString();

    const c = new Cache<string>(t.context.options);

    c.set("foo", value);
    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), value);

    MockDate.set(moment().add(30, "minutes"));

    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), value);

    MockDate.set(moment().add(1, "hour"));

    t.false(c.has("foo"));
    t.is(c.keys.length, 0);
});

test.serial("check expiration on init", (t) => {
    const value = util.randomString();

    fs.ensureFileSync(path.join(t.context.options.dir, "cache.json"));
    fs.writeJsonSync(path.join(t.context.options.dir, "cache.json"), {
        foo: {
            expires: moment.utc().add(1, "hour").unix(),
            value,
        },
    });

    const c = new Cache<string>(t.context.options);

    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), value);

    MockDate.set(moment().add(30, "minutes"));

    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), value);

    MockDate.set(moment().add(1, "hour"));

    t.false(c.has("foo"));
    t.is(c.keys.length, 0);
});

test.serial("check never expiring item", (t) => {
    const value = util.randomString();

    const c = new Cache<string>(t.context.options);

    c.set("foo", value, false);
    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), value);

    MockDate.set(moment().add(1, "year"));

    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), value);
});

test.after.always("cleanup", (t) => {
    util.cleanup(t);
});

test.afterEach.always("cleanup", (t) => {
    MockDate.reset();
});
