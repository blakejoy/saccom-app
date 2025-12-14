import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Generate a PDF from an HTML element
 * @param element - The HTML element to convert to PDF
 * @param filename - The name of the PDF file to download
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Get canvas dimensions
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 297 // A4 width in mm (landscape)
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Create PDF in landscape mode to fit wide tables
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    // Add image to PDF
    const pageHeight = pdf.internal.pageSize.getHeight()
    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if content is too long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download the PDF
    pdf.save(filename)
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error('Failed to generate PDF')
  }
}
