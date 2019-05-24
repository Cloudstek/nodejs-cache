import Test, { TestInterface } from "ava";
import MockDate = require("mockdate");
import moment = require("moment");

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

test("iterate over items using all", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar");
    c.set("pie", "apple");

    const all = c.all();

    t.is(typeof all, "object");
    t.is(Object.keys(all).length, 2);
    t.is(c.keys.length, 2);
    t.is(c.length, c.keys.length);

    t.snapshot(all);
});

test("iterate over some expired items using all", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar", 7200);
    c.set("pie", "apple", 7200);
    c.set("bleep", "bloop", 100);

    const allBeforeExpiration = c.all();

    t.is(typeof allBeforeExpiration, "object");
    t.is(Object.keys(allBeforeExpiration).length, 3);
    t.is(c.keys.length, 3);
    t.is(c.length, c.keys.length);

    t.snapshot(allBeforeExpiration);

    MockDate.set(moment().add(1, "hour"));

    const allAfterExpiration = c.all();

    t.is(typeof allAfterExpiration, "object");
    t.is(Object.keys(allAfterExpiration).length, 2);
    t.is(c.keys.length, 2);
    t.is(c.length, c.keys.length);

    t.snapshot(allAfterExpiration);
});

test("iterate over items using iterator", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar");
    c.set("pie", "apple");

    t.plan(4);
    t.is(c.keys.length, 2);
    t.is(c.length, c.keys.length);

    const items: { [key: string]: string } = {};

    for (const [key, value] of c) {
        items[key] = value;
    }

    t.deepEqual(items, c.all());
    t.snapshot(items);
});

test("iterate over some expired items using iterator", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar", 7200);
    c.set("pie", "apple", 7200);
    c.set("bleep", "bloop", 100);

    t.plan(8);
    t.is(c.keys.length, 3);
    t.is(c.length, c.keys.length);

    const itemsBeforeExpiration: { [key: string]: string } = {};

    for (const [key, value] of c) {
        itemsBeforeExpiration[key] = value;
    }

    t.deepEqual(itemsBeforeExpiration, c.all());
    t.snapshot(itemsBeforeExpiration);

    MockDate.set(moment().add(1, "hour"));

    t.is(c.keys.length, 2);
    t.is(c.length, c.keys.length);

    const itemsAfterExpiration: { [key: string]: string } = {};

    for (const [key, value] of c) {
        itemsAfterExpiration[key] = value;
    }

    t.deepEqual(itemsAfterExpiration, c.all());
    t.snapshot(itemsAfterExpiration);
});

test.after.always("cleanup", (t) => {
    util.cleanup(t);
});
