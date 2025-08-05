import { Router } from 'express';
import PDFDocument from 'pdfkit';

const router = Router();

/**
 * Creates a nicely formatted PDF from chat history or analysis results.
 */
router.post('/', (req, res) => {
  const { title, content } = req.body;
  
  if (!Array.isArray(content) || content.length === 0) {
    return res.status(400).json({ error: 'Invalid content for PDF' });
  }

  try {
    // Create a PDF document with better formatting
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: title || 'Capture Chatbot Export',
        Author: 'Capture Chatbot',
        Subject: 'Chat Export',
        Keywords: 'capture, chatbot, export',
        CreationDate: new Date()
      }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="export-${Date.now()}.pdf"`);
    doc.pipe(res);

    // Add title
    doc.fontSize(24).font('Helvetica-Bold').text(title || 'Capture Chatbot Export', { align: 'center' });
    doc.moveDown();
    
    // Add timestamp
    const timestamp = new Date().toLocaleString();
    doc.fontSize(10).font('Helvetica-Oblique').text(`Generated: ${timestamp}`, { align: 'center' });
    doc.moveDown(2);

    // Add content with role-based formatting
    content.forEach((item, index) => {
      const role = item.role || 'system';
      const text = item.content || item.text || '';
      
      // Add role label with appropriate styling
      if (role === 'user') {
        doc.fontSize(12).font('Helvetica-Bold').text('You:', { continued: false });
      } else if (role === 'assistant') {
        doc.fontSize(12).font('Helvetica-Bold').text('Assistant:', { continued: false });
      } else {
        doc.fontSize(12).font('Helvetica-Bold').text('System:', { continued: false });
      }
      
      // Add the actual message content
      doc.fontSize(11).font('Helvetica').text(text, { align: 'left' });
      
      // Add some space between messages
      doc.moveDown(1);
      
      // Add a separator line except for the last item
      if (index < content.length - 1) {
        doc.moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .stroke('#CCCCCC')
           .moveDown(1);
      }
    });

    // Add page numbers
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .text(`Page ${i + 1} of ${totalPages}`, 
               50, 
               doc.page.height - 50, 
               { align: 'center' });
    }

    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
