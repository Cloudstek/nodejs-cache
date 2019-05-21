import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { ExecutionContext } from 'ava';

import { TestContext } from './_types';

export function randomString(length: number = 15): string
{
    return crypto.randomBytes(Math.round(length / 2)).toString('hex');
}

export function pathExists(...paths: string[]): boolean
{
    try {
        fs.statSync(path.join(...paths));
        return true;
    } catch (e) {
        return false;
    }
}

export function cleanup(t?: ExecutionContext<TestContext>): void
{
    if (t) {
        if (t.context.dirs && t.context.dirs.length > 0) {
            for (const dir of t.context.dirs) {
                fs.removeSync(dir);
            }
        }
    }

    fs.removeSync('.cache');
}
