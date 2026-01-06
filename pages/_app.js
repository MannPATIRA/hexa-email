import '../styles/globals.css'
import { DemoStateProvider, useDemoState, STAGES } from '../lib/demoState'
import emailsData from '../data/emails.json'
import { useEffect } from 'react'

function AppWithDemoState({ Component, pageProps }) {
  const demoState = useDemoState()
  
  // Expose demo state to window for components that can't use hooks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.demoState = {
        ...demoState,
        STAGES
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.demoState
      }
    }
  }, [demoState])

  return <Component {...pageProps} />
}

export default function App({ Component, pageProps }) {
  // Only wrap with DemoStateProvider if not the flow page or email page (they have their own)
  const isFlowPage = Component.name === 'Flow'
  const isEmailPage = Component.name === 'EmailDetail'
  
  if (isFlowPage || isEmailPage) {
    return <Component {...pageProps} />
  }

  return (
    <DemoStateProvider initialEmails={emailsData}>
      <AppWithDemoState Component={Component} pageProps={pageProps} />
    </DemoStateProvider>
  )
}

