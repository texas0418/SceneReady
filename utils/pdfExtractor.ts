import { Platform } from 'react-native';
import pako from 'pako';

function decodeBase64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function extractTextFromPDFBytes(data: Uint8Array): string {
  const textParts: string[] = [];

  const findBytes = (haystack: Uint8Array, needle: number[], from: number = 0): number => {
    for (let i = from; i <= haystack.length - needle.length; i++) {
      let found = true;
      for (let j = 0; j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
    return -1;
  };

  const streamMarker = [115, 116, 114, 101, 97, 109];
  const endstreamMarker = [101, 110, 100, 115, 116, 114, 101, 97, 109];
  const flateMarker = [70, 108, 97, 116, 101, 68, 101, 99, 111, 100, 101];

  const streamPositions: { start: number; end: number; isFlate: boolean }[] = [];

  let pos = 0;
  while (pos < data.length) {
    const streamStart = findBytes(data, streamMarker, pos);
    if (streamStart === -1) break;

    const lookBack = Math.max(0, streamStart - 200);
    const headerChunk = data.slice(lookBack, streamStart);
    const isFlate = findBytes(headerChunk, flateMarker) !== -1;

    let contentStart = streamStart + streamMarker.length;
    if (data[contentStart] === 13 && data[contentStart + 1] === 10) {
      contentStart += 2;
    } else if (data[contentStart] === 10 || data[contentStart] === 13) {
      contentStart += 1;
    }

    const streamEnd = findBytes(data, endstreamMarker, contentStart);
    if (streamEnd === -1) {
      pos = streamStart + streamMarker.length;
      continue;
    }

    let contentEnd = streamEnd;
    if (contentEnd > contentStart && (data[contentEnd - 1] === 10 || data[contentEnd - 1] === 13)) {
      contentEnd--;
    }
    if (contentEnd > contentStart && data[contentEnd - 1] === 13) {
      contentEnd--;
    }

    streamPositions.push({ start: contentStart, end: contentEnd, isFlate });
    pos = streamEnd + endstreamMarker.length;
  }

  for (const sp of streamPositions) {
    const streamData = data.slice(sp.start, sp.end);
    let decoded: string;

    try {
      if (sp.isFlate) {
        const inflated = pako.inflate(streamData);
        decoded = new TextDecoder('latin1').decode(inflated);
      } else {
        decoded = new TextDecoder('latin1').decode(streamData);
      }
    } catch (e) {
      continue;
    }

    const extracted = extractTextOperations(decoded);
    if (extracted.trim()) {
      textParts.push(extracted);
    }
  }

  const result = textParts.join('\n').trim();

  if (!result) {
    return extractRawText(data);
  }

  return cleanExtractedText(result);
}

function extractTextOperations(content: string): string {
  const lines: string[] = [];
  let currentLine = '';

  const tjRegex = /\(([^)]*)\)\s*Tj/g;
  const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
  const tdRegex = /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+Td/g;
  const tmRegex = /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+Tm/g;

  const operations: { type: string; text: string; yMove?: number; index: number }[] = [];

  let match: RegExpExecArray | null;

  while ((match = tdRegex.exec(content)) !== null) {
    const yMove = parseFloat(match[2]);
    operations.push({ type: 'td', text: '', yMove, index: match.index });
  }

  while ((match = tmRegex.exec(content)) !== null) {
    operations.push({ type: 'tm', text: '', yMove: 0, index: match.index });
  }

  while ((match = tjRegex.exec(content)) !== null) {
    const text = decodePDFString(match[1]);
    operations.push({ type: 'tj', text, index: match.index });
  }

  while ((match = tjArrayRegex.exec(content)) !== null) {
    const arrayContent = match[1];
    const parts: string[] = [];
    const partRegex = /\(([^)]*)\)/g;
    let partMatch: RegExpExecArray | null;
    while ((partMatch = partRegex.exec(arrayContent)) !== null) {
      parts.push(decodePDFString(partMatch[1]));
    }
    if (parts.length > 0) {
      operations.push({ type: 'tj', text: parts.join(''), index: match.index });
    }
  }

  operations.sort((a, b) => a.index - b.index);

  for (const op of operations) {
    if (op.type === 'td' && op.yMove !== undefined && op.yMove !== 0) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = '';
    } else if (op.type === 'tm') {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = '';
    } else if (op.type === 'tj') {
      currentLine += op.text;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join('\n');
}

function decodePDFString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\([()])/g, '$1')
    .replace(/\\(\d{3})/g, (_m, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function extractRawText(data: Uint8Array): string {
  const text = new TextDecoder('latin1').decode(data);
  const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
  const parts: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = btEtRegex.exec(text)) !== null) {
    const block = match[1];
    const extracted = extractTextOperations(block);
    if (extracted.trim()) {
      parts.push(extracted);
    }
  }

  return cleanExtractedText(parts.join('\n'));
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

export async function extractTextFromPDF(uri: string, webFile?: File | null): Promise<string> {

  try {
    if (Platform.OS === 'web' && webFile) {
      const arrayBuffer = await webFile.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      return extractTextFromPDFBytes(data);
    }

    if (Platform.OS !== 'web') {
      try {
        const FileSystemLegacy = await import('expo-file-system/legacy');
        const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
          encoding: FileSystemLegacy.EncodingType.Base64,
        });
        const data = decodeBase64ToUint8Array(base64);
        return extractTextFromPDFBytes(data);
      } catch (legacyError) {
        try {
          const { File: ExpoFile } = await import('expo-file-system');
          const file = new ExpoFile(uri);
          const arrayBuffer = await file.bytes();
          return extractTextFromPDFBytes(arrayBuffer);
        } catch (newApiError) {
          throw newApiError;
        }
      }
    }

    throw new Error('Unable to read PDF file');
  } catch (error) {
    throw new Error('Could not extract text from this PDF. Try a text-based PDF (not scanned/image-based).');
  }
}

export function isPDFFile(fileName: string, mimeType?: string): boolean {
  if (mimeType === 'application/pdf') return true;
  return fileName.toLowerCase().endsWith('.pdf');
}
