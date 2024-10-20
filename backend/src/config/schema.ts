import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { error, success, type ErrorOr } from '../common/error';

const firewallSchema = z.union([
    z.literal('none'),
    z.discriminatedUnion('type', [
        z.object({ type: z.literal('ufw') }).strict(),
        z.object({ type: z.literal('iptables') }).strict(),
    ]),
]);

export type FireWall = z.infer<typeof firewallSchema>;

const uint16_t_max = 2 ** 16;

const rangeConfig = z
    .object({
        start: z.number().positive().int().lt(uint16_t_max),
        end: z.number().positive().int().lt(uint16_t_max),
    })
    .strict()
    .refine((data) => data.start >= data.end, {
        message: '"start < end" has to be true',
        path: ['end'],
    });

export type RangeConfig = z.infer<typeof rangeConfig>;

const portConfigSchema = z
    .discriminatedUnion('mode', [
        z
            .object({ mode: z.literal('random'), firewall: firewallSchema })
            .strict(),
        z
            .object({
                mode: z.literal('inRange'),
                config: rangeConfig,
                firewall: firewallSchema,
            })
            .strict(),
    ])
    .optional()
    .default({ mode: 'random', firewall: 'none' });

export type PortConfig = z.infer<typeof portConfigSchema>;

const configSchema = z
    .object({
        jwt_secret: z.string(),
        gameserver_executable: z.string(),
        simulator_library_path: z.string(),
        portConfig: portConfigSchema,
    })
    .strict();

export type Config = z.infer<typeof configSchema>;

// from: https://github.com/colinhacks/zod/discussions/2215#discussioncomment-5356286
const stringToJSONSchema = z
    .string()
    .transform((str, ctx): z.infer<ReturnType<any>> => {
        try {
            return JSON.parse(str);
        } catch (_e) {
            ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
            return z.NEVER;
        }
    });

export async function readConfig(filePath: string): Promise<ErrorOr<Config>> {
    const file = path.resolve(filePath);
    if (!fs.existsSync(file)) {
        return error(`File does not exist : '${file}'`);
    }

    const data = (await readFile(file)).toString();

    const json = await stringToJSONSchema.safeParseAsync(data);
    if (!json.success) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return error(`Parse error: ${json.error}`);
    }

    const result = await configSchema.safeParseAsync(json.data);

    if (!result.success) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return error(`Parse error: ${result.error}`);
    }

    return success(result.data);
}
