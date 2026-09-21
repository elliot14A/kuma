/** @jsxImportSource preact */
import { describe, expect, it } from 'bun:test'
import { endFileScope, setFileScope } from '@vanilla-extract/css/fileScope'
import { type ComponentChild, type ContainerNode, h, render } from 'preact'

interface MockElementNode {
  nodeType: number
  nodeName: string
  childNodes: MockElementNode[]
  children: MockElementNode[]
  parentNode: MockElementNode | null
  style: Record<string, unknown>
  attributes: Record<string, string>
  className?: string
  setAttribute(k: string, v: string): void
  getAttribute(k: string): string | null
  removeAttribute(k: string): void
  addEventListener(): void
  removeEventListener(): void
  appendChild(child: MockElementNode): MockElementNode
  insertBefore(child: MockElementNode): MockElementNode
  removeChild(child: MockElementNode): MockElementNode
  getBoundingClientRect(): {
    width: number
    height: number
    top: number
    left: number
    bottom: number
    right: number
  }
}

function createMockStyle() {
  const map: Record<string, string> = {}
  return new Proxy(map, {
    get(target, prop: string) {
      if (prop === 'setProperty') {
        return (k: string, v: string) => {
          target[k] = v
        }
      }
      if (prop === 'getPropertyValue') {
        return (k: string) => target[k] || ''
      }
      if (prop === 'removeProperty') {
        return (k: string) => {
          delete target[k]
        }
      }
      return target[prop]
    },
    set(target, prop: string, val: string) {
      target[prop] = val
      return true
    },
  })
}

function createMockElement(tag = 'div'): MockElementNode {
  const elem: MockElementNode = {
    nodeType: 1,
    nodeName: tag.toUpperCase(),
    childNodes: [],
    children: [],
    parentNode: null,
    style: createMockStyle(),
    attributes: {},
    setAttribute(k: string, v: string) {
      this.attributes[k] = v
      if (k === 'class' || k === 'className') {
        this.className = v
      }
    },
    getAttribute(k: string) {
      return this.attributes[k] || null
    },
    removeAttribute(k: string) {
      delete this.attributes[k]
      if (k === 'class' || k === 'className') {
        delete this.className
      }
    },
    addEventListener() {},
    removeEventListener() {},
    appendChild(child: MockElementNode) {
      child.parentNode = this
      this.childNodes.push(child)
      if (child.nodeType === 1) this.children.push(child)
      return child
    },
    insertBefore(child: MockElementNode) {
      child.parentNode = this
      this.childNodes.push(child)
      if (child.nodeType === 1) this.children.push(child)
      return child
    },
    removeChild(child: MockElementNode) {
      const idx = this.childNodes.indexOf(child)
      if (idx >= 0) this.childNodes.splice(idx, 1)
      const cIdx = this.children.indexOf(child)
      if (cIdx >= 0) this.children.splice(cIdx, 1)
      return child
    },
    getBoundingClientRect() {
      return { width: 1000, height: 800, top: 0, left: 0, bottom: 800, right: 1000 }
    },
  }
  return elem
}

if (typeof globalThis.document === 'undefined') {
  const head = createMockElement('head')
  const body = createMockElement('body')
  ;(globalThis as unknown as { document: unknown }).document = {
    head,
    body,
    createElement: (tag: string) => createMockElement(tag),
    createElementNS: (_: string, tag: string) => createMockElement(tag),
    createTextNode: (text: string) => ({
      nodeType: 3,
      nodeValue: text,
      parentNode: null,
    }),
  }
}

if (typeof globalThis.window === 'undefined') {
  ;(globalThis as unknown as { window: unknown }).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
  }
}

function renderInto(vnode: ComponentChild, container: MockElementNode) {
  render(vnode, container as unknown as ContainerNode)
}

setFileScope('apps/web/src/components/layout/layout.test.ts')
const { AppHeader } = await import('./appHeader')
const { Sidebar, DEFAULT_SIDEBAR_ITEMS, DEFAULT_SIDEBAR_BOTTOM_ITEMS } = await import('./sidebar')
const { SplitPane } = await import('./splitPane')
const { DockRail } = await import('./dockRail')
const headerStyles = await import('./appHeader/appHeader.css')
const sidebarStyles = await import('./sidebar/sidebar.css')
const splitPaneStyles = await import('./splitPane/splitPane.css')
const dockRailStyles = await import('./dockRail/dockRail.css')
endFileScope()

