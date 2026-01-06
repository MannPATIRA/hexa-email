import EmailItem from './EmailItem'

export default function EmailList({ emails, selectedEmailId, onEmailSelect }) {
  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-outlook-text-secondary">
        <div className="text-center">
          <p className="text-sm">No emails</p>
          <p className="text-xs mt-1 text-outlook-text-tertiary">Your inbox is empty</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-custom">
      <div className="px-4 py-2 flex items-center space-x-2 text-outlook-text-secondary">
        <svg className="w-3 h-3 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-[11px] font-bold uppercase tracking-wider">Today</span>
      </div>
      {emails.map((email) => (
        <EmailItem
          key={email.id}
          email={email}
          isSelected={selectedEmailId === email.id}
          onClick={() => onEmailSelect(email)}
        />
      ))}
    </div>
  )
}

