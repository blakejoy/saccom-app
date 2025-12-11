import { redirect } from 'next/navigation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string; formId: string }> }
) {
  const { studentId, formId } = await params
  // For now, redirect to print page where users can print to PDF
  // In a future iteration, we could implement full PDF generation with @react-pdf/renderer
  redirect(`/students/${studentId}/forms/${formId}/print`)
}
