import * as Cause from 'effect/Cause'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'
import type * as AsyncResult from 'effect/unstable/reactivity/AsyncResult'
import * as Atom from 'effect/unstable/reactivity/Atom'
import * as AtomRegistry from 'effect/unstable/reactivity/AtomRegistry'
import { useSyncExternalStore } from 'preact/compat'
import { useCallback, useContext, useEffect, useMemo } from 'preact/hooks'
import { RegistryContext } from './context'

interface AtomStore<A> {
  readonly subscribe: (f: () => void) => () => void
  readonly snapshot: () => A
  readonly getServerSnapshot: () => A
}

const storeRegistry = new WeakMap<
  AtomRegistry.AtomRegistry,
  WeakMap<Atom.Atom<unknown>, AtomStore<unknown>>
>()

function makeStore<A>(registry: AtomRegistry.AtomRegistry, atom: Atom.Atom<A>): AtomStore<A> {
  let stores = storeRegistry.get(registry)
  if (stores === undefined) {
    stores = new WeakMap()
    storeRegistry.set(registry, stores)
  }
  const store = stores.get(atom as Atom.Atom<unknown>)
  if (store !== undefined) {
    return store as AtomStore<A>
  }
  const newStore: AtomStore<A> = {
    subscribe(f) {
      return registry.subscribe(atom, f)
    },
    snapshot() {
      return registry.get(atom)
    },
    getServerSnapshot() {
      return Atom.getServerValue(atom, registry)
    },
  }
  stores.set(atom as Atom.Atom<unknown>, newStore as AtomStore<unknown>)
  return newStore
}

function useStore<A>(registry: AtomRegistry.AtomRegistry, atom: Atom.Atom<A>): A {
  const store = makeStore(registry, atom)
  return useSyncExternalStore(store.subscribe, store.snapshot)
}

const flattenExit = <A, E>(exit: Exit.Exit<A, E>): A => {
  if (Exit.isSuccess(exit)) return exit.value
  throw Cause.squash(exit.cause)
}

function mountAtom<A>(registry: AtomRegistry.AtomRegistry, atom: Atom.Atom<A>): void {
  useEffect(() => registry.mount(atom), [atom, registry])
}

function setAtom<R, W, Mode extends 'value' | 'promise' | 'promiseExit' = never>(
  registry: AtomRegistry.AtomRegistry,
  atom: Atom.Writable<R, W>,
  options?: {
    readonly mode?:
      | ([R] extends [AsyncResult.AsyncResult<unknown, unknown>] ? Mode : 'value')
      | undefined
  },
): 'promise' extends Mode
  ? (value: W) => Promise<AsyncResult.AsyncResult.Success<R>>
  : 'promiseExit' extends Mode
    ? (
        value: W,
      ) => Promise<
        Exit.Exit<AsyncResult.AsyncResult.Success<R>, AsyncResult.AsyncResult.Failure<R>>
      >
    : (value: W | ((value: R) => W)) => void {
  if (options?.mode === 'promise' || options?.mode === 'promiseExit') {
    return useCallback(
      (value: W) => {
        registry.set(atom, value)
        const promise = Effect.runPromiseExit(
          AtomRegistry.getResult(
            registry,
            atom as Atom.Atom<AsyncResult.AsyncResult<unknown, unknown>>,
            { suspendOnWaiting: true },
          ),
        )
        return options.mode === 'promise' ? promise.then(flattenExit) : promise
      },
      [registry, atom, options.mode],
    ) as never
  }
  return useCallback(
    (value: W | ((value: R) => W)) => {
      registry.set(
        atom,
        typeof value === 'function' ? (value as (prev: R) => W)(registry.get(atom)) : value,
      )
    },
    [registry, atom],
  ) as never
}

export const useAtomMount = <A>(atom: Atom.Atom<A>): void => {
  const registry = useContext(RegistryContext)
  mountAtom(registry, atom)
}

export const useAtomSet = <R, W, Mode extends 'value' | 'promise' | 'promiseExit' = never>(
  atom: Atom.Writable<R, W>,
  options?: {
    readonly mode?:
      | ([R] extends [AsyncResult.AsyncResult<unknown, unknown>] ? Mode : 'value')
      | undefined
  },
): 'promise' extends Mode
  ? (value: W) => Promise<AsyncResult.AsyncResult.Success<R>>
  : 'promiseExit' extends Mode
    ? (
        value: W,
      ) => Promise<
        Exit.Exit<AsyncResult.AsyncResult.Success<R>, AsyncResult.AsyncResult.Failure<R>>
      >
    : (value: W | ((value: R) => W)) => void => {
  const registry = useContext(RegistryContext)
  mountAtom(registry, atom)
  return setAtom(registry, atom, options)
}

export const useAtomRefresh = <A>(atom: Atom.Atom<A>): (() => void) => {
  const registry = useContext(RegistryContext)
  mountAtom(registry, atom)
  return useCallback(() => {
    registry.refresh(atom)
  }, [registry, atom])
}

export function useAtomValue<A>(atom: Atom.Atom<A>): A
export function useAtomValue<A, B>(atom: Atom.Atom<A>, f: (_: A) => B): B
export function useAtomValue<A, B>(atom: Atom.Atom<A>, f?: (_: A) => B): A | B {
  const registry = useContext(RegistryContext)
  if (f) {
    const atomB = useMemo(() => Atom.map(atom, f), [atom, f])
    return useStore(registry, atomB)
  }
  return useStore(registry, atom)
}

export const useAtom = <R, W, const Mode extends 'value' | 'promise' | 'promiseExit' = never>(
  atom: Atom.Writable<R, W>,
  options?: {
    readonly mode?:
      | ([R] extends [AsyncResult.AsyncResult<unknown, unknown>] ? Mode : 'value')
      | undefined
  },
): readonly [
  value: R,
  write: 'promise' extends Mode
    ? (value: W) => Promise<AsyncResult.AsyncResult.Success<R>>
    : 'promiseExit' extends Mode
      ? (
          value: W,
        ) => Promise<
          Exit.Exit<AsyncResult.AsyncResult.Success<R>, AsyncResult.AsyncResult.Failure<R>>
        >
      : (value: W | ((value: R) => W)) => void,
] => {
  const registry = useContext(RegistryContext)
  return [useStore(registry, atom), setAtom(registry, atom, options)] as const
}

export const useAtomSubscribe = <A>(
  atom: Atom.Atom<A>,
  f: (_: A) => void,
  options?: { readonly immediate?: boolean },
): void => {
  const registry = useContext(RegistryContext)
  useEffect(() => registry.subscribe(atom, f, options), [registry, atom, f, options?.immediate])
}

const initialValuesSet = new WeakMap<AtomRegistry.AtomRegistry, WeakSet<Atom.Atom<unknown>>>()

export const useAtomInitialValues = (
  initialValues: Iterable<readonly [Atom.Atom<unknown>, unknown]>,
): void => {
  const registry = useContext(RegistryContext)
  let set = initialValuesSet.get(registry)
  if (set === undefined) {
    set = new WeakSet()
    initialValuesSet.set(registry, set)
  }
  for (const [atom, value] of initialValues) {
    if (!set.has(atom)) {
      set.add(atom)
      if (Atom.isWritable(atom)) {
        registry.set(atom, value)
      }
    }
  }
}
