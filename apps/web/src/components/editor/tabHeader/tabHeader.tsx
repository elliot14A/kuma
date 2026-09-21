/** @jsxImportSource preact */
import { X } from 'lucide-preact'
import { FileIcon } from '#/components/common/fileIcon'
import {
  closeBtnStyle,
  dirtyDotStyle,
  tabHeaderContainerStyle,
  tabItemStyle,
} from './tabHeader.css'

export interface TabHeaderProps {
  openFiles: string[]
  activeFile: string
  dirtyFiles?: Set<string> | undefined
  onSelectTab: (file: string) => void
  onCloseTab?: ((file: string) => void) | undefined
}

export const TabHeader = ({
  openFiles,
  activeFile,
  dirtyFiles = new Set(),
  onSelectTab,
  onCloseTab,
}: TabHeaderProps) => {
  return (
    <div className={tabHeaderContainerStyle} role="tablist">
      {openFiles.map((file) => {
        const isActive = activeFile === file
        const isDirty = dirtyFiles.has(file)
        const fileName = file.split('/').pop() ?? file

        return (
          <div
            key={file}
            className={tabItemStyle}
            data-active={isActive ? 'true' : 'false'}
            onClick={() => onSelectTab(file)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectTab(file)
              }
            }}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
          >
            <FileIcon fileName={fileName} size={13} />
            <span>{fileName}</span>

            {isDirty ? <span className={dirtyDotStyle} title="Unsaved changes" /> : null}

            {onCloseTab && openFiles.length > 1 ? (
              <button
                type="button"
                className={closeBtnStyle}
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseTab(file)
                }}
                title={`Close ${fileName}`}
                aria-label={`Close ${fileName}`}
              >
                <X size={12} />
              </button>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
