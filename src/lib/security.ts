import CryptoJS from 'crypto-js';

const SECRET_KEY = "PROMPT_COPILOT_SECURE_KEY_v1";

/**
 * Encrypts a string using AES encryption.
 * @param data The string to encrypt.
 * @returns The encrypted string (ciphertext).
 */
export const encryptData = (data: string): string => {
    if (!data) return '';
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

/**
 * Decrypts a string using AES encryption.
 * Handles cases where the data might not be encrypted (legacy support).
 * @param ciphertext The encrypted string to decrypt.
 * @returns The decrypted string (plaintext).
 */
export const decryptData = (ciphertext: string): string => {
    if (!ciphertext) return '';

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption results in an empty string but input wasn't empty, 
        // it might mean decryption failed or key mismatch, 
        // OR it was just a plain string that happened to be valid base64 but invalid ciphertext.
        // However, usually AES decrypt throws or returns malformed data if key is wrong.
        // For legacy support: if the result is empty or looks invalid, return original.

        if (!decrypted) {
            // Fallback for unencrypted data
            return ciphertext;
        }

        return decrypted;
    } catch (error) {
        // If decryption fails (e.g. malformed ciphertext), assume it's unencrypted legacy data
        return ciphertext;
    }
};
