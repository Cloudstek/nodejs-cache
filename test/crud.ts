import Test, { TestInterface } from "ava";
import fs from "fs-extra";
import MockDate from "mockdate";
import moment from "moment";
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
    };
});

test("create item", (t) => {
    const c = new Cache<string>(t.context.options);

    t.false(c.has("foo"));
    t.is(c.keys.length, 0);

    c.set("foo", "bar");
    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), "bar");

    t.false(util.pathExists(t.context.options.dir, "cache.json"));
    c.commit();
    t.true(util.pathExists(t.context.options.dir, "cache.json"));

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("create item with autocommit", (t) => {
    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));

    t.false(c.has("foo"));
    t.is(c.keys.length, 0);

    c.set("foo", "bar");
    t.true(c.has("foo"));
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), "bar");

    t.true(util.pathExists(t.context.options.dir, "cache.json"));
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("create item with ttl as number", (t) => {
    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar", 7200);

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("create item with ttl as duration", (t) => {
    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar", moment.duration(2, "hours"));

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("create item with negative ttl as number", (t) => {
    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar", -100);

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("create item with negative ttl as duration", (t) => {
    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar", moment.duration(-10, "seconds"));

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("update item", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("pie", "apple");
    t.is(c.get("pie"), "apple");
    t.is(c.keys.length, 1);

    c.set("foo", "bar");
    t.is(c.get("foo"), "bar");
    t.is(c.keys.length, 2);

    c.set("foo", "bloop");
    t.is(c.get("pie"), "apple");
    t.is(c.get("foo"), "bloop");
    t.is(c.keys.length, 2);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));
    c.commit();
    t.true(util.pathExists(t.context.options.dir, "cache.json"));

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("update item with autocommit", (t) => {
    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));

    c.set("pie", "apple");
    t.is(c.get("pie"), "apple");
    t.is(c.keys.length, 1);

    t.true(util.pathExists(t.context.options.dir, "cache.json"));
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    c.set("foo", "bar");
    t.is(c.get("foo"), "bar");
    t.is(c.keys.length, 2);

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    c.set("foo", "bloop");
    t.is(c.get("pie"), "apple");
    t.is(c.get("foo"), "bloop");
    t.is(c.keys.length, 2);

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("delete item", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("pie", "apple");
    t.is(c.get("pie"), "apple");
    t.is(c.keys.length, 1);

    c.set("foo", "bar");
    t.is(c.get("foo"), "bar");
    t.is(c.keys.length, 2);

    c.unset("foo");
    t.false(c.has("foo"));
    t.is(c.get("pie"), "apple");
    t.is(c.keys.length, 1);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));
    c.commit();
    t.true(util.pathExists(t.context.options.dir, "cache.json"));

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("delete item with autocommit", (t) => {
    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));

    c.set("pie", "apple");
    t.is(c.get("pie"), "apple");
    t.is(c.keys.length, 1);

    c.set("foo", "bar");
    t.is(c.get("foo"), "bar");
    t.is(c.keys.length, 2);

    t.true(util.pathExists(t.context.options.dir, "cache.json"));
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    c.unset("foo");
    t.false(c.has("foo"));
    t.is(c.get("pie"), "apple");
    t.is(c.keys.length, 1);

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("delete non-existing item", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("pie", "apple");
    t.is(c.get("pie"), "apple");
    t.is(c.keys.length, 1);

    c.set("foo", "bar");
    t.is(c.get("foo"), "bar");
    t.is(c.keys.length, 2);

    c.unset("bleep");

    t.true(c.has("pie"));
    t.true(c.has("foo"));
    t.is(c.get("pie"), "apple");
    t.is(c.get("foo"), "bar");
    t.is(c.keys.length, 2);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));
    c.commit();
    t.true(util.pathExists(t.context.options.dir, "cache.json"));

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("delete non-existing item with autocommit", (t) => {
    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));

    c.set("pie", "apple");
    t.is(c.get("pie"), "apple");
    t.is(c.keys.length, 1);

    c.set("foo", "bar");
    t.is(c.get("foo"), "bar");
    t.is(c.keys.length, 2);

    t.true(util.pathExists(t.context.options.dir, "cache.json"));
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    c.unset("bleep");

    t.true(c.has("pie"));
    t.true(c.has("foo"));
    t.is(c.get("pie"), "apple");
    t.is(c.get("foo"), "bar");
    t.is(c.keys.length, 2);

    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));
});

test("clear store", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("pie", "apple");
    t.is(c.get("pie"), "apple");
    t.is(c.keys.length, 1);

    c.set("foo", "bar");
    t.is(c.get("foo"), "bar");
    t.is(c.keys.length, 2);

    c.clear();

    t.false(c.has("pie"));
    t.false(c.has("foo"));
    t.is(c.keys.length, 0);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));
    c.commit();
    t.true(util.pathExists(t.context.options.dir, "cache.json"));

    t.deepEqual(fs.readJsonSync(path.join(t.context.options.dir, "cache.json")), {});
});

test("clear store with autocommit", (t) => {
    t.context.options.autoCommit = true;
    const c = new Cache<string>(t.context.options);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));

    c.set("pie", "apple");
    t.is(c.get("pie"), "apple");
    t.is(c.keys.length, 1);

    c.set("foo", "bar");
    t.is(c.get("foo"), "bar");
    t.is(c.keys.length, 2);

    t.true(util.pathExists(t.context.options.dir, "cache.json"));
    t.snapshot(fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8"));

    c.clear();

    t.false(c.has("pie"));
    t.false(c.has("foo"));
    t.is(c.keys.length, 0);

    t.deepEqual(fs.readJsonSync(path.join(t.context.options.dir, "cache.json")), {});
});

test("commit without dir and filename set", (t) => {
    t.context.options.dir = null;
    t.context.options.name = null;

    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar");

    t.false(util.pathExists(t.context.options.dir, "cache.json"));
    c.commit();
    t.false(util.pathExists(t.context.options.dir, "cache.json"));
});

test("autocommit without dir and filename set", (t) => {
    t.context.options.dir = null;
    t.context.options.name = null;
    t.context.options.autoCommit = true;

    const c = new Cache<string>(t.context.options);

    t.false(util.pathExists(t.context.options.dir, "cache.json"));

    c.set("foo", "bar");

    t.false(util.pathExists(t.context.options.dir, "cache.json"));
});

test.after.always("cleanup", (t) => {
    util.cleanup(t);
});
