import { useMobile } from '@/hooks/use-mobile'
import { DailyTrackingCell } from './daily-tracking-cell'
import { getShortDayName } from '@/lib/utils/date'
import type { FormAccommodation, Accommodation, DailyTracking } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FormAccommodationWithDetails extends FormAccommodation {
  accommodation: Accommodation
  dailyTracking: DailyTracking[]
}

interface DailyTrackingGridProps {
  formAccommodations: FormAccommodationWithDetails[]
  formId: number
}

export function DailyTrackingGrid({ formAccommodations, formId }: DailyTrackingGridProps) {
  const isMobile = useMobile()

  if (isMobile) {
    // Mobile: Stacked vertical view
    return (
      <div className="space-y-3">
        {formAccommodations.map((fa) => (
          <Card key={fa.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{fa.accommodation.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4, 5].map((day) => {
                const tracking = fa.dailyTracking.find((t) => t.dayOfWeek === day)
                return (
                  <div key={day} className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      {getShortDayName(day)}
                    </div>
                    {tracking && (
                      <DailyTrackingCell
                        trackingId={tracking.id}
                        initialStatus={tracking.status}
                        formId={formId}
                      />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Desktop: Table view
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr className="bg-muted">
            <th className="border border-border p-3 text-left font-semibold min-w-[200px]">
              Accommodation
            </th>
            {[1, 2, 3, 4, 5].map((day) => (
              <th
                key={day}
                className="border border-border p-3 text-center font-semibold min-w-[120px]"
              >
                {getShortDayName(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {formAccommodations.map((fa) => (
            <tr key={fa.id} className="hover:bg-muted/50">
              <td className="border border-border p-3">{fa.accommodation.name}</td>
              {[1, 2, 3, 4, 5].map((day) => {
                const tracking = fa.dailyTracking.find((t) => t.dayOfWeek === day)
                return (
                  <td key={day} className="border border-border p-2">
                    {tracking && (
                      <DailyTrackingCell
                        trackingId={tracking.id}
                        initialStatus={tracking.status}
                        formId={formId}
                      />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
