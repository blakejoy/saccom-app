import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'

export function StudentSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const handleSearch = (value: string) => {
    setSearch(value)

    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }

    setSearchParams(params)
  }

  return (
    <div className="w-full max-w-md">
      <Input
        type="text"
        placeholder="Search by student number or initials..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}
