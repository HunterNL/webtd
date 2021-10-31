// __PRODUCTION__ is set by a webpack.definePlugin in webpack.config
export function isProduction(): boolean {
    // @ts-ignore-next-line
    return __PRODUCTION__ as boolean;
}