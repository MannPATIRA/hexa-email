import { getUnreadCount } from '../lib/emailUtils'

export default function FolderItem({ folder, emails, isActive, onClick, isChild = false }) {
  // Always calculate count dynamically for agent folders, use static count for others if available
  const isAgentFolder = folder.id?.startsWith('agent-')
  const count = (isAgentFolder || folder.count === undefined) 
    ? getUnreadCount(emails, folder.id) 
    : folder.count
  const showPulse = folder.id === 'agent-queue' && count > 0

  const getIcon = () => {
    if (isChild && !isAgentFolder) return <span className="w-4" />
    
    switch (folder.id) {
      case 'inbox':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
      case 'sent':
        return <svg className="w-4 h-4 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
      case 'deleted':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      case 'archive':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
      case 'junk':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
      case 'drafts':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      default:
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
    }
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between ${isChild ? 'pl-1 py-1' : 'px-3 py-1'} text-left transition-colors ${
        isActive
          ? 'bg-[#004E8C] text-white font-semibold'
          : 'text-outlook-text-secondary hover:bg-outlook-hover'
      }`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-outlook-text-secondary">{getIcon()}</span>
        <span className="text-sm">{folder.name}</span>
      </div>
      {count > 0 && (
        <span className={`text-[11px] ${isActive ? 'text-white' : 'text-outlook-blue'} font-semibold px-1`}>
          {count}
        </span>
      )}
    </button>
  )
}

