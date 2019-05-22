import Test, { TestInterface } from "ava";
import * as fs from "fs-extra";
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
        ttl: false,
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

    const contents = fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8");
    t.snapshot(contents);
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

    const contents = fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8");
    t.snapshot(contents);
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

    const contents = fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8");
    t.snapshot(contents);
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

    const contents = fs.readFileSync(path.join(t.context.options.dir, "cache.json"), "utf8");
    t.snapshot(contents);
});

test.after.always("cleanup", (t) => {
    util.cleanup(t);
});
