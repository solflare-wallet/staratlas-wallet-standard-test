import nacl from 'tweetnacl';

export function formatKey(
  key: string,
  startSize: number = 3,
  endSize: number = startSize,
): string {
  return `${key.slice(0, startSize)}...${key.slice(-endSize)}`;
}

export function byteArrayEq(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function verifySignature(
  signedMessage: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array,
  readable: string,
  requestedMessage?: Uint8Array,
  signatureType?: string,
): Error | null {
  // Undefined === ed25519
  if (signatureType !== undefined && signatureType !== 'ed25519') {
    throw new Error(
      `Unsupported signature type for ${readable}: ${signatureType}`,
    );
  }
  if (
    requestedMessage !== undefined &&
    !byteArrayEq(signedMessage, requestedMessage)
  ) {
    throw new Error(
      `Mismatched signed message for ${readable}: ${signedMessage} !== ${requestedMessage}`,
    );
  }

  const verified = nacl.sign.detached.verify(
    signedMessage,
    signature,
    publicKey,
  );
  if (!verified) {
    throw new Error(`Signature verification for ${readable} failed`);
  }
  return null;
}

export function stringifyError(e: unknown): unknown {
  return e !== null && typeof e === 'object' && 'message' in e ? e.message : e;
}
