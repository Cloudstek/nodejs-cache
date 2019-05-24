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

    MockDate.set(moment.utc("2019-01-01T14:00:00").valueOf());

    t.context.dirs.push(dir);
    t.context.options = {
        autoCommit: false,
        dir,
        ttl: 3600,
    };
});

test("check expiration on new item", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("apple", "pie", 7200);
    c.set("strawberry", "cake");
    c.set("foo", "bar");

    t.true(c.has("apple"));
    t.true(c.has("strawberry"));
    t.true(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), "cake");
    t.is(c.get("foo"), "bar");

    t.is(c.keys.length, 3);

    MockDate.set(moment().add(30, "minutes"));

    t.true(c.has("apple"));
    t.true(c.has("strawberry"));
    t.true(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), "cake");
    t.is(c.get("foo"), "bar");

    t.is(c.keys.length, 3);

    MockDate.set(moment().add(1, "hour"));

    t.true(c.has("apple"));
    t.false(c.has("strawberry"));
    t.false(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), undefined);
    t.is(c.get("foo"), undefined);

    t.is(c.keys.length, 1);

    MockDate.set(moment().add(2, "hours"));

    t.false(c.has("apple"));
    t.is(c.get("foo"), undefined);

    t.is(c.keys.length, 0);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));
    c.commit();
    t.true(util.pathExists(t.context.options.dir, "cache.json"));

    t.deepEqual(fs.readJsonSync(path.join(t.context.options.dir, "cache.json")), {});
});

test("check expiration on new item with autocommit", (t) => {
    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));

    c.set("apple", "pie", 7200);
    c.set("strawberry", "cake");
    c.set("foo", "bar");

    t.true(c.has("apple"));
    t.true(c.has("strawberry"));
    t.true(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), "cake");
    t.is(c.get("foo"), "bar");

    t.is(c.keys.length, 3);
    t.true(util.pathExists(t.context.options.dir, "cache.json"));
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    MockDate.set(moment().add(30, "minutes"));

    t.true(c.has("apple"));
    t.true(c.has("strawberry"));
    t.true(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), "cake");
    t.is(c.get("foo"), "bar");

    t.is(c.keys.length, 3);
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    MockDate.set(moment().add(1, "hour"));

    t.true(c.has("apple"));
    t.false(c.has("strawberry"));
    t.false(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), undefined);
    t.is(c.get("foo"), undefined);

    t.is(c.keys.length, 1);
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    MockDate.set(moment().add(2, "hours"));

    t.false(c.has("apple"));
    t.is(c.get("foo"), undefined);

    t.is(c.keys.length, 0);

    t.deepEqual(fs.readJsonSync(path.join(t.context.options.dir, "cache.json")), {});
});

test("check expiration on init", (t) => {
    fs.ensureFileSync(path.join(t.context.options.dir, "cache.json"));
    fs.writeJsonSync(path.join(t.context.options.dir, "cache.json"), {
        apple: {
            expires: moment.utc().add(2, "hour").unix(),
            value: "pie",
        },
        foo: {
            expires: moment.utc().add(1, "hour").unix(),
            value: "bar",
        },
        strawberry: {
            expires: moment.utc().add(1, "hour").unix(),
            value: "cake",
        },
    });

    const contents = fs.readJsonSync(path.join(t.context.options.dir, "cache.json"));

    const c = new Cache<string>(t.context.options);

    t.true(c.has("apple"));
    t.true(c.has("strawberry"));
    t.true(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), "cake");
    t.is(c.get("foo"), "bar");

    t.is(c.keys.length, 3);
    // Contents of file should not have changed with autoCommit disabled
    t.deepEqual(fs.readJsonSync(path.join(t.context.options.dir, "cache.json")), contents);

    MockDate.set(moment().add(30, "minutes"));

    t.true(c.has("apple"));
    t.true(c.has("strawberry"));
    t.true(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), "cake");
    t.is(c.get("foo"), "bar");

    t.is(c.keys.length, 3);
    // Contents of file should not have changed with autoCommit disabled
    t.deepEqual(fs.readJsonSync(path.join(t.context.options.dir, "cache.json")), contents);

    MockDate.set(moment().add(1, "hour"));

    t.true(c.has("apple"));
    t.false(c.has("strawberry"));
    t.false(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), undefined);
    t.is(c.get("foo"), undefined);

    t.is(c.keys.length, 1);
    // Contents of file should not have changed with autoCommit disabled
    t.deepEqual(fs.readJsonSync(path.join(t.context.options.dir, "cache.json")), contents);

    MockDate.set(moment().add(2, "hours"));

    t.false(c.has("apple"));
    t.is(c.get("foo"), undefined);

    t.is(c.keys.length, 0);

    // Contents of file should not have changed with autoCommit disabled
    t.deepEqual(fs.readJsonSync(path.join(t.context.options.dir, "cache.json")), contents);

    c.commit();

    // Contents should now been written
    t.deepEqual(fs.readJsonSync(path.join(t.context.options.dir, "cache.json")), {});
});

test("check expiration on init with autocommit", (t) => {
    fs.ensureFileSync(path.join(t.context.options.dir, "cache.json"));
    fs.writeJsonSync(path.join(t.context.options.dir, "cache.json"), {
        apple: {
            expires: moment.utc().add(2, "hour").unix(),
            value: "pie",
        },
        foo: {
            expires: moment.utc().add(1, "hour").unix(),
            value: "bar",
        },
        strawberry: {
            expires: moment.utc().add(1, "hour").unix(),
            value: "cake",
        },
    });

    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    t.true(c.has("apple"));
    t.true(c.has("strawberry"));
    t.true(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), "cake");
    t.is(c.get("foo"), "bar");

    t.is(c.keys.length, 3);
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    MockDate.set(moment().add(30, "minutes"));

    t.true(c.has("apple"));
    t.true(c.has("strawberry"));
    t.true(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), "cake");
    t.is(c.get("foo"), "bar");

    t.is(c.keys.length, 3);
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    MockDate.set(moment().add(1, "hour"));

    t.true(c.has("apple"));
    t.false(c.has("strawberry"));
    t.false(c.has("foo"));

    t.is(c.get("apple"), "pie");
    t.is(c.get("strawberry"), undefined);
    t.is(c.get("foo"), undefined);

    t.is(c.keys.length, 1);
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    MockDate.set(moment().add(2, "hours"));

    t.false(c.has("apple"));
    t.is(c.get("foo"), undefined);

    t.is(c.keys.length, 0);
    t.deepEqual(fs.readJsonSync(path.join(t.context.options.dir, "cache.json")), {});
});

test("check never expiring item", (t) => {
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
