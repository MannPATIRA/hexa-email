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
            className={`w-full flex items-center justify-between ${isChild ? 'pl-1' : 'px-3'} py-2 text-left rounded-sm transition-colors ${
              isActive
                ? 'bg-outlook-blue-lighter text-outlook-blue font-semibold'
                : 'text-outlook-text hover:bg-outlook-hover'
            }`}
          >
            <div className="flex items-center space-x-2">
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
            <div className="pl-3 space-y-0.5 mt-0.5 border-l-2 border-outlook-border ml-2">
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
    <div className="w-full bg-outlook-sidebar border-r border-outlook-border h-full overflow-y-auto scrollbar-custom">
      <div className="py-2">
        {/* Favourites Section */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-white mb-1 px-3 group cursor-pointer">
            <svg className="w-3 h-3 transition-transform rotate-90 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100">Favourites</span>
          </div>
          <div className="space-y-0.5">
            {regularFolders.filter(f => ['inbox', 'sent', 'deleted'].includes(f.id)).map(folder => (
              <FolderItem
                key={`fav-${folder.id}`}
                folder={folder}
                emails={emails}
                isActive={currentFolder === folder.id}
                onClick={() => onFolderSelect(folder.id)}
              />
            ))}
          </div>
        </div>

        {/* Main Account Section */}
        <div className="mb-2">
          <div className="flex items-center space-x-2 text-white mb-1 px-3 group cursor-pointer">
            <svg className="w-3 h-3 transition-transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-xs font-semibold">mannpatira@hotmail.com</span>
          </div>
          <div className="space-y-0.5">
            {regularFolders.map((folder) => renderFolder(folder))}
          </div>
        </div>

        {agentFolder && (
          <div className="px-3">
            <div className="border-t border-outlook-border my-2"></div>
            {renderFolder(agentFolder)}
          </div>
        )}

        {/* Saved Searches Section */}
        <div className="mt-4 px-3">
          <div className="flex items-center space-x-2 text-white mb-1 opacity-60">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-[11px] font-bold uppercase tracking-wider">Saved Searches</span>
          </div>
        </div>
      </div>
    </div>
  )
}

