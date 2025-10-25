import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import type { Section } from '@shared/schema';

export interface ExportOptions {
  format: 'pdf' | 'docx';
  title: string;
  sections: Section[];
  orientation: 'portrait' | 'landscape';
  includeHeader: boolean;
  fileName: string;
}

export async function exportToPDF(options: ExportOptions): Promise<void> {
  const { title, sections, orientation, includeHeader, fileName } = options;
  
  const pdf = new jsPDF({
    orientation: orientation === 'landscape' ? 'l' : 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = orientation === 'landscape' ? 297 : 210;
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  let yPosition = marginTop;

  // Add title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Add horizontal line under title
  pdf.setLineWidth(0.5);
  pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 10;

  // Filter visible sections and sort by order
  const visibleSections = sections.filter(s => !s.isHidden).sort((a, b) => a.order - b.order);

  visibleSections.forEach((section, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = marginTop;
    }

    // Section title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(section.title, marginLeft, yPosition);
    yPosition += 8;

    // Section content
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    if (section.sectionType === 'student_details') {
      try {
        const details = JSON.parse(section.content || '{}');
        const fields = [
          { label: 'Name', value: details.name },
          { label: 'Roll No', value: details.rollNo },
          { label: 'Class', value: details.class },
          { label: 'Date', value: details.date },
          { label: 'Subject', value: details.subject },
          { label: 'Batch', value: details.batch },
        ];

        fields.forEach(field => {
          if (field.value) {
            pdf.text(`${field.label}: ${field.value}`, marginLeft + 5, yPosition);
            yPosition += 6;
          }
        });
      } catch {
        // Invalid JSON, skip
      }
    } else {
      // Regular text content
      const lines = pdf.splitTextToSize(
        section.content || '',
        pageWidth - marginLeft - marginRight
      );

      lines.forEach((line: string) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = marginTop;
        }
        pdf.text(line, marginLeft + 5, yPosition);
        yPosition += 5;
      });
    }

    yPosition += 8;
  });

  pdf.save(`${fileName}.pdf`);
}

export async function exportToDOCX(options: ExportOptions): Promise<void> {
  const { title, sections, fileName } = options;

  const visibleSections = sections.filter(s => !s.isHidden).sort((a, b) => a.order - b.order);

  const children: Paragraph[] = [];

  // Add title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Add sections
  visibleSections.forEach(section => {
    // Section title
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    // Section content
    if (section.sectionType === 'student_details') {
      try {
        const details = JSON.parse(section.content || '{}');
        const fields = [
          { label: 'Name', value: details.name },
          { label: 'Roll No', value: details.rollNo },
          { label: 'Class', value: details.class },
          { label: 'Date', value: details.date },
          { label: 'Subject', value: details.subject },
          { label: 'Batch', value: details.batch },
        ];

        fields.forEach(field => {
          if (field.value) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${field.label}: `, bold: true }),
                  new TextRun({ text: field.value }),
                ],
                spacing: { after: 100 },
              })
            );
          }
        });
      } catch {
        // Invalid JSON, skip
      }
    } else {
      const contentLines = (section.content || '').split('\n');
      contentLines.forEach(line => {
        children.push(
          new Paragraph({
            text: line,
            spacing: { after: 100 },
          })
        );
      });
    }

    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 200 },
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
