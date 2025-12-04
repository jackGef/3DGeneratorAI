import crypto from 'crypto';

export function generateSecureCode(): string {
    const buffer = crypto.randomInt(0, 1000000);
    return buffer.toString().padStart(6, '0');
}