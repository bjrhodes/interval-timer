// the one Node module the specs use, declared rather than pulling in @types/node.
declare module 'node:fs/promises' {
    export function readFile(path: string): Promise<Uint8Array>;
    export function readFile(path: string, encoding: 'utf8'): Promise<string>;
}
