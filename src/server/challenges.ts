import crypto from 'crypto';

export interface FixedChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  flagHash: string;
  acceptedHashes: string[];
}

export function hashFlag(flag: string): string {
  return crypto.createHash('sha256').update(flag.trim()).digest('hex');
}

export const FIXED_CHALLENGES: FixedChallenge[] = [
  {
    id: 'chal_01_sqli',
    title: 'LLM Prompt Injection',
    description:
      'Biometric authentication gateway exposed to prompt injection. Bypass user verification to extract root session privileges.',
    category: 'LLM & AI Security',
    points: 100,
    flagHash: '97435541901be9be4522039a6c3937552bfd6fac2064ad42d31d88569e36e37f', // dark0de{h4rb0r_n1ght_sh1ft_c4ch3_f0und}
    acceptedHashes: [
      '97435541901be9be4522039a6c3937552bfd6fac2064ad42d31d88569e36e37f',
    ],
  },
  {
    id: 'chal_02_binary',
    title: 'Cryptography',
    description:
      'Stack frame boundary analysis reveals an unprotected return instruction pointer. Hijack execution flow to reach target flag function.',
    category: 'Binary & Cryptanalysis',
    points: 250,
    flagHash: '53d4fd8a0cfdcd898669ad0a3ffecb8516fc74c1d846c13f9427410c02b0fd33', // dark0de{r3ad_th3_b00k_th4t_d03snt_3x1st}
    acceptedHashes: [
      '53d4fd8a0cfdcd898669ad0a3ffecb8516fc74c1d846c13f9427410c02b0fd33',
    ],
  },
  {
    id: 'chal_03_crypto',
    title: 'Steganography',
    description:
      'Intercepted keystream transmission utilizes a repeating XOR mask. Reconstruct the keystream and decrypt the classified payload.',
    category: 'Network & Forensics',
    points: 400,
    flagHash: '9ba8dbe1eb1d2338ee4c277bf68233eeb6b8e8f34985a430348f9949c5064587', // dark0de{SP3CTR0GR4M_M4G1C}
    acceptedHashes: [
      '9ba8dbe1eb1d2338ee4c277bf68233eeb6b8e8f34985a430348f9949c5064587',
    ],
  },
  {
    id: 'chal_04_forensics',
    title: 'OSINT',
    description:
      'Packet capture stream indicates unauthorized data exfiltration over DNS tunnels. Reassemble exfiltrated payload chunks.',
    category: 'OSINT & Intelligence',
    points: 500,
    flagHash: 'da3c36ae9e4e8a24678c11c34cd4b7cbd59a777aa833a69fb0a001dc45a15caa', // dark0de{w0wi333_100k_4t_yOu_t0uch1n9_gr4$$!}
    acceptedHashes: [
      'da3c36ae9e4e8a24678c11c34cd4b7cbd59a777aa833a69fb0a001dc45a15caa',
    ],
  },
];
