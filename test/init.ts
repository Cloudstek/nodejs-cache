import Test, { TestInterface } from 'ava';
import * as path from 'path';
import * as fs from 'fs-extra';

import { Cache } from '../src/index';

import * as util from './_utils';
import { TestContext } from './_types';

const test = Test as TestInterface<TestContext>;

// Set context
test.before(t => {
    t.context.dirs = [];
})

// Defaults
test.serial('init with defaults', t => {
    const c = new Cache<string>();

    t.not(undefined, c);
    t.is(c.keys.length, 0);
});

test.serial('load on init with defaults', t => {
    const value = util.randomString();

    fs.ensureFileSync(path.join('.cache', 'cache.json'));
    fs.writeJsonSync(path.join('.cache', 'cache.json'), {
        foo: {
            expires: false,
            value: value
        }
    });

    const c = new Cache<string>();

    t.not(undefined, c);
    t.true(c.has('foo'));
    t.is(c.keys.length, 1);
    t.is(c.get('foo'), value);
});

test.serial('load on init with object as value', t => {
    const value = util.randomString();

    fs.ensureFileSync(path.join('.cache', 'cache.json'));
    fs.writeJsonSync(path.join('.cache', 'cache.json'), {
        foo: {
            expires: false,
            value: {
                bar: value
            }
        }
    });

    const c = new Cache<Object>();

    t.not(undefined, c);
    t.true(c.has('foo'));
    t.is(c.keys.length, 1);
    t.is('object', typeof c.get('foo'));
    t.deepEqual(c.get('foo'), { bar: value });
});

// Custom dir
test('init with custom dir', t => {
    const dir = util.randomString();
    t.context.dirs.push(dir);

    const c = new Cache<string>({ dir: dir });

    t.not(undefined, c);
    t.false(util.pathExists(dir));
    t.is(c.keys.length, 0);
});

test('load on init with custom dir', t => {
    const dir = util.randomString();
    const value = util.randomString();
    t.context.dirs.push(dir);

    fs.ensureFileSync(path.join(dir, 'cache.json'));
    fs.writeJsonSync(path.join(dir, 'cache.json'), {
        foo: {
            expires: false,
            value: value
        }
    });

    const c = new Cache<string>({ dir: dir });

    t.not(undefined, c);
    t.true(c.has('foo'));
    t.is(c.keys.length, 1);
    t.is(c.get('foo'), value);
});

// Custom dir and name
test('init with custom dir and name', t => {
    const dir = util.randomString();
    const file = util.randomString();
    t.context.dirs.push(dir);

    const c = new Cache<string>({ dir: dir, name: file });

    t.not(undefined, c);
    t.false(util.pathExists(dir));
    t.is(c.keys.length, 0);
});

test('load on init with custom dir and name', t => {
    const dir = util.randomString();
    const file = util.randomString();
    const value = util.randomString();
    t.context.dirs.push(dir);

    fs.ensureFileSync(path.join(dir, file));
    fs.writeJsonSync(path.join(dir, file), {
        foo: {
            expires: false,
            value: value
        }
    });

    const c = new Cache<string>({ dir: dir, name: file });

    t.not(undefined, c);
    t.true(c.has('foo'));
    t.is(c.keys.length, 1);
    t.is(c.get('foo'), value);
});

test.after.always('cleanup', t => {
    util.cleanup(t);
});
