import { ExecutionContext } from "ava";
import crypto from "crypto";
import fs from "fs-extra";
import MockDate from "mockdate";
import path from "path";

import { ITestContext } from "./_types";

export function randomString(length: number = 15): string {
    return crypto.randomBytes(Math.round(length / 2)).toString("hex");
}

export function pathExists(...paths: string[]): boolean {
    try {
        fs.statSync(path.join(...paths));
        return true;
    } catch (e) {
        return false;
    }
}

export function cleanup(t?: ExecutionContext<ITestContext>): void {
    if (t) {
        if (t.context.dirs && t.context.dirs.length > 0) {
            for (const dir of t.context.dirs) {
                fs.removeSync(dir);
            }
        }
    }

    fs.removeSync(".cache");

    MockDate.reset();
}
