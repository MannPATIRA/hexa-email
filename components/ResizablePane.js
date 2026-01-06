import { useState, useRef, useEffect } from 'react'

export default function ResizablePane({ 
  children, 
  defaultWidth, 
  minWidth = 200, 
  maxWidth = 800,
  storageKey,
  onResize 
}) {
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (parsed >= minWidth && parsed <= maxWidth) {
          return parsed
        }
      }
    }
    return defaultWidth
  })
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const paneRef = useRef(null)
  const resizeHandleRef = useRef(null)

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, width.toString())
    }
    if (onResize) {
      onResize(width)
    }
  }, [width, storageKey, onResize])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return
      
      e.preventDefault()
      e.stopPropagation()
      
      const diff = e.clientX - startX
      const newWidth = startWidth + diff
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(clampedWidth)
    }

    const handleMouseUp = (e) => {
      if (!isResizing) return
      
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp, { passive: false })
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.body.style.pointerEvents = 'none'
      
      if (resizeHandleRef.current) {
        resizeHandleRef.current.style.pointerEvents = 'auto'
      }
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.body.style.pointerEvents = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.body.style.pointerEvents = ''
    }
  }, [isResizing, startX, startWidth, minWidth, maxWidth])

  const handleMouseDown = (e) => {
    // Only start resizing if clicking directly on the handle
    e.preventDefault()
    e.stopPropagation()
    
    if (paneRef.current) {
      const rect = paneRef.current.getBoundingClientRect()
      setStartX(e.clientX)
      setStartWidth(rect.width)
      setIsResizing(true)
    }
  }

  return (
    <div 
      ref={paneRef}
      className="relative flex-shrink-0"
      style={{ width: `${width}px` }}
    >
      {children}
      <div
        ref={resizeHandleRef}
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize group z-20"
        style={{ 
          marginRight: '-4px',
          touchAction: 'none',
          background: 'transparent',
        }}
      >
        {/* Only show indicator when resizing */}
        <div className={`absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-0.5 h-16 bg-outlook-blue rounded-full ${
          isResizing ? 'opacity-100' : 'opacity-0'
        } transition-opacity pointer-events-none`} />
      </div>
    </div>
  )
}

