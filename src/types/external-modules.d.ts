// Types minimalistes pour débloquer le build

declare module "pdf-parse" {
  export default function pdfParse(
    data:
      | Buffer
      | Uint8Array
      | ArrayBuffer
      | { data: Buffer | Uint8Array | ArrayBuffer }
  ): Promise<{ text: string }>;
}

declare module "mammoth" {
  export function extractRawText(input: {
    buffer: Buffer | Uint8Array | ArrayBuffer;
  }): Promise<{ value: string }>;
}
