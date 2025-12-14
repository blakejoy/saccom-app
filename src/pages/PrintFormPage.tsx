import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { formatWeekRange, getMondayOfWeek, getDayName } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { generatePdfFromElement } from '@/lib/pdf'
import type { FormAccommodation, DailyTracking } from '@/lib/db/schema'

export default function PrintFormPage() {
  const { formId } = useParams<{ formId: string }>()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')

  const { data: form, isLoading, error } = useQuery({
    queryKey: ['form', parseInt(formId!)],
    queryFn: async () => {
      console.log('Fetching form with ID:', formId)
      const result = await window.electronAPI.forms.getById({ id: parseInt(formId!) })
      console.log('Form data received:', result)
      return result
    },
  })

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const printElement = document.getElementById('print-content')
      if (!printElement) throw new Error('Print content not found')
      await generatePdfFromElement(
        printElement,
        `${form!.student.initials}-Week${form!.weekNumber}-${form!.year}.pdf`,
        orientation
      )
    } catch (error) {
      alert('Failed to generate PDF')
      console.error(error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading form...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          <p>Error loading form</p>
          <p className="text-sm mt-2">{(error as Error).message}</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">
          <p>Form not found</p>
          <p className="text-sm mt-2">Form ID: {formId}</p>
        </div>
      </div>
    )
  }

  const monday = getMondayOfWeek(form.weekNumber, form.year)
  const weekRange = formatWeekRange(monday)

  return (
    <div>
      {/* Print Controls - Hidden when printing */}
      <div className="no-print fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
        <div className="mb-3">
          <p className="text-sm font-semibold mb-2">Orientation:</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={orientation === 'landscape' ? 'default' : 'outline'}
              onClick={() => setOrientation('landscape')}
            >
              Landscape
            </Button>
            <Button
              size="sm"
              variant={orientation === 'portrait' ? 'default' : 'outline'}
              onClick={() => setOrientation('portrait')}
            >
              Portrait
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="default">
            Print
          </Button>
          <Button
            onClick={handleDownloadPdf}
            variant="outline"
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
          </Button>
          <Button onClick={() => window.close()} variant="ghost">
            Close
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div id="print-content" className="p-8 max-w-[1200px] mx-auto bg-white">
        {/* Header */}
        <div className="mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold mb-2">
            Weekly Accommodation Tracking Form
          </h1>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Student</p>
              <p className="font-semibold text-lg">{form.student.initials}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Student Number</p>
              <p className="font-semibold text-lg">{form.student.studentNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Week</p>
              <p className="font-semibold text-lg">
                Week {form.weekNumber}, {form.year}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Period</p>
              <p className="font-semibold text-lg">{weekRange}</p>
            </div>
          </div>
          {form.isSas && (
            <div className="mt-4 inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-md font-semibold">
              Student Accessibility Services (SAS)
            </div>
          )}
        </div>

        {/* Accommodation Table */}
        {form.isSas ? (
          <div className="text-center py-12 text-gray-600">
            This student is using standard Student Accessibility Services accommodations.
            <br />
            No daily tracking needed for SAS forms.
          </div>
        ) : form.formAccommodations.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No accommodations selected for this form.
          </div>
        ) : (
          <table className="w-full border-collapse border-2 border-gray-800">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-gray-800 p-3 text-left font-bold w-1/3">
                  Accommodation
                </th>
                {[1, 2, 3, 4, 5].map((day) => (
                  <th
                    key={day}
                    className="border-2 border-gray-800 p-3 text-center font-bold"
                  >
                    {getDayName(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {form.formAccommodations.map((fa: any) => (
                <tr key={fa.id}>
                  <td className="border-2 border-gray-800 p-3 font-medium">
                    {fa.accommodation.name}
                  </td>
                  {[1, 2, 3, 4, 5].map((day) => {
                    const tracking = fa.dailyTracking.find((t: any) => t.dayOfWeek === day)
                    const status = tracking?.status || 'n/a'

                    let bgColor = 'bg-white'
                    let symbol = ''

                    if (status === 'accepted') {
                      bgColor = 'bg-green-100'
                      symbol = '✓'
                    } else if (status === 'rejected') {
                      bgColor = 'bg-red-100'
                      symbol = '✗'
                    } else {
                      bgColor = 'bg-gray-50'
                      symbol = 'N/A'
                    }

                    return (
                      <td
                        key={day}
                        className={`border-2 border-gray-800 p-3 text-center font-bold text-lg ${bgColor}`}
                      >
                        {symbol}
                        {tracking?.notes && (
                          <div className="text-xs text-gray-600 mt-1 font-normal">
                            {tracking.notes}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-400 text-sm text-gray-600">
          <p>
            Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <p className="mt-2">
            <strong>Legend:</strong> ✓ = Accepted | ✗ = Rejected | N/A = Not Applicable
          </p>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }

          @page {
            size: A4 ${orientation};
            margin: 15mm;
          }

          body {
            margin: 0;
            padding: 0;
          }

          #print-content {
            max-width: 100%;
            padding: 20px;
          }

          table {
            page-break-inside: avoid;
          }

          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
