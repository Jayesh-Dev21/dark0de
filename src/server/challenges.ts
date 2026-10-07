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
    flagHash: 'b2f0a393e62b10e8e25e5a85910b9ea989f7850bc86ab9f1f9cc8c2dbe804844', // dark0de{sql_1nj3ct10n_byp4ss_succ3ss}
    acceptedHashes: [
      'b2f0a393e62b10e8e25e5a85910b9ea989f7850bc86ab9f1f9cc8c2dbe804844',
      'b4bfa255b746fce475306ec040f7f32997184d0dfec472e3895e6912386bbab4',
    ],
  },
  {
    id: 'chal_02_binary',
    title: 'Cryptography',
    description:
      'Stack frame boundary analysis reveals an unprotected return instruction pointer. Hijack execution flow to reach target flag function.',
    category: 'Binary & Cryptanalysis',
    points: 250,
    flagHash: '5b28aff65eb52172f1e3a8c69f9d2cf1ad331756054b67773c8f84e0b9ec6aa0', // dark0de{st4ck_0v3rfl0w_sh3llc0d3_3xpl01t}
    acceptedHashes: [
      '5b28aff65eb52172f1e3a8c69f9d2cf1ad331756054b67773c8f84e0b9ec6aa0',
      '7a77e8a93aaae5f1ae3863483b3e64f77cba72f0c7ea519965ba48da2fe0b889',
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
    flagHash: '8814cd4611f0c47e4fdfbebf03112bce436cd85ed0ccef332e7eb2a16264e6c9', // dark0de{p4ck3t_sn1ff3r_pwn3d_404}
    acceptedHashes: [
      '8814cd4611f0c47e4fdfbebf03112bce436cd85ed0ccef332e7eb2a16264e6c9',
      'c6d2c80c05fe98c430e1236f0aa679c1bb251f28b2be726487e4ee0ba00a94b4',
    ],
  },
];
