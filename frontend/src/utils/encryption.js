/**
 * End-to-End Encryption Utility
 * 
 * Uses hybrid encryption:
 * 1. RSA (2048-bit) for key exchange
 * 2. AES-GCM (256-bit) for message encryption
 * 
 * Flow:
 * - Each user generates RSA key pair on signup
 * - Public keys are shared, private keys stay local
 * - Messages encrypted with AES, AES key encrypted with recipient's RSA public key
 * - Only recipient can decrypt with their private key
 */

// Generate RSA key pair for user
export async function generateKeyPair() {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true, // extractable
      ['encrypt', 'decrypt']
    )

    // Export keys to store them
    const publicKey = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey)
    const privateKey = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey)

    return {
      publicKey: JSON.stringify(publicKey),
      privateKey: JSON.stringify(privateKey)
    }
  } catch (error) {
    console.error('Error generating key pair:', error)
    throw error
  }
}

// Import public key from JWK format
async function importPublicKey(publicKeyJwk) {
  const keyData = JSON.parse(publicKeyJwk)
  return await window.crypto.subtle.importKey(
    'jwk',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    true,
    ['encrypt']
  )
}

// Import private key from JWK format
async function importPrivateKey(privateKeyJwk) {
  const keyData = JSON.parse(privateKeyJwk)
  return await window.crypto.subtle.importKey(
    'jwk',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    true,
    ['decrypt']
  )
}

// Generate random AES key for message encryption
async function generateAESKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  )
}

// Convert string to ArrayBuffer
function str2ab(str) {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

// Convert ArrayBuffer to string
function ab2str(buffer) {
  const decoder = new TextDecoder()
  return decoder.decode(buffer)
}

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Encrypt a message for a recipient
 * 
 * @param {string} message - Plain text message
 * @param {string} recipientPublicKeyJwk - Recipient's public key (JWK format)
 * @returns {object} Encrypted message data
 */
export async function encryptMessage(message, recipientPublicKeyJwk) {
  try {
    // Step 1: Generate random AES key for this message
    const aesKey = await generateAESKey()

    // Step 2: Generate random IV (Initialization Vector)
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    // Step 3: Encrypt message with AES-GCM
    const encodedMessage = str2ab(message)
    const encryptedMessage = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      aesKey,
      encodedMessage
    )

    // Step 4: Export AES key to raw format
    const exportedAESKey = await window.crypto.subtle.exportKey('raw', aesKey)

    // Step 5: Encrypt AES key with recipient's RSA public key
    const recipientPublicKey = await importPublicKey(recipientPublicKeyJwk)
    const encryptedAESKey = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      recipientPublicKey,
      exportedAESKey
    )

    // Step 6: Return encrypted data (all as Base64 for storage)
    return {
      encryptedContent: arrayBufferToBase64(encryptedMessage),
      encryptedKey: arrayBufferToBase64(encryptedAESKey),
      iv: arrayBufferToBase64(iv),
      encrypted: true
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw error
  }
}

/**
 * Decrypt a message
 * 
 * @param {object} encryptedData - Encrypted message data
 * @param {string} privateKeyJwk - User's private key (JWK format)
 * @returns {string} Decrypted plain text message
 */
export async function decryptMessage(encryptedData, privateKeyJwk) {
  try {
    // Step 1: Import private key
    const privateKey = await importPrivateKey(privateKeyJwk)

    // Step 2: Decrypt AES key using RSA private key
    const encryptedAESKey = base64ToArrayBuffer(encryptedData.encryptedKey)
    const decryptedAESKey = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      privateKey,
      encryptedAESKey
    )

    // Step 3: Import decrypted AES key
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      decryptedAESKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['decrypt']
    )

    // Step 4: Decrypt message with AES key
    const iv = base64ToArrayBuffer(encryptedData.iv)
    const encryptedMessage = base64ToArrayBuffer(encryptedData.encryptedContent)
    
    const decryptedMessage = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      aesKey,
      encryptedMessage
    )

    // Step 5: Convert to string and return
    return ab2str(decryptedMessage)
  } catch (error) {
    console.error('Decryption error:', error)
    return '[Unable to decrypt message]'
  }
}

/**
 * Store keys securely in localStorage
 * Note: In production, consider using IndexedDB with additional security
 */
export function storeKeys(userId, publicKey, privateKey) {
  localStorage.setItem(`publicKey_${userId}`, publicKey)
  localStorage.setItem(`privateKey_${userId}`, privateKey)
}

/**
 * Retrieve keys from storage
 */
export function getKeys(userId) {
  return {
    publicKey: localStorage.getItem(`publicKey_${userId}`),
    privateKey: localStorage.getItem(`privateKey_${userId}`)
  }
}

/**
 * Check if user has encryption keys
 */
export function hasKeys(userId) {
  const keys = getKeys(userId)
  return !!(keys.publicKey && keys.privateKey)
}

/**
 * Clear keys (on logout)
 */
export function clearKeys(userId) {
  localStorage.removeItem(`publicKey_${userId}`)
  localStorage.removeItem(`privateKey_${userId}`)
}
