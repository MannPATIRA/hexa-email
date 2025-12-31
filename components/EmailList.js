import EmailItem from './EmailItem'

export default function EmailList({ emails, selectedEmailId, onEmailSelect }) {
  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg">No emails</p>
          <p className="text-sm mt-2">Your inbox is empty</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
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

