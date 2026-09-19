import { render } from 'preact'
import './app.css.ts'

const rootElement = document.getElementById('app')
if (rootElement) {
  render(<div>Kuma</div>, rootElement)
}
