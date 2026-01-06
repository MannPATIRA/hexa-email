import Layout from '../../components/Layout'
import { DemoStateProvider } from '../../lib/demoState'
import emailsData from '../../data/emails.json'

export default function EmailDetail() {
  // The Layout component handles email selection from the URL
  return (
    <DemoStateProvider initialEmails={emailsData}>
      <Layout />
    </DemoStateProvider>
  )
}

// Force Next.js to recognize this as a page

