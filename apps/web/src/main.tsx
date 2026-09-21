/** @jsxImportSource preact */

import { render } from 'preact'
import { RegistryProvider } from '#/lib'
import { AppRouter } from './routes/index.ts'
import './styles/theme.css.ts'

const rootElement = document.getElementById('app')
if (rootElement) {
  render(
    <RegistryProvider>
      <AppRouter />
    </RegistryProvider>,
    rootElement,
  )
}
