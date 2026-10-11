import { inflate } from 'pako';


/**
 * Lightweight in-browser PDF text extractor.
 * Parses PDF streams (including FlateDecode / zlib streams) to extract text objects.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const latin1 = new TextDecoder('latin1').decode(bytes);

    let extractedChunks: string[] = [];

    // Find binary stream boundaries
    const streamMarker = 'stream';
    const endstreamMarker = 'endstream';
    let searchIndex = 0;

    while (true) {
      const streamStartIdx = latin1.indexOf(streamMarker, searchIndex);
      if (streamStartIdx === -1) break;

      // Actual stream data starts after 'stream\r\n' or 'stream\n'
      let dataStart = streamStartIdx + streamMarker.length;
      if (latin1[dataStart] === '\r' && latin1[dataStart + 1] === '\n') {
        dataStart += 2;
      } else if (latin1[dataStart] === '\n' || latin1[dataStart] === '\r') {
        dataStart += 1;
      }

      const streamEndIdx = latin1.indexOf(endstreamMarker, dataStart);
      if (streamEndIdx === -1) break;

      searchIndex = streamEndIdx + endstreamMarker.length;

      // Extract raw stream slice
      const streamSlice = bytes.subarray(dataStart, streamEndIdx);
      if (streamSlice.length === 0) continue;

      let decodedText = '';

      // Attempt zlib/deflate decompression
      try {
        const inflated = inflate(streamSlice);
        decodedText = new TextDecoder('latin1').decode(inflated);
      } catch {
        // May be plain uncompressed stream
        decodedText = new TextDecoder('latin1').decode(streamSlice);
      }

      if (!decodedText) continue;

      // Extract text from standard PDF operators:
      // (Text) Tj  or  [(Text1) ... (Text2)] TJ
      const tjRegex = /\(([^)]*)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(decodedText)) !== null) {
        if (tjMatch[1]) {
          extractedChunks.push(cleanPdfToken(tjMatch[1]));
        }
      }

      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      let arrayMatch;
      while ((arrayMatch = tjArrayRegex.exec(decodedText)) !== null) {
        const innerRegex = /\(([^)]*)\)/g;
        let innerMatch;
        let combined = '';
        while ((innerMatch = innerRegex.exec(arrayMatch[1])) !== null) {
          combined += innerMatch[1];
        }
        if (combined) {
          extractedChunks.push(cleanPdfToken(combined));
        }
      }
    }

    if (extractedChunks.length === 0) {
      // Fallback: search for plaintext strings enclosed in parentheses
      const fallbackRegex = /\(([A-Za-z0-9\s.,;:_/@+\-—–#*&|()]{3,120})\)/g;
      let fMatch;
      while ((fMatch = fallbackRegex.exec(latin1)) !== null) {
        extractedChunks.push(cleanPdfToken(fMatch[1]));
      }
    }

    const joined = extractedChunks
      .join('\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return joined;
  } catch (err) {
    console.warn('PDF client-side text extraction warning:', err);
    return '';
  }
}

function cleanPdfToken(token: string): string {
  return token
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\r/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
