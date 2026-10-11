declare module 'pako' {
  export function inflate(data: Uint8Array | number[]): Uint8Array;
  export function deflate(data: Uint8Array | string): Uint8Array;
}
