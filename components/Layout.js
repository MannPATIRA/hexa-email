import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from './Header'
import Sidebar from './Sidebar'
import EmailList from './EmailList'
import ReadingPane from './ReadingPane'
import ComposeModal from './ComposeModal'
import ResizablePane from './ResizablePane'
import emailsData from '../data/emails.json'
import foldersData from '../data/folders.json'
import { filterEmailsByFolder, filterEmailsBySearch } from '../lib/emailUtils'

export default function Layout({ children }) {
  const router = useRouter()
  const [emails, setEmails] = useState(emailsData)
  const [folders] = useState(foldersData)
  const [currentFolder, setCurrentFolder] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isComposeOpen, setIsComposeOpen] = useState(false)

  // Load emails from localStorage on mount
  useEffect(() => {
    const savedEmails = localStorage.getItem('procureflow-emails')
    if (savedEmails) {
      try {
        setEmails(JSON.parse(savedEmails))
      } catch (e) {
        console.error('Failed to load emails from localStorage', e)
      }
    }
  }, [])

  // Save emails to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('procureflow-emails', JSON.stringify(emails))
  }, [emails])

  // Handle email selection from URL (e.g., /email/[id])
  useEffect(() => {
    if (router.query.id && router.isReady) {
      const emailId = router.query.id
      const email = emails.find(e => e.id === emailId)
      if (email && selectedEmail?.id !== emailId) {
        setSelectedEmail(email)
        setCurrentFolder(email.folder)
        // Mark as read when opened from URL
        if (!email.read) {
          setEmails(prevEmails => prevEmails.map(e => e.id === emailId ? { ...e, read: true } : e))
        }
      }
    }
  }, [router.query.id, router.isReady])

  const handleFolderSelect = (folderId) => {
    if (folderId === 'compose') {
      setIsComposeOpen(true)
      return
    }
    setCurrentFolder(folderId)
    setSelectedEmail(null)
    setSearchQuery('')
    // Clear email from URL when switching folders
    if (router.pathname.startsWith('/email/')) {
      router.push('/inbox', undefined, { shallow: true })
    }
  }

  const handleEmailSelect = (email) => {
    setSelectedEmail(email)
    // Update URL when email is selected
    router.push(`/email/${email.id}`, undefined, { shallow: true })
    // Mark as read when selected
    if (!email.read) {
      setEmails(prevEmails => prevEmails.map(e => e.id === email.id ? { ...e, read: true } : e))
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query) {
      setSelectedEmail(null)
    }
  }

  const handleDelete = (emailId) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, folder: 'deleted' } : e
    ))
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null)
    }
  }

  const handleArchive = (emailId) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, folder: 'archive' } : e
    ))
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null)
    }
  }

  const handleMarkRead = (emailId) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, read: !e.read } : e
    ))
    if (selectedEmail?.id === emailId) {
      setSelectedEmail({ ...selectedEmail, read: !selectedEmail.read })
    }
  }

  const handleSend = (newEmail) => {
    setEmails([newEmail, ...emails])
  }

  // Filter emails based on folder and search
  let filteredEmails = filterEmailsByFolder(emails, currentFolder)
  if (searchQuery) {
    filteredEmails = filterEmailsBySearch(filteredEmails, searchQuery)
  } else {
    // Sort by date (newest first)
    filteredEmails = [...filteredEmails].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header onSearch={handleSearch} />
      <div className="flex-1 flex overflow-hidden">
        <ResizablePane
          defaultWidth={250}
          minWidth={180}
          maxWidth={400}
          storageKey="procureflow-sidebar-width"
        >
          <Sidebar
            folders={folders}
            emails={emails}
            currentFolder={currentFolder}
            onFolderSelect={handleFolderSelect}
          />
        </ResizablePane>
        <div className="flex-1 flex overflow-hidden">
          <ResizablePane
            defaultWidth={400}
            minWidth={300}
            maxWidth={600}
            storageKey="procureflow-emaillist-width"
          >
            <div className="h-full bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {folders.find(f => f.id === currentFolder)?.name || 'Mail'}
                </h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <EmailList
                  emails={filteredEmails}
                  selectedEmailId={selectedEmail?.id}
                  onEmailSelect={handleEmailSelect}
                />
              </div>
            </div>
          </ResizablePane>
          <div className="flex-1 overflow-hidden">
            <ReadingPane
              email={selectedEmail}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onMarkRead={handleMarkRead}
            />
          </div>
        </div>
      </div>
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSend}
      />
    </div>
  )
}

