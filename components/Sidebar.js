import { useState, useMemo } from 'react'
import { getUnreadCount, getPartFolders } from '../lib/emailUtils'

// CSS variables for sidebar sizing - easy to tweak
const sizing = {
  rowHeight: 32,
  sectionHeaderHeight: 26,
  fontSize: '13px',
  sectionFontSize: '11px',
  iconSize: 16,
  iconColumnWidth: 34, // Fixed width icon column for alignment
  iconToTextGap: 6, // Consistent gap between icon and text
  chevronSize: 10,
  chevronColumnWidth: 16, // Fixed width for chevron area
  leftPadding: 8,
  nestedIndent: 14,
  countColumnWidth: 44, // Fixed width for count alignment
  railWidth: 52,
  folderWidth: 248,
}

// Colors matching Outlook dark theme - #272727 chrome
const colors = {
  // Both rail and folder column share the same flat chrome background
  chromeBg: '#272727', // Main chrome background (matches body)
  dividerLine: 'rgba(255, 255, 255, 0.04)', // Very subtle vertical dividers only
  // Selection: subtle dark blue-grey
  selectedBg: 'rgba(30, 60, 95, 0.55)',
  selectedBorder: '#0078D4',
  hoverBg: 'rgba(255, 255, 255, 0.04)',
  textPrimary: '#e5e5e5',
  textSecondary: '#999999',
  textMuted: '#707070',
  accentBlue: '#0078D4',
  iconDefault: '#888888',
  iconSelected: '#60CDFF',
  // No horizontal dividers - use spacing instead
}

