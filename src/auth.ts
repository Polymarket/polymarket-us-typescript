import * as ed25519 from '@noble/ed25519';

export interface AuthHeaders {
  'X-PM-Access-Key': string;
  'X-PM-Timestamp': string;
  'X-PM-Signature': string;
}

export async function createAuthHeaders(
  keyId: string,
  secretKey: string,
  method: string,
  path: string,
): Promise<AuthHeaders> {
  const timestamp = Date.now().toString();
  const message = `${timestamp}${method}${path}`;

  const secretKeyBytes = base64ToBytes(secretKey);
  // Ed25519 expects 32-byte private key seed; if 64-byte key provided, use first 32 bytes
  const privateKey =
    secretKeyBytes.length === 64 ? secretKeyBytes.slice(0, 32) : secretKeyBytes;
  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = await ed25519.signAsync(messageBytes, privateKey);
  const signature = bytesToBase64(signatureBytes);

  return {
    'X-PM-Access-Key': keyId,
    'X-PM-Timestamp': timestamp,
    'X-PM-Signature': signature,
  };
}

function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  const binaryString = Array.from(bytes, (byte) =>
    String.fromCharCode(byte),
  ).join('');
  return btoa(binaryString);
}
