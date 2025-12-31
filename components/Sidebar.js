import { useState, useMemo } from 'react'
import FolderItem from './FolderItem'
import { getPartFolders } from '../lib/emailUtils'

export default function Sidebar({ folders, emails, currentFolder, onFolderSelect }) {
  const [expandedFolders, setExpandedFolders] = useState(['agent'])
  
  // Generate dynamic part folders from emails
  const partFolders = useMemo(() => getPartFolders(emails), [emails])
  
  // Merge static folders with dynamic part folders for agent
  const foldersWithParts = useMemo(() => {
    return folders.map(folder => {
      if (folder.id === 'agent') {
        return {
          ...folder,
          children: partFolders
        }
      }
      return folder
    })
  }, [folders, partFolders])

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  const isExpanded = (folderId) => expandedFolders.includes(folderId)

  const renderFolder = (folder, isChild = false, depth = 0) => {
    const hasChildren = folder.isExpandable && folder.children && folder.children.length > 0
    const expanded = isExpanded(folder.id)
    const isActive = currentFolder === folder.id
    const isPartFolder = folder.id?.startsWith('agent-part-') && !folder.id.includes('-sent') && !folder.id.includes('-awaiting') && !folder.id.includes('-clarifications') && !folder.id.includes('-quotes')

    if (hasChildren) {
      return (
        <div key={folder.id}>
          <button
            onClick={() => toggleFolder(folder.id)}
            className={`w-full flex items-center justify-between ${isChild ? 'pl-8' : 'px-4'} py-2.5 text-left rounded-md transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-100 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <svg
                className={`w-4 h-4 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className={isChild ? 'text-base' : 'text-lg'}>{folder.icon}</span>
              <span className={`font-medium ${isChild ? 'text-sm' : ''}`}>{folder.name}</span>
            </div>
          </button>
          {expanded && (
            <div className={`${isPartFolder ? 'pl-8' : 'pl-8'} space-y-0.5 mt-0.5 border-l-2 border-gray-200 ml-2`}>
              {folder.children.map((child) => {
                // Recursively render nested folders
                if (child.isExpandable && child.children && child.children.length > 0) {
                  return renderFolder(child, true, depth + 1)
                }
                return (
                  <FolderItem
                    key={child.id}
                    folder={child}
                    emails={emails}
                    isActive={currentFolder === child.id}
                    onClick={() => onFolderSelect(child.id)}
                    isChild={true}
                  />
                )
              })}
            </div>
          )}
        </div>
      )
    }

    return (
      <FolderItem
        key={folder.id}
        folder={folder}
        emails={emails}
        isActive={isActive}
        onClick={() => onFolderSelect(folder.id)}
        isChild={isChild}
      />
    )
  }

  // Separate regular folders from agent folder
  const regularFolders = foldersWithParts.filter(f => f.id !== 'agent')
  const agentFolder = foldersWithParts.find(f => f.id === 'agent')

  return (
    <div className="w-full bg-gray-50 border-r border-gray-200 h-full overflow-y-auto scrollbar-custom">
      <div className="p-4">
        <button
          onClick={() => onFolderSelect('compose')}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Message</span>
        </button>
        <div className="space-y-1">
          {regularFolders.map((folder) => renderFolder(folder))}
        </div>
        {agentFolder && (
          <>
            <div className="border-t border-gray-300 my-2"></div>
            {renderFolder(agentFolder)}
          </>
        )}
      </div>
    </div>
  )
}

