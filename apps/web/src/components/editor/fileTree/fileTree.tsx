/** @jsxImportSource preact */
import { assignInlineVars } from '@vanilla-extract/dynamic'
import { ChevronDown, ChevronRight, ChevronsDownUp, Folder, FolderOpen, Plus } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { FileIcon } from '#/components/common/fileIcon'
import { colors } from '#/styles/tokens'
import {
  containerStyle,
  depthPaddingVar,
  folderChevronStyle,
  headerActionBtnStyle,
  headerActionsStyle,
  headerStyle,
  itemIconStyle,
  itemLabelStyle,
  projectRootStyle,
  rowItemStyle,
  treeListStyle,
} from './fileTree.css'

export interface FileTreeProps {
  specFile?: string | undefined
  starterFiles?: string[] | undefined
  testFiles?: string[] | undefined
  files?: string[] | undefined
  activeFile: string
  workspaceName?: string | undefined
  onSelectFile: (file: string) => void
  onAddFile?: (() => void) | undefined
}

export interface TreeFileItem {
  id: string
  name: string
  path: string
  isFolder: false
  category?: 'spec' | 'src' | 'test' | undefined
}

export interface TreeFolderItem {
  id: string
  name: string
  path: string
  isFolder: true
  children: (TreeFolderItem | TreeFileItem)[]
}

export type TreeNode = TreeFolderItem | TreeFileItem

const buildTree = (
  fileList: { path: string; category?: 'spec' | 'src' | 'test' | undefined }[],
): TreeNode[] => {
  const root: TreeFolderItem = {
    id: 'root',
    name: 'root',
    path: '',
    isFolder: true,
    children: [],
  }

  for (const { path, category } of fileList) {
    const parts = path.split('/')
    let currentFolder = root

    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i]
      if (!folderName) {
        continue
      }
      const folderPath = parts.slice(0, i + 1).join('/')
      let foundFolder = currentFolder.children.find(
        (c): c is TreeFolderItem => c.isFolder && c.name === folderName,
      )

      if (!foundFolder) {
        foundFolder = {
          id: folderPath,
          name: folderName,
          path: folderPath,
          isFolder: true,
          children: [],
        }
        currentFolder.children.push(foundFolder)
      }
      currentFolder = foundFolder
    }

    const fileName = parts[parts.length - 1]
    if (fileName) {
      currentFolder.children.push({
        id: path,
        name: fileName,
        path,
        isFolder: false,
        category,
      })
    }
  }

  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .sort((a, b) => {
        if (a.isFolder && !b.isFolder) {
          return -1
        }
        if (!a.isFolder && b.isFolder) {
          return 1
        }
        if (a.name === 'spec.md') {
          return -1
        }
        if (b.name === 'spec.md') {
          return 1
        }
        return a.name.localeCompare(b.name)
      })
      .map((node) => {
        if (node.isFolder) {
          return {
            ...node,
            children: sortNodes(node.children),
          }
        }
        return node
      })
  }

  return sortNodes(root.children)
}

export const FileTree = ({
  specFile,
  starterFiles = [],
  testFiles = [],
  files,
  activeFile,
  workspaceName = 'workspace',
  onSelectFile,
  onAddFile,
}: FileTreeProps) => {
  const allFilesList = files
    ? files.map((path) => ({ path, category: undefined }))
    : [
        ...(specFile ? [{ path: specFile, category: 'spec' as const }] : []),
        ...starterFiles.map((path) => ({ path, category: 'src' as const })),
        ...testFiles.map((path) => ({ path, category: 'test' as const })),
      ]

  const tree = buildTree(allFilesList)

  const getAllFolderPaths = (nodes: TreeNode[]): string[] => {
    const paths: string[] = []
    for (const node of nodes) {
      if (node.isFolder) {
        paths.push(node.path)
        paths.push(...getAllFolderPaths(node.children))
      }
    }
    return paths
  }

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    return new Set(getAllFolderPaths(tree))
  })

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders)
    if (next.has(path)) {
      next.delete(path)
    } else {
      next.add(path)
    }
    setExpandedFolders(next)
  }

  const handleCollapseAll = () => {
    if (expandedFolders.size > 0) {
      setExpandedFolders(new Set())
    } else {
      setExpandedFolders(new Set(getAllFolderPaths(tree)))
    }
  }

  const renderNodes = (nodes: TreeNode[], depth = 0) => {
    return nodes.map((node) => {
      if (node.isFolder) {
        const isExpanded = expandedFolders.has(node.path)
        return (
          <div key={node.id}>
            <button
              type="button"
              className={rowItemStyle}
              style={assignInlineVars({ [depthPaddingVar]: `${depth * 14 + 8}px` })}
              onClick={() => toggleFolder(node.path)}
            >
              <span className={folderChevronStyle}>
                {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </span>
              <span className={itemIconStyle}>
                {isExpanded ? (
                  <FolderOpen size={13} color={colors.accent} />
                ) : (
                  <Folder size={13} color={colors.textSecondary} />
                )}
              </span>
              <span className={itemLabelStyle}>{node.name}</span>
            </button>
            {isExpanded ? renderNodes(node.children, depth + 1) : null}
          </div>
        )
      }

      const isActive = activeFile === node.path
      return (
        <button
          key={node.id}
          type="button"
          className={rowItemStyle}
          style={assignInlineVars({ [depthPaddingVar]: `${depth * 14 + 22}px` })}
          data-active={isActive ? 'true' : 'false'}
          onClick={() => onSelectFile(node.path)}
        >
          <span className={itemIconStyle}>
            <FileIcon fileName={node.name} category={node.category} size={13} />
          </span>
          <span className={itemLabelStyle}>{node.name}</span>
        </button>
      )
    })
  }

  return (
    <div className={containerStyle}>
      <div className={headerStyle}>
        <span>Project</span>
        <div className={headerActionsStyle}>
          <button
            type="button"
            className={headerActionBtnStyle}
            onClick={handleCollapseAll}
            title="Toggle Folders"
            aria-label="Toggle Folders"
          >
            <ChevronsDownUp size={13} />
          </button>
          {onAddFile ? (
            <button
              type="button"
              className={headerActionBtnStyle}
              onClick={onAddFile}
              title="New File"
              aria-label="New File"
            >
              <Plus size={13} />
            </button>
          ) : null}
        </div>
      </div>

      <div className={projectRootStyle}>
        <FolderOpen size={12} color={colors.textMuted} />
        <span>{workspaceName}</span>
      </div>

      <div className={treeListStyle}>{renderNodes(tree, 0)}</div>
    </div>
  )
}
