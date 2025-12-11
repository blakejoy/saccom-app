'use client'

import { useState, useTransition } from 'react'
import { createFormWithAccommodations } from '@/lib/actions/forms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Accommodation, Template } from '@/lib/db/schema'
import {
  getCurrentWeekNumber,
  getCurrentYear,
  getMondayOfWeek,
  formatISODate,
  formatWeekRange,
} from '@/lib/utils/date'

interface FormCreationFormProps {
  studentId: number
  accommodations: Accommodation[]
  templates: Template[]
}

export function FormCreationForm({
  studentId,
  accommodations,
  templates,
}: FormCreationFormProps) {
  const [isPending, startTransition] = useTransition()
  const [weekNumber, setWeekNumber] = useState(getCurrentWeekNumber())
  const [year, setYear] = useState(getCurrentYear())
  const [isSas, setIsSas] = useState(false)
  const [selectedAccommodations, setSelectedAccommodations] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate start date (Monday) based on week number and year
  const monday = getMondayOfWeek(weekNumber, year)
  const startDate = formatISODate(monday)
  const weekRange = formatWeekRange(monday)

  // Filter accommodations based on search
  const filteredAccommodations = accommodations.filter((acc) =>
    acc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleAccommodation = (id: number) => {
    setSelectedAccommodations((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedAccommodations(filteredAccommodations.map((a) => a.id))
  }

  const handleDeselectAll = () => {
    setSelectedAccommodations([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSas && selectedAccommodations.length === 0) {
      alert('Please select at least one accommodation or mark as SAS.')
      return
    }

    startTransition(async () => {
      await createFormWithAccommodations({
        studentId,
        weekNumber,
        year,
        startDate,
        isSas,
        accommodationIds: isSas ? [] : selectedAccommodations,
      })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Week Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weekNumber">Week Number</Label>
          <Input
            id="weekNumber"
            type="number"
            min="1"
            max="53"
            value={weekNumber}
            onChange={(e) => setWeekNumber(parseInt(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            min="2024"
            max="2050"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            required
          />
        </div>
      </div>

      {/* Week Range Display */}
      <div className="p-3 bg-muted rounded-md">
        <p className="text-sm">
          <span className="font-medium">Week Period:</span> {weekRange}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Start Date (Monday): {startDate}
        </p>
      </div>

      {/* SAS Toggle */}
      <div className="flex items-start gap-3 p-3 sm:p-4 border rounded-md">
        <input
          type="checkbox"
          id="isSas"
          checked={isSas}
          onChange={(e) => {
            setIsSas(e.target.checked)
            if (e.target.checked) {
              setSelectedAccommodations([])
            }
          }}
          className="h-5 w-5 rounded border-gray-300 flex-shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <Label htmlFor="isSas" className="cursor-pointer font-semibold text-sm sm:text-base">
            Student Accessibility Services (SAS)
          </Label>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Check this if the student uses standard SAS accommodations
          </p>
        </div>
      </div>

      {/* Accommodation Selection */}
      {!isSas && (
        <div className="space-y-4">
          <div>
            <Label className="text-base">Select Accommodations</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the accommodations that apply to this student
            </p>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex-1 text-xs sm:text-sm"
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="flex-1 text-xs sm:text-sm"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Selected Count */}
          <p className="text-sm text-muted-foreground">
            {selectedAccommodations.length} accommodation(s) selected
          </p>

          {/* Accommodation List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto p-1 sm:p-2 border rounded-md">
            {filteredAccommodations.map((accommodation) => (
              <label
                key={accommodation.id}
                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors min-h-[44px]"
              >
                <input
                  type="checkbox"
                  checked={selectedAccommodations.includes(accommodation.id)}
                  onChange={() => handleToggleAccommodation(accommodation.id)}
                  className="mt-0.5 h-5 w-5 flex-shrink-0 rounded border-gray-300"
                />
                <span className="text-xs sm:text-sm flex-1 leading-relaxed break-words">
                  {accommodation.name}
                </span>
              </label>
            ))}
          </div>

          {filteredAccommodations.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No accommodations found matching "{searchQuery}"
            </p>
          )}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 min-h-[44px]"
          disabled={isPending || (!isSas && selectedAccommodations.length === 0)}
        >
          {isPending ? 'Creating...' : 'Create Form'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 min-h-[44px]"
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
