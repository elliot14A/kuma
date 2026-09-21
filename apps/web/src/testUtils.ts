import { type ComponentChild, type ContainerNode, render } from 'preact'

export interface MockElementNode {
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

export function createMockElement(tag = 'div'): MockElementNode {
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

export function setupMockDom() {
  if (typeof globalThis.document === 'undefined') {
    const head = createMockElement('head')
    const body = createMockElement('body')
    ;(globalThis as unknown as { document: unknown }).document = {
      head,
      body,
      createElement: (tag: string) => createMockElement(tag),
      createElementNS: (_: string, tag: string) => createMockElement(tag),
      createTextNode: (text: string) => {
        const node = createMockElement('#text')
        node.nodeType = 3
        ;(node as unknown as { nodeValue: string }).nodeValue = text
        return node
      },
    }
  }

  if (typeof globalThis.window === 'undefined') {
    ;(globalThis as unknown as { window: unknown }).window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      location: {
        pathname: '/challenges',
      },
    }
  }
}

export function renderInto(vnode: ComponentChild, container: MockElementNode) {
  setupMockDom()
  render(vnode, container as unknown as ContainerNode)
}
