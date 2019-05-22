import Test, { TestInterface } from "ava";

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

test("iterate over items using all", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar");
    c.set("pie", "apple");

    const all = c.all();

    t.plan(5);
    t.is(c.keys.length, 2);
    t.is(typeof all, "object");

    t.snapshot(all);

    for (const [key, value] of Object.entries(all)) {
        t.snapshot([key, value]);
    }
});

test("iterate over items using iterable", (t) => {
    const c = new Cache<string>(t.context.options);

    c.set("foo", "bar");
    c.set("pie", "apple");

    t.plan(3);
    t.is(c.keys.length, 2);

    for (const [key, value] of c) {
        t.log();
        t.snapshot([key, value]);
    }
});

test.after.always("cleanup", (t) => {
    util.cleanup(t);
});
