import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://wxhp74gn.us-east.insforge.app';
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'ik_0aeb9d697eb1d57c6b7c69391a4ffd72';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