// Inline styles as objects
const styles = {
  sidebarRow: {
    position: 'relative',
    height: `${sizing.rowHeight}px`,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${sizing.leftPadding}px`,
    gap: 0, // Gap handled by fixed column widths
    overflow: 'visible',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
  selectionBg: {
    position: 'absolute',
    top: '2px',
    bottom: '2px',
    left: '6px',
    right: '14px', // Extra inset to clear scrollbar and avoid clipping
    borderRadius: '6px',
    background: colors.selectedBg,
    zIndex: 0,
    pointerEvents: 'none',
  },
  // Fixed width chevron column
  chevronWrap: {
    width: `${sizing.chevronColumnWidth}px`,
    flex: `0 0 ${sizing.chevronColumnWidth}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  // Fixed width icon column - ensures text always starts at same x position
  iconWrap: {
    width: `${sizing.iconColumnWidth}px`,
    flex: `0 0 ${sizing.iconColumnWidth}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 1,
    marginRight: `${sizing.iconToTextGap}px`, // Consistent gap to text
  },
  // Force all SVGs to exact same size
  svgIcon: {
    width: `${sizing.iconSize}px`,
    height: `${sizing.iconSize}px`,
    minWidth: `${sizing.iconSize}px`,
    minHeight: `${sizing.iconSize}px`,
    maxWidth: `${sizing.iconSize}px`,
    maxHeight: `${sizing.iconSize}px`,
    display: 'block',
    overflow: 'visible',
  },
  // Label wrapper - takes remaining space
  labelWrap: {
    flex: '1 1 auto',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
    overflow: 'hidden',
  },
  label: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    fontSize: sizing.fontSize,
  },
  // Fixed width count column - right aligned
  countWrap: {
    width: `${sizing.countColumnWidth}px`,
    flex: `0 0 ${sizing.countColumnWidth}px`,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1,
    marginRight: '4px', // Padding from row edge
  },
  // Base count badge styling
  count: {
    fontSize: '12px',
    fontWeight: 700,
    color: colors.accentBlue,
    lineHeight: 1,
    minWidth: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px',
    borderRadius: '10px',
    background: 'transparent',
  },
  // Count badge when row is selected - subtle background for emphasis
  countSelected: {
    fontSize: '12px',
    fontWeight: 700,
    color: colors.accentBlue,
    lineHeight: 1,
    minWidth: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px',
    borderRadius: '10px',
    background: 'rgba(74, 163, 255, 0.15)', // Subtle blue background
  },
}

export default function Sidebar({ folders, emails, currentFolder, onFolderSelect }) {
  const [expandedAccountIds, setExpandedAccountIds] = useState(['im322@ic.ac.uk'])
  const [expandedFolders, setExpandedFolders] = useState(['agent'])
  const [favouritesExpanded, setFavouritesExpanded] = useState(true)
  const [savedSearchesExpanded, setSavedSearchesExpanded] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  
  const partFolders = useMemo(() => getPartFolders(emails), [emails])
  
  const foldersWithParts = useMemo(() => {
    return folders.map(folder => {
      if (folder.id === 'agent') {
        return { ...folder, children: partFolders }
      }
      return folder
    })
  }, [folders, partFolders])

  const regularFolders = foldersWithParts.filter(f => f.id !== 'agent')
  const agentFolder = foldersWithParts.find(f => f.id === 'agent')

  const accounts = useMemo(() => [
    { id: 'im322@ic.ac.uk', name: 'im322@ic.ac.uk', folders: regularFolders }
  ], [regularFolders])

  const toggleAccount = (accountId) => {
    setExpandedAccountIds(prev =>
      prev.includes(accountId) ? prev.filter(id => id !== accountId) : [...prev, accountId]
    )
  }

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    )
  }

  // Outlook inbox icon - filled rounded square with inner tray notch
  // Matches the exact reference image
  const InboxTrayIcon = ({ color }) => (
    <svg 
      style={{ ...styles.svgIcon, color }}
      viewBox="0 0 16 16" 
      fill="currentColor"
    >
      {/* Outer rounded rectangle with inner tray cutout */}
      <path 
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 4C2 2.89543 2.89543 2 4 2H12C13.1046 2 14 2.89543 14 4V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V4ZM3 9H5.5C5.77614 9 6 9.22386 6 9.5C6 10.3284 6.67157 11 7.5 11H8.5C9.32843 11 10 10.3284 10 9.5C10 9.22386 10.2239 9 10.5 9H13V4C13 3.44772 12.5523 3 12 3H4C3.44772 3 3 3.44772 3 4V9ZM3 10V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V10H10.9646C10.7219 11.1652 9.70948 12 8.5 12H7.5C6.29052 12 5.2781 11.1652 5.03544 10H3Z"
      />
    </svg>
  )

  // Icons with expanded viewBox to prevent clipping
  const getFolderIcon = (folderId, isSelected) => {
    const iconColor = isSelected ? colors.iconSelected : colors.iconDefault
    const svgProps = {
      style: { ...styles.svgIcon, color: iconColor },
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      strokeWidth: 1.8,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }
    
    switch (folderId) {
      case 'inbox':
        // Use Outlook-style inbox tray icon
        return <InboxTrayIcon color={iconColor} />
      case 'sent':
        // Paper plane icon
        return (
          <svg {...svgProps} style={{ ...svgProps.style, transform: 'rotate(-45deg)' }}>
            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )
      case 'deleted':
        // Trash bin icon
        return (
          <svg {...svgProps}>
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )
      case 'archive':
        // Archive box icon
        return (
          <svg {...svgProps}>
            <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        )
      case 'drafts':
        // Pencil/edit icon
        return (
          <svg {...svgProps}>
            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      case 'junk':
        // No entry / block icon
        return (
          <svg {...svgProps}>
            <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        )
      default:
        // Folder icon
        return (
          <svg {...svgProps}>
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        )
    }
  }

  const renderFolderRow = (folder, depth = 0) => {
    const isActive = currentFolder === folder.id
    const isHovered = hoveredId === folder.id
    const isAgentFolder = folder.id?.startsWith('agent-')
    const count = (isAgentFolder || folder.count === undefined)
      ? getUnreadCount(emails, folder.id)
      : folder.count || 0
    const hasChildren = folder.isExpandable && folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.includes(folder.id)
    const indent = depth * sizing.nestedIndent

      return (
        <div key={folder.id}>
          <button
          onClick={() => hasChildren ? toggleFolder(folder.id) : onFolderSelect(folder.id)}
          onMouseEnter={() => setHoveredId(folder.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            ...styles.sidebarRow,
            paddingLeft: `${sizing.leftPadding + indent}px`,
          }}
        >
          {/* Selection/Hover background layer */}
          {(isActive || isHovered) && (
            <span style={{
              ...styles.selectionBg,
              background: isActive ? colors.selectedBg : colors.hoverBg,
            }} />
          )}
          
          {/* Fixed-width chevron column */}
          <span style={styles.chevronWrap}>
            {hasChildren ? (
              <svg
                style={{
                  width: `${sizing.chevronSize}px`,
                  height: `${sizing.chevronSize}px`,
                  color: colors.textMuted,
                  display: 'block',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            ) : null}
          </span>
          
          {/* Fixed-width icon column - ensures text starts at same x position */}
          <span style={styles.iconWrap}>
            {getFolderIcon(folder.id, isActive)}
          </span>
          
          {/* Label wrapper - flex grows to fill space */}
          <span style={styles.labelWrap}>
            <span style={{
              ...styles.label,
              color: isActive ? colors.accentBlue : colors.textPrimary,
              fontWeight: isActive ? 500 : 400,
            }}>
              {folder.name}
            </span>
          </span>
          
          {/* Fixed-width count column - right aligned */}
          <span style={styles.countWrap}>
            {count > 0 && (
              <span style={isActive ? styles.countSelected : styles.count}>{count}</span>
            )}
          </span>
          </button>
        
        {hasChildren && isExpanded && (
          <div>
            {folder.children.map((child) => renderFolderRow(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

  const favouritesFolders = regularFolders.filter(f => ['inbox', 'sent', 'deleted'].includes(f.id))

  // Section header - uses same column layout for consistency
  const SectionHeader = ({ label, expanded, onToggle }) => (
    <button
      onClick={onToggle}
      style={{
        ...styles.sidebarRow,
        height: `${sizing.sectionHeaderHeight}px`,
      }}
      className="group"
    >
      {/* Chevron column */}
      <span style={styles.chevronWrap}>
        <svg
          style={{
            width: `${sizing.chevronSize}px`,
            height: `${sizing.chevronSize}px`,
            color: colors.textMuted,
            display: 'block',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </span>
      {/* No icon column for section headers */}
      {/* Label */}
      <span style={{ 
        color: colors.textMuted,
        fontWeight: 600,
        fontSize: sizing.sectionFontSize,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        lineHeight: 1,
        zIndex: 1,
      }}>
        {label}
      </span>
    </button>
  )

  // Account header - uses same column layout for consistency
  const AccountHeader = ({ account, expanded, onToggle }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
      <button
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={styles.sidebarRow}
      >
        {isHovered && (
          <span style={{ ...styles.selectionBg, background: colors.hoverBg }} />
        )}
        {/* Chevron column */}
        <span style={styles.chevronWrap}>
          <svg
            style={{
              width: `${sizing.chevronSize}px`,
              height: `${sizing.chevronSize}px`,
              color: colors.textMuted,
              display: 'block',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </span>
        {/* No icon column for account headers - label starts after chevron */}
        <span style={styles.labelWrap}>
          <span style={{ 
            ...styles.label,
            color: colors.textPrimary,
            fontWeight: 600,
          }}>
            {account.name}
          </span>
        </span>
      </button>
    )
  }

  return (
    <div className="h-full flex" style={{ 
      width: `${sizing.railWidth + sizing.folderWidth + 2}px`,
      backgroundColor: colors.chromeBg, // Continuous background for entire left area
    }}>
      {/* Icon Rail - same background as folder column, flat */}
      <div 
        style={{ 
          width: `${sizing.railWidth}px`, 
          flexShrink: 0,
          // No separate background - inherits from parent
        }}
        className="flex flex-col items-center py-2"
      >
        {/* Mail - Selected */}
        <button
          style={{ backgroundColor: 'rgba(0, 120, 212, 0.2)' }}
          className="w-9 h-9 flex items-center justify-center rounded-md mb-1"
        >
          <svg className="w-[18px] h-[18px]" style={{ color: colors.iconSelected, overflow: 'visible' }} fill="none" stroke="currentColor" viewBox="-2 -2 28 28">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
        
        {/* Calendar */}
        <button className="w-9 h-9 flex items-center justify-center rounded-md mb-1 transition-colors hover:bg-[rgba(255,255,255,0.06)]">
          <svg className="w-[18px] h-[18px]" style={{ color: colors.iconDefault, overflow: 'visible' }} fill="none" stroke="currentColor" viewBox="-2 -2 28 28">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        
        {/* People */}
        <button className="w-9 h-9 flex items-center justify-center rounded-md mb-1 transition-colors hover:bg-[rgba(255,255,255,0.06)]">
          <svg className="w-[18px] h-[18px]" style={{ color: colors.iconDefault, overflow: 'visible' }} fill="none" stroke="currentColor" viewBox="-2 -2 28 28">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
        
        {/* Files */}
        <button className="w-9 h-9 flex items-center justify-center rounded-md mb-1 transition-colors hover:bg-[rgba(255,255,255,0.06)]">
          <svg className="w-[18px] h-[18px]" style={{ color: colors.iconDefault, overflow: 'visible' }} fill="none" stroke="currentColor" viewBox="-2 -2 28 28">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        
        <div className="flex-1" />
        
        {/* More */}
        <button className="w-9 h-9 flex items-center justify-center rounded-md mb-1 transition-colors hover:bg-[rgba(255,255,255,0.06)]">
          <svg className="w-[18px] h-[18px]" style={{ color: colors.iconDefault, overflow: 'visible' }} fill="none" stroke="currentColor" viewBox="-2 -2 28 28">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
        </div>

      {/* Folder Column - flat, same background as rail, no card appearance */}
      {/* Dividers are handled via CSS pseudo-elements on this element */}
      <div 
        className="folder-nav-column"
        style={{ 
          width: `${sizing.folderWidth}px`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0, // Flat, no rounding
          // No separate background - inherits from parent
          // No margin - flush with top/bottom
        }}
      >
        {/* Scrollable area - selection backgrounds stay inside content bounds */}
        <div 
          className="flex-1 scrollbar-custom"
          style={{ 
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingTop: '4px',
            paddingBottom: '4px',
          }}
        >
          {/* Favourites */}
          <div style={{ marginBottom: '8px' }}>
            <SectionHeader 
              label="Favourites" 
              expanded={favouritesExpanded} 
              onToggle={() => setFavouritesExpanded(!favouritesExpanded)} 
            />
            {favouritesExpanded && favouritesFolders.map(folder => renderFolderRow(folder, 0))}
          </div>

          {/* Accounts - spacing replaces divider */}
          {accounts.map(account => {
            const isExpanded = expandedAccountIds.includes(account.id)
            return (
              <div key={account.id} style={{ marginBottom: '8px' }}>
                <AccountHeader 
                  account={account} 
                  expanded={isExpanded} 
                  onToggle={() => toggleAccount(account.id)} 
                />
                {isExpanded && account.folders.map(folder => renderFolderRow(folder, 0))}
          </div>
            )
          })}

          {/* Agent folder - spacing replaces divider */}
          {agentFolder && (
            <div style={{ marginTop: '8px' }}>
              {renderFolderRow(agentFolder, 0)}
            </div>
          )}

          {/* Saved Searches - spacing replaces divider */}
          <div style={{ marginTop: '12px' }}>
            <SectionHeader 
              label="Saved Searches" 
              expanded={savedSearchesExpanded} 
              onToggle={() => setSavedSearchesExpanded(!savedSearchesExpanded)} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
