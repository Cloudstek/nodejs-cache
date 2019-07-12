import Test, { TestInterface } from "ava";
import MockDate from "mockdate";
import moment from "moment";

import { Cache } from "../src/index";

import { ITestContext } from "./_types";
import * as util from "./_utils";

const test = Test as TestInterface<ITestContext>;

// Set context
test.before((t) => {
    t.context.dirs = [];
});

test.beforeEach(() => {
    MockDate.set(moment.utc("2019-01-01T14:00:00").toDate());
});

// Undefined / null dir and name
test("init with undefined dir", (t) => {
    const c = new Cache<string>({ dir: undefined });

    t.not(undefined, c);
    t.is(c.keys.length, 0);

    c.set("foo", "bar");
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), "bar");

    t.notThrows(() => {
        c.commit();
    });
});

test("init with undefined name", (t) => {
    const c = new Cache<string>({ name: undefined });

    t.not(undefined, c);
    t.is(c.keys.length, 0);

    c.set("foo", "bar");
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), "bar");

    t.notThrows(() => {
        c.commit();
    });
});

test("init with undefined dir and name", (t) => {
    const c = new Cache<string>({ dir: undefined, name: undefined });

    t.not(undefined, c);
    t.is(c.keys.length, 0);

    c.set("foo", "bar");
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), "bar");

    t.notThrows(() => {
        c.commit();
    });
});

test("init with null dir", (t) => {
    const c = new Cache<string>({ dir: null });

    t.not(undefined, c);
    t.is(c.keys.length, 0);

    c.set("foo", "bar");
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), "bar");

    t.notThrows(() => {
        c.commit();
    });
});

test("init with null name", (t) => {
    const c = new Cache<string>({ name: null });

    t.not(undefined, c);
    t.is(c.keys.length, 0);

    c.set("foo", "bar");
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), "bar");

    t.notThrows(() => {
        c.commit();
    });
});

test("init with null dir and name", (t) => {
    const c = new Cache<string>({ dir: null, name: null });

    t.not(undefined, c);
    t.is(c.keys.length, 0);

    c.set("foo", "bar");
    t.is(c.keys.length, 1);
    t.is(c.get("foo"), "bar");

    t.notThrows(() => {
        c.commit();
    });
});

test.after.always("cleanup", (t) => {
    util.cleanup(t);
});
