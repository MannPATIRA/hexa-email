import SearchBar from './SearchBar'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header({ onSearch, selectedEmail, onSendToAgent, isProcessing }) {
  const isEngineeringEmail = selectedEmail && (
    selectedEmail.from?.includes('sarah.chen') || 
    selectedEmail.from?.includes('engineering') ||
    selectedEmail.subject?.toLowerCase().includes('rfq request')
  );

  const isAgentActive = selectedEmail && (selectedEmail.isAgentEmail || selectedEmail.rfqId);
  
  const canSendToAgent = isEngineeringEmail && !isAgentActive && onSendToAgent;

  // Show button if it can be sent, if it's already an agent email, or if it's currently processing
  const showHexaButton = canSendToAgent || isAgentActive || isProcessing;

  return (
    <div className="flex flex-col">
      {/* Top Search Rail - darker background */}
      <div className="h-12 flex items-center px-4 justify-between" style={{ background: '#141414' }}>
        {/* Left side - 9-dots */}
        <div className="flex items-center" style={{ gap: '4px' }}>
          {/* 9-dots app launcher */}
          <button className="p-2 hover:bg-outlook-hover rounded transition-colors text-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="5" r="2" />
              <circle cx="12" cy="5" r="2" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
              <circle cx="5" cy="19" r="2" />
              <circle cx="12" cy="19" r="2" />
              <circle cx="19" cy="19" r="2" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 max-w-2xl px-4 flex justify-center">
          <div className="w-full max-w-xl">
        <SearchBar onSearch={onSearch} />
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button className="p-2 text-outlook-text-secondary hover:text-white hover:bg-outlook-hover rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <button className="p-2 text-outlook-text-secondary hover:text-white hover:bg-outlook-hover rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </div>

      {/* Primary Toolbar - uses chrome background */}
      <div className="h-12 flex items-center px-4 justify-between bg-outlook-chrome">
        <div className="flex items-center" style={{ gap: '10px' }}>
          {/* Hamburger menu */}
          <button className="p-2 hover:bg-outlook-hover rounded transition-colors text-white mr-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <button className="bg-outlook-blue hover:bg-outlook-blue-hover text-white px-4 py-1.5 rounded flex items-center space-x-2 text-sm font-semibold transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>New Email</span>
          </button>

          <div className="flex items-center space-x-1">
            <ToolbarButton icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} label="Delete" />
            <ToolbarButton icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} label="Archive" />
            <ToolbarButton icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>} label="Move" />
            <ToolbarButton icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-7h.01" /></svg>} label="Flag" />
            <ToolbarButton icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} label="Mark as Unread" />
            <ToolbarButton icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} label="Sync" />
            <ToolbarButton icon={<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} label="Block" />
            
            {showHexaButton && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0,
                  boxShadow: (isProcessing || isAgentActive)
                    ? ["0 0 0px rgba(34, 197, 94, 0)", "0 0 20px rgba(34, 197, 94, 0.3)", "0 0 0px rgba(34, 197, 94, 0)"]
                    : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                transition={{ 
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.2 }
                }}
                onClick={() => canSendToAgent && onSendToAgent(selectedEmail)}
                className={`flex items-center space-x-2.5 pl-2 pr-3 py-1.5 rounded transition-all relative overflow-hidden group ${
                  (isProcessing || isAgentActive)
                    ? 'bg-[#064e3b] cursor-default' 
                    : 'bg-[#065f46] hover:bg-[#047857] shadow-lg active:scale-95'
                }`}
              >
                {/* Processing gradient overlay */}
                {(isProcessing || isAgentActive) && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                  />
                )}
                
                <div className="relative flex items-center space-x-2 z-10">
                  <motion.img 
                    src="/hexa-logo.png" 
                    alt="Hexa" 
                    className="w-4 h-4 object-contain brightness-0 invert"
                    animate={isProcessing ? { 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[11px] font-bold text-white tracking-[0.05em] uppercase">
                    HEXA
                  </span>
                </div>
              </motion.button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-1.5 hover:bg-outlook-hover rounded transition-colors text-white flex items-center">
            <img src="/copilot-logo.png" alt="Copilot" className="w-8 h-8 object-contain translate-x-[5px]" />
            <span className="text-xs font-semibold ml-2.5">Copilot</span>
            <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({ icon, label }) {
  return (
    <button className="flex items-center space-x-2 px-2 py-1.5 hover:bg-outlook-hover rounded transition-colors text-white">
      <span className="text-outlook-text-secondary">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

