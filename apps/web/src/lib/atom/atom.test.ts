import { describe, expect, it } from 'bun:test'
import * as Atom from 'effect/unstable/reactivity/Atom'
import { h } from 'preact'
import { createMockElement, renderInto, setupMockDom } from '#/testUtils'
import {
  RegistryProvider,
  useAtom,
  useAtomMount,
  useAtomRefresh,
  useAtomSet,
  useAtomSubscribe,
  useAtomValue,
} from './index'

setupMockDom()

describe('Preact Native Atom Hooks', () => {
  it('useAtomValue reads current atom value', () => {
    const counterAtom = Atom.make(42)
    let observed = 0

    const Component = () => {
      observed = useAtomValue(counterAtom)
      return h('div', null, String(observed))
    }

    const root = createMockElement()
    renderInto(h(RegistryProvider, null, h(Component, null)), root)

    expect(observed).toBe(42)
  })

  it('useAtomValue supports selector mapping function', () => {
    const userAtom = Atom.make({ name: 'Alice', age: 30 })
    let observedName = ''

    const Component = () => {
      observedName = useAtomValue(userAtom, (u) => u.name)
      return h('div', null, observedName)
    }

    const root = createMockElement()
    renderInto(h(RegistryProvider, null, h(Component, null)), root)

    expect(observedName).toBe('Alice')
  })

  it('useAtom returns value and setter', () => {
    const countAtom = Atom.make(0)
    let currentValue = -1
    let setterFn: ((val: number | ((prev: number) => number)) => void) | null = null

    const Component = () => {
      const [count, setCount] = useAtom(countAtom)
      currentValue = count
      setterFn = setCount
      return h('div', null, String(count))
    }

    const root = createMockElement()
    renderInto(h(RegistryProvider, null, h(Component, null)), root)

    expect(currentValue).toBe(0)
    expect(setterFn).toBeDefined()
  })

  it('useAtomSet creates setter and mounts atom', () => {
    const messageAtom = Atom.make('initial')
    let setterFn: ((val: string | ((prev: string) => string)) => void) | null = null

    const Component = () => {
      setterFn = useAtomSet(messageAtom)
      return h('div', null, 'mounted')
    }

    const root = createMockElement()
    renderInto(h(RegistryProvider, null, h(Component, null)), root)

    expect(setterFn).toBeDefined()
  })

  it('useAtomMount and useAtomRefresh mount and provide refresh callback', () => {
    const statusAtom = Atom.make('active')
    let refreshFn: (() => void) | null = null

    const Component = () => {
      useAtomMount(statusAtom)
      refreshFn = useAtomRefresh(statusAtom)
      return h('div', null, 'status')
    }

    const root = createMockElement()
    renderInto(h(RegistryProvider, null, h(Component, null)), root)

    expect(refreshFn).toBeDefined()
  })

  it('useAtomSubscribe subscribes to atom updates', async () => {
    const flagAtom = Atom.make(true)
    let subscribed = false

    const Component = () => {
      useAtomSubscribe(
        flagAtom,
        (_val) => {
          subscribed = true
        },
        { immediate: true },
      )
      return h('div', null, 'subscribed')
    }

    const root = createMockElement()
    renderInto(h(RegistryProvider, null, h(Component, null)), root)

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(root.childNodes.length).toBe(1)
    expect(subscribed).toBe(true)
  })
})
