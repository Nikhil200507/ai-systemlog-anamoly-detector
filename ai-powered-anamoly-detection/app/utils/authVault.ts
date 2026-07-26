/**
 * Local Credential Vault for Benzene UEBA Platform
 * Manages strictly authenticated local operator accounts when offline or testing.
 */

export interface VaultAccount {
  id: string;
  email: string;
  passwordHash: string; // Base64 simple hash for strict password comparison
  name: string;
  createdAt: string;
}

const VAULT_KEY = "benzene_operator_vault";

function hashPassword(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return btoa(hash.toString());
}

export function getVaultAccounts(): VaultAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveAccountToVault(email: string, password: string, name: string): VaultAccount {
  const accounts = getVaultAccounts();
  const lowerEmail = email.trim().toLowerCase();
  
  const existing = accounts.find(a => a.email.toLowerCase() === lowerEmail);
  if (existing) {
    existing.passwordHash = hashPassword(password);
    existing.name = name;
    localStorage.setItem(VAULT_KEY, JSON.stringify(accounts));
    return existing;
  }

  const newAcc: VaultAccount = {
    id: `usr-vault-${Date.now()}`,
    email: lowerEmail,
    passwordHash: hashPassword(password),
    name: name || lowerEmail.split("@")[0],
    createdAt: new Date().toISOString()
  };

  accounts.push(newAcc);
  localStorage.setItem(VAULT_KEY, JSON.stringify(accounts));
  return newAcc;
}

export function verifyVaultCredentials(email: string, password: string): { success: boolean; account?: VaultAccount; errorMsg?: string } {
  const accounts = getVaultAccounts();
  const lowerEmail = email.trim().toLowerCase();
  const target = accounts.find(a => a.email.toLowerCase() === lowerEmail);

  if (!target) {
    return { success: false, errorMsg: `No account found for ${email}. Please register first.` };
  }

  if (target.passwordHash !== hashPassword(password)) {
    return { success: false, errorMsg: "Invalid password. Access denied." };
  }

  return { success: true, account: target };
}
