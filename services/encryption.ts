
export const generateSalt = () => window.crypto.getRandomValues(new Uint8Array(16));
export const generateIV = () => window.crypto.getRandomValues(new Uint8Array(12));

export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptData = async (data: any, password: string): Promise<{ cipherText: string, salt: string, iv: string }> => {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(password, salt);
    
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(data));
    
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encodedData
    );

    // Convert to base64 for storage
    const cipherText = btoa(String.fromCharCode(...new Uint8Array(encryptedContent)));
    const saltString = btoa(String.fromCharCode(...salt));
    const ivString = btoa(String.fromCharCode(...iv));

    return { cipherText, salt: saltString, iv: ivString };
};

export const decryptData = async (cipherText: string, password: string, salt: string, iv: string): Promise<any> => {
    const saltBytes = new Uint8Array(atob(salt).split("").map(c => c.charCodeAt(0)));
    const ivBytes = new Uint8Array(atob(iv).split("").map(c => c.charCodeAt(0)));
    const cipherBytes = new Uint8Array(atob(cipherText).split("").map(c => c.charCodeAt(0)));

    const key = await deriveKey(password, saltBytes);

    const decryptedContent = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        key,
        cipherBytes
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedContent));
};
