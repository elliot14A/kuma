/** @jsxImportSource preact */
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { markdownContainerStyle } from './markdownViewer.css'

export interface MarkdownViewerProps {
  content: string
}

export const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return (
      <div className={markdownContainerStyle}>
        <pre>{content}</pre>
      </div>
    )
  }

  return (
    <div className={markdownContainerStyle}>
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  )
}
