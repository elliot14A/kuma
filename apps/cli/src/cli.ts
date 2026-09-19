export type KumaCommand =
  | { readonly type: 'server' }
  | { readonly type: 'migrate' }
  | { readonly type: 'web' }
  | { readonly type: 'help' }
  | { readonly type: 'version' }

export interface ParsedCli {
  readonly command: KumaCommand
}

export const parseCliArgs = (args: readonly string[]): ParsedCli => {
  const cleanArgs = args.filter(
    (arg) => !arg.startsWith('bun') && !arg.endsWith('main.ts') && !arg.endsWith('kuma'),
  )
  const first = cleanArgs[0]?.toLowerCase()

  if (first === 'migrate') {
    return { command: { type: 'migrate' } }
  }

  if (first === 'server') {
    return { command: { type: 'server' } }
  }

  if (first === 'web') {
    return { command: { type: 'web' } }
  }

  if (first === '--version' || first === '-v' || first === 'version') {
    return { command: { type: 'version' } }
  }

  return { command: { type: 'help' } }
}

export const printHelp = (): void => {
  console.log(`
kuma - Autonomous Technical Assessment Platform CLI

USAGE:
  kuma [COMMAND]

COMMANDS:
  migrate   Run database migrations
  server    Start HTTP API server
  web       Start web frontend
  help      Print this help message
  version   Print version

OPTIONS:
  -h, --help      Print help
  -v, --version   Print version
`)
}
