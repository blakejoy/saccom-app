import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'

export function StudentSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debounceTimer = useRef<number>()
  const isTyping = useRef(false)

  // Update local state if URL params change externally (but not while user is typing)
  useEffect(() => {
    if (isTyping.current) return // Don't update while user is actively typing

    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== search) {
      setSearch(urlSearch)
    }
  }, [searchParams])

  const handleSearch = (value: string) => {
    isTyping.current = true
    setSearch(value)

    // Debounce the URL update
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('search', value.trim())
      } else {
        params.delete('search')
      }
      setSearchParams(params)
      isTyping.current = false // Done typing after debounce completes
    }, 300) as unknown as number // 300ms debounce
  }

  const handleClear = () => {
    handleSearch('')
  }

  return (
    <div className="w-full max-w-md">
      <Input
        type="text"
        placeholder="Search by student number or initials..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        showClear
        onClear={handleClear}
      />
    </div>
  )
}
