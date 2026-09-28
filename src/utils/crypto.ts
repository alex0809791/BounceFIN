/**
 * Security and authentication cryptography utilities using Web Crypto API and WebAuthn (Passkeys / Biometrics).
 */

export function generateSalt(): string {
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes SHA-256 hash with salt for secure local storage password verification.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '::finup_secure_salt::' + salt);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('Ambiente de criptografia seguro (Web Crypto API) indisponível.');
}

/**
 * Checks if the current browser environment supports WebAuthn / Biometrics / Passkeys.
 */
export async function isWebAuthnSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;

  try {
    if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Register a biometric/platform credential (Passkey / TouchID / FaceID) for the user.
 */
export async function registerBiometricPasskey(
  userId: string,
  userEmail: string,
  userName: string
): Promise<{ credentialId: string; success: boolean }> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    throw new Error('Autenticação biométrica não suportada neste navegador.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const encoder = new TextEncoder();
  const userIdBuffer = encoder.encode(userId);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'BounceFIN - Gestão financeira local e privada',
      id: window.location.hostname || 'localhost',
    },
    user: {
      id: userIdBuffer,
      name: userEmail,
      displayName: userName || userEmail,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // FaceID, TouchID, Windows Hello, etc.
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
    timeout: 60000,
    attestation: 'none',
  };

  try {
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error('Registro biométrico cancelado ou indisponível.');
    }

    const credentialId = btoa(
      String.fromCharCode(...new Uint8Array(credential.rawId))
    );

    return { credentialId, success: true };
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Acesso biométrico cancelado pelo usuário.');
    }
    throw new Error(err.message || 'Falha ao registrar autenticação biométrica.');
  }
}

/**
 * Authenticates using registered biometric/passkey.
 */
export async function authenticateWithBiometrics(
  credentialId?: string
): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    throw new Error('Autenticação biométrica não suportada neste navegador.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const allowCredentials: PublicKeyCredentialDescriptor[] = [];
  if (credentialId) {
    try {
      const rawId = Uint8Array.from(atob(credentialId), c => c.charCodeAt(0));
      allowCredentials.push({
        id: rawId,
        type: 'public-key',
        transports: ['internal'],
      });
    } catch {
      // Ignore if decoding fails, will prompt available platform credentials
    }
  }

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    timeout: 60000,
    userVerification: 'required',
    rpId: window.location.hostname || 'localhost',
    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
  };

  try {
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });
    return !!assertion;
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Verificação biométrica cancelada pelo usuário.');
    }
    throw new Error(err.message || 'Falha na verificação biométrica.');
  }
}
