
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getDownloadByToken, incrementDownloadCount } from '@/lib/downloads';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const download = await getDownloadByToken(params.token);
    
    if (!download) {
      return NextResponse.json(
        { error: 'Download not found or expired' },
        { status: 404 }
      );
    }

    if (download.downloadCount >= download.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit exceeded' },
        { status: 403 }
      );
    }

    // Increment download count
    await incrementDownloadCount(download.id);

    // Generate sample PDF content (in a real app, you'd have actual PDF files)
    const pdfContent = generateSamplePDF(download.product);
    
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${download.product.examName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    );
  }
}

function generateSamplePDF(product: any): Buffer {
  // This is a simple text-based PDF simulation
  // In a real application, you would use a proper PDF library like PDFKit
  const content = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
50 750 Td
(${product.examName}) Tj
0 -50 Td
/F1 12 Tf
(Exam Code: ${product.examCode || 'N/A'}) Tj
0 -30 Td
(Practice Questions and Study Material) Tj
0 -30 Td
(This is a sample PDF for demonstration purposes.) Tj
0 -30 Td
(In a real application, this would contain) Tj
0 -20 Td
(comprehensive exam questions and explanations.) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000251 00000 n 
0000000504 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
581
%%EOF
`;

  return Buffer.from(content, 'utf8');
}
