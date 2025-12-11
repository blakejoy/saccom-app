import { notFound } from 'next/navigation'
import { getFormById } from '@/lib/actions/forms'
import { formatWeekRange, getMondayOfWeek, getShortDayName } from '@/lib/utils/date'
import { PrintButton } from '@/components/forms/print-button'

export default async function PrintFormPage({
  params,
}: {
  params: Promise<{ studentId: string; formId: string }>
}) {
  const { studentId, formId } = await params
  const form = await getFormById(parseInt(formId))

  if (!form || form.studentId !== parseInt(studentId)) {
    notFound()
  }

  const monday = getMondayOfWeek(form.weekNumber, form.year)
  const weekRange = formatWeekRange(monday)

  return (
    <div className="p-8 max-w-7xl mx-auto print:p-4">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="mb-6 pb-4 border-b-2 border-black">
        <h1 className="text-2xl font-bold">Student Accommodation Tracker</h1>
        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold">Student:</span> {form.student.initials}
          </div>
          <div>
            <span className="font-semibold">Student #:</span> {form.student.studentNumber}
          </div>
          <div>
            <span className="font-semibold">Week:</span> {form.weekNumber}, {form.year}
          </div>
        </div>
        <div className="mt-1 text-sm">
          <span className="font-semibold">Period:</span> {weekRange}
        </div>
        {form.isSas && (
          <div className="mt-2 text-sm font-semibold">
            ✓ Student Accessibility Services (SAS)
          </div>
        )}
      </div>

      {/* Print Button */}
      <div className="mb-4 no-print">
        <PrintButton />
      </div>

      {/* Accommodations Table */}
      {form.isSas ? (
        <div className="text-center py-8">
          <p className="text-lg">
            This student uses standard Student Accessibility Services accommodations.
          </p>
        </div>
      ) : form.formAccommodations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg">No accommodations selected for this form.</p>
        </div>
      ) : (
        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border-2 border-black p-2 text-left text-sm font-bold">
                Accommodation
              </th>
              {[1, 2, 3, 4, 5].map((day) => (
                <th
                  key={day}
                  className="border-2 border-black p-2 text-center text-sm font-bold w-24"
                >
                  {getShortDayName(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {form.formAccommodations.map((fa) => (
              <tr key={fa.id}>
                <td className="border-2 border-black p-2 text-sm">
                  {fa.accommodation.name}
                </td>
                {[1, 2, 3, 4, 5].map((day) => {
                  const tracking = fa.dailyTracking.find((t) => t.dayOfWeek === day)
                  const status = tracking?.status || 'n/a'
                  const bgColor =
                    status === 'accepted'
                      ? 'bg-green-200'
                      : status === 'rejected'
                      ? 'bg-red-200'
                      : 'bg-gray-100'
                  const text =
                    status === 'accepted' ? '✓' : status === 'rejected' ? '✗' : 'N/A'

                  return (
                    <td
                      key={day}
                      className={`border-2 border-black p-2 text-center font-bold ${bgColor}`}
                    >
                      {text}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-2 border-black text-xs text-gray-600">
        <p>Generated with Student Accommodation Tracker</p>
      </div>
    </div>
  )
}