describe('Layout Components', () => {
  describe('AppHeader', () => {
    it('renders with default brand logo text and banner landmark', () => {
      const root = createMockElement()
      renderInto(h(AppHeader, {}), root)
      expect(root.childNodes.length).toBe(1)
      const headerNode = root.childNodes[0]
      expect(headerNode?.nodeName).toBe('HEADER')
      expect(headerNode?.getAttribute('class') || headerNode?.className).toContain(
        headerStyles.headerContainer,
      )
    })

    it('renders custom brand text and badge', () => {
      const vnode = AppHeader({
        logoText: 'kuma-arena',
        badgeText: 'BETA',
      })
      expect(vnode.props.className).toContain(headerStyles.headerContainer)
    })

    it('renders breadcrumbs and active title correctly', () => {
      const root = createMockElement()
      renderInto(
        h(AppHeader, {
          breadcrumbs: [
            {
              label: 'Assessments',
              href: '/assessments',
            },
            {
              label: 'TypeScript Arena',
              onClick: () => {},
            },
            {
              label: 'Challenge #1',
              active: true,
            },
          ],
        }),
        root,
      )
      expect(root.childNodes.length).toBe(1)
    })

    it('renders single activeTitle when breadcrumbs are not passed', () => {
      const root = createMockElement()
      renderInto(
        h(AppHeader, {
          activeTitle: 'Challenge Dashboard',
        }),
        root,
      )
      expect(root.childNodes.length).toBe(1)
    })

    it('renders status pill with all status variants', () => {
      const variants = ['idle', 'running', 'success', 'danger', 'warning'] as const
      for (const variant of variants) {
        const root = createMockElement()
        renderInto(
          h(AppHeader, {
            statusText: `Status: ${variant}`,
            statusType: variant,
          }),
          root,
        )
        expect(root.childNodes.length).toBe(1)
      }
    })

    it('renders custom statusSlot and actionsSlot', () => {
      const root = createMockElement()
      const customStatus = h('div', { id: 'custom-status' }, 'Connected')
      const actionBtn = h('button', { type: 'button' }, 'Submit')

      renderInto(
        h(AppHeader, {
          statusSlot: customStatus,
          actionsSlot: actionBtn,
        }),
        root,
      )
      expect(root.childNodes.length).toBe(1)
    })

    it('renders clickable logo when onLogoClick is provided', () => {
      const root = createMockElement()
      renderInto(
        h(AppHeader, {
          onLogoClick: () => {},
        }),
        root,
      )
      expect(root.childNodes.length).toBe(1)
    })
  })

  describe('Sidebar', () => {
    it('renders with default navigation items and navigation landmark', () => {
      const root = createMockElement()
      renderInto(h(Sidebar, { activeId: 'challenges' }), root)
      expect(root.childNodes.length).toBe(1)
      const asideNode = root.childNodes[0]
      expect(asideNode?.getAttribute('aria-label')).toBe('Main Navigation')
      expect(asideNode?.getAttribute('class') || asideNode?.className).toContain(
        sidebarStyles.sidebarRail,
      )
    })

    it('exposes default sidebar items matching coding standards', () => {
      expect(DEFAULT_SIDEBAR_ITEMS.length).toBeGreaterThanOrEqual(2)
      expect(DEFAULT_SIDEBAR_ITEMS.some((item) => item.id === 'challenges')).toBe(true)
      expect(DEFAULT_SIDEBAR_ITEMS.some((item) => item.id === 'assessments')).toBe(true)

      expect(DEFAULT_SIDEBAR_BOTTOM_ITEMS.length).toBeGreaterThanOrEqual(2)
      expect(DEFAULT_SIDEBAR_BOTTOM_ITEMS.some((item) => item.id === 'docs')).toBe(true)
      expect(DEFAULT_SIDEBAR_BOTTOM_ITEMS.some((item) => item.id === 'settings')).toBe(true)
    })

    it('renders custom items, badge, href links, and onSelect callbacks', () => {
      const root = createMockElement()
      renderInto(
        h(Sidebar, {
          items: [
            {
              id: 'custom-link',
              label: 'Custom Link',
              icon: DEFAULT_SIDEBAR_ITEMS[0]?.icon ?? (() => null),
              href: '/custom',
              badge: true,
            },
            {
              id: 'custom-btn',
              label: 'Custom Button',
              icon: DEFAULT_SIDEBAR_ITEMS[1]?.icon ?? (() => null),
              onClick: () => {},
            },
            {
              id: 'disabled-btn',
              label: 'Disabled',
              icon: DEFAULT_SIDEBAR_ITEMS[0]?.icon ?? (() => null),
              disabled: true,
            },
          ],
          activeId: 'custom-btn',
          onSelect: () => {},
          topSlot: h('div', null, 'Top Slot'),
          bottomSlot: h('div', null, 'Bottom Slot'),
        }),
        root,
      )
      expect(root.childNodes.length).toBe(1)
    })
  })

  describe('SplitPane', () => {
    it('renders horizontal split container with child panes and gutter', () => {
      const pane1 = h('div', { id: 'pane-1' }, 'Pane 1 Content')
      const pane2 = h('div', { id: 'pane-2' }, 'Pane 2 Content')
      const root = createMockElement()

      renderInto(
        h(SplitPane, {
          direction: 'horizontal',
          children: [pane1, pane2],
        }),
        root,
      )

      expect(root.childNodes.length).toBe(1)
      const containerNode = root.childNodes[0]
      const className = containerNode?.getAttribute('class') || containerNode?.className
      expect(className).toContain(splitPaneStyles.container)
      expect(className).toContain(splitPaneStyles.horizontal)
    })

    it('renders vertical split container with vertical class', () => {
      const pane1 = h('div', { id: 'pane-top' }, 'Top Content')
      const pane2 = h('div', { id: 'pane-bottom' }, 'Bottom Content')
      const root = createMockElement()

      renderInto(
        h(SplitPane, {
          direction: 'vertical',
          children: [pane1, pane2],
        }),
        root,
      )

      expect(root.childNodes.length).toBe(1)
      const containerNode = root.childNodes[0]
      const className = containerNode?.getAttribute('class') || containerNode?.className
      expect(className).toContain(splitPaneStyles.container)
      expect(className).toContain(splitPaneStyles.vertical)
    })

    it('renders with custom initial sizes and collapsible pane support', () => {
      const pane1 = h('div', null, 'Editor')
      const pane2 = h('div', null, 'Terminal')
      const root = createMockElement()

      renderInto(
        h(SplitPane, {
          initialSizes: [70, 30],
          minSizes: [20, 20],
          collapsedPanes: [false, true],
          onResize: () => {},
          children: [pane1, pane2],
        }),
        root,
      )

      expect(root.childNodes.length).toBe(1)
    })

    it('renders single pane without gutter when only one child is passed', () => {
      const singlePane = h('div', null, 'Solo Pane')
      const root = createMockElement()

      renderInto(
        h(SplitPane, {
          children: [singlePane],
        }),
        root,
      )

      expect(root.childNodes.length).toBe(1)
    })
  })

  describe('DockRail', () => {
    it('renders dock rail container with tablist role', () => {
      const root = createMockElement()
      const items = [
        { id: 'specs', label: 'Specs' },
        { id: 'agent', label: 'Agent' },
      ]

      renderInto(
        h(DockRail, {
          items,
          activeId: 'specs',
          onSelect: () => {},
        }),
        root,
      )

      expect(root.childNodes.length).toBe(1)
      const asideNode = root.childNodes[0]
      expect(asideNode?.nodeName).toBe('DIV')
      expect(asideNode?.getAttribute('role')).toBe('tablist')
      expect(asideNode?.getAttribute('class') || asideNode?.className).toContain(
        dockRailStyles.dockRailContainer,
      )
    })

    it('renders all tab items and highlights active item', () => {
      const root = createMockElement()
      const items = [
        { id: 'specs', label: 'Specs' },
        { id: 'agent', label: 'Agent' },
      ]

      renderInto(
        h(DockRail, {
          items,
          activeId: 'specs',
          onSelect: () => {},
        }),
        root,
      )

      expect(root.childNodes.length).toBe(1)
      const asideNode = root.childNodes[0]
      const tabList = asideNode?.childNodes[0]
      expect(tabList?.childNodes.length).toBe(2)

      const firstTabWrapper = tabList?.childNodes[0]
      const firstTabBtn = firstTabWrapper?.childNodes.find((n) => n.nodeName === 'BUTTON')
      expect(Boolean(firstTabBtn?.getAttribute('aria-selected'))).toBe(true)
      expect(firstTabBtn?.getAttribute('class') || firstTabBtn?.className).toContain(
        dockRailStyles.dockTabItemActive,
      )

      const secondTabWrapper = tabList?.childNodes[1]
      const secondTabBtn = secondTabWrapper?.childNodes.find((n) => n.nodeName === 'BUTTON')
      expect(Boolean(secondTabBtn?.getAttribute('aria-selected'))).toBe(false)
    })
  })
})
