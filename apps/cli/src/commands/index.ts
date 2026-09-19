import { Effect } from 'effect'
import { type KumaCommand, printHelp } from '../cli'
import * as migrate from './migrate'
import * as server from './server'
import * as web from './web'

export const executeCommand = (command: KumaCommand): Effect.Effect<void, unknown> => {
  switch (command.type) {
    case 'migrate':
      return migrate.run
    case 'server':
      return server.run
    case 'web':
      return web.run
    case 'version':
      return Effect.sync(() => {
        console.log('kuma version 0.1.0')
      })
    case 'help':
      return Effect.sync(() => {
        printHelp()
      })
    default:
      return Effect.sync(() => {
        printHelp()
      })
  }
}
