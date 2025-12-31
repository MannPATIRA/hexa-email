import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Always redirect to flow page for the demo
    router.push('/flow')
  }, [router])

  return null
}

