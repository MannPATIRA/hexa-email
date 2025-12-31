import FolderItem from './FolderItem'

export default function Sidebar({ folders, emails, currentFolder, onFolderSelect }) {
  return (
    <div className="w-full bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
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
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              emails={emails}
              isActive={currentFolder === folder.id}
              onClick={() => onFolderSelect(folder.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

