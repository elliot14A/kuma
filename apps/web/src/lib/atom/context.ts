import type * as Atom from 'effect/unstable/reactivity/Atom'
import * as AtomRegistry from 'effect/unstable/reactivity/AtomRegistry'
import { type ComponentChildren, createContext, h } from 'preact'
import { useEffect, useRef } from 'preact/hooks'

export const RegistryContext = createContext<AtomRegistry.AtomRegistry>(
  AtomRegistry.make({ defaultIdleTTL: 400 }),
)

export interface RegistryProviderProps {
  readonly children?: ComponentChildren
  readonly initialValues?: Iterable<readonly [Atom.Atom<unknown>, unknown]>
  readonly scheduleTask?: (f: () => void) => () => void
  readonly timeoutResolution?: number
  readonly defaultIdleTTL?: number
}

export const RegistryProvider = (props: RegistryProviderProps) => {
  const ref = useRef<{
    readonly registry: AtomRegistry.AtomRegistry
    timeout?: ReturnType<typeof setTimeout>
  } | null>(null)

  if (ref.current === null) {
    ref.current = {
      registry: AtomRegistry.make({
        scheduleTask: props.scheduleTask,
        initialValues: props.initialValues,
        timeoutResolution: props.timeoutResolution,
        defaultIdleTTL: props.defaultIdleTTL,
      }),
    }
  }

  useEffect(() => {
    if (ref.current?.timeout !== undefined) {
      clearTimeout(ref.current.timeout)
    }
    return () => {
      if (ref.current) {
        const currentRef = ref.current
        currentRef.timeout = setTimeout(() => {
          currentRef.registry.dispose()
          ref.current = null
        }, 500)
      }
    }
  }, [])

  return h(RegistryContext.Provider, { value: ref.current.registry }, props.children)
}
