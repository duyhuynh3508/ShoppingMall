import { createHash } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  // Create SHA-256 hash
  const hash = createHash('sha256');

  // Update the hash object with the password
  hash.update(password);
  return hash.digest('hex');
}
