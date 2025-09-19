/**
 * Utility functions for handling invite codes
 */

/**
 * Encodes an invite code to base64 for URL safety
 * @param code - The original invite code
 * @returns Base64 encoded invite code
 */
export function encodeInviteCode(code: string): string {
  return btoa(code);
}

/**
 * Decodes a base64 encoded invite code
 * @param encodedCode - The base64 encoded invite code
 * @returns The original invite code or null if invalid
 */
export function decodeInviteCode(encodedCode: string): string | null {
  try {
    return atob(encodedCode);
  } catch {
    return null;
  }
}

/**
 * Generates a full invite URL with encoded code
 * @param baseUrl - The base URL of the application
 * @param inviteCode - The original invite code
 * @returns Full invite URL with encoded code
 */
export function generateInviteUrl(baseUrl: string, inviteCode: string): string {
  const encodedCode = encodeInviteCode(inviteCode);
  return `${baseUrl}/register/invite/${encodedCode}`;
}