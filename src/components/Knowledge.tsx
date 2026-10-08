import React from 'react';
import { Lock, FileImage, Search, Globe, ArrowLeft } from 'lucide-react';

interface Topic {
  id: string;
  icon: React.ReactNode;
  title: string;
  short: string;
  what: string;
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
  exampleTitle: string;
  example: string[];
  fact: string;
}

const TOPICS: Topic[] = [
  {
    id: 'crypto',
    icon: <Lock className="w-5 h-5" />,
    title: 'CRYPTOGRAPHY',
    short: 'Secret codes',
    what:
      'Cryptography means scrambling a message so only someone who knows the trick (the key) can read it. In a CTF you get a scrambled text and have to find the original.',
    exampleTitle: 'Example: the Caesar cipher',
    example: [
      'Shift every letter 3 steps forward in the alphabet.',
      'HELLO  ->  KHOOR   (H->K, E->H, L->O, L->O, O->R)',
      'To read it, shift every letter 3 steps back.',
      '',
      'Encoding is not secret: Base64 turns "hi" into "aGk=".',
      'Anyone can reverse it. Text ending in "=" is often Base64.',
    ],
    fact:
      'Germany trusted the Enigma machine as unbreakable in World War II. Alan Turing and the Bletchley Park team broke it, and historians estimate this shortened the war by about two years.',
  },
  {
    id: 'stego',
    icon: <FileImage className="w-5 h-5" />,
    title: 'STEGANOGRAPHY',
    short: 'Hiding in plain sight',
    what:
      'Cryptography hides what a message says. Steganography hides that a message exists at all. A secret can sit inside a normal-looking picture, sound or file.',
    exampleTitle: 'Example: a message inside a picture',
    example: [
      'Every pixel has a color number, such as 200.',
      'Changing 200 to 201 is invisible to the eye.',
      'So someone can store secret bits in those tiny changes.',
      'The photo looks normal, but a tool can pull the text out.',
      '',
      'Another trick: text added after the end of the file.',
    ],
    fact:
      'In 1966, a captured US pilot, Jeremiah Denton, was forced to appear in a TV interview. While speaking, he blinked in Morse code to spell "TORTURE", a hidden message that US intelligence noticed and understood.Stego saved his life.',
  },
  {
    id: 'osint',
    icon: <Search className="w-5 h-5" />,
    title: 'OSINT',
    short: 'Detective work with public info',
    what:
      'Open Source Intelligence means finding facts using only information that is already public: websites, photos, maps and social posts. No hacking is involved, just careful searching.',
    image: {
      src: '/osint_photo.jpg',
      alt: 'OSINT geolocation challenge photo',
    },
    exampleTitle: 'Example: where was this photo taken?',
    example: [
      'The photo shows a shop sign, a bridge and a mountain.',
      '1. Search the shop name to find the city.',
      '2. Open Google Maps and Street View near that city.',
      '3. Match the bridge and mountain to confirm the spot.',
      '',
      'A username used on Instagram may be reused on GitHub.',
    ],
    fact:
      'In 2018 the Strava fitness app published a map of where users exercised. Soldiers had tracked their runs, so it accidentally revealed secret US and Russian military bases in Syria and Afghanistan.',
  },
  {
    id: 'web',
    icon: <Globe className="w-5 h-5" />,
    title: 'WEB EXPLOITS',
    short: 'When websites trust you too much',
    what:
      'A website takes input from you: forms, links, cookies. A web exploit happens when the site trusts that input too much and does something it should not.',
    exampleTitle: 'Common types, in simple words',
    example: [
      'SQL injection: your text gets mixed into a database command',
      '  and changes what the command does.',
      'XSS: the site shows your text as live code in the page.',
      'IDOR: change /profile?id=5 to id=6 and see someone else\'s data.',
      'Hidden files: pages the site never links, such as /robots.txt.',
    ],
    fact:
      'In 2010, researchers found that an AT&T website showed an iPad owner\'s email address when given that iPad\'s ID number in the link. They tried numbers one after another with a simple script and collected over 100,000 email addresses, with no password needed.',
  },
];

export const KnowPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="space-y-6 font-mono">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[#FF4D4D] hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK</span>
      </button>

<div className="border border-[#FFA800] bg-[#FFA800]/10 p-4 text-sm text-[#FFA800] leading-relaxed">        <span className="font-bold">DISCLAIMER: </span>
        This is just for knowledge purposes. This page doesn't have any connection to the flags or hints.
      </div>

      <div className="border border-[#FF4D4D]/40 bg-[#140708] p-5 chamfer-card glow-red">
        <h1 className="text-3xl font-heading font-black tracking-wider text-[#FF4D4D] text-glow-red mt-1">
          KNOW THE BASICS
        </h1>
        <p className="text-sm text-[#D6D6D6] mt-2 leading-relaxed">
          New to CTFs? Here is a simple guide to the kinds of challenges you may
          meet. Each one comes with a simple example.For more info visit <a href="https://discord.gg/eehjvuAy2" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#00E5FF]">#Resources</a> in the discord.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Topics">
        {TOPICS.map((t) => (
          <a
            key={t.id}
            href={`#know-${t.id}`}
            className="px-3 py-1.5 border border-[#FF4D4D]/40 text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-black text-sm tracking-wider transition-colors chamfer-btn"
          >
            {t.title}
          </a>
        ))}
      </nav>

      {TOPICS.map((t) => (
        <section
          key={t.id}
          id={`know-${t.id}`}
          className="border border-[#FF4D4D]/30 bg-[#140708]/90 p-5 chamfer-card space-y-4 scroll-mt-4"
        >
          <div className="flex items-center gap-3 text-[#FF4D4D]">
            {t.icon}
            <div>
              <h2 className="text-xl font-heading font-black tracking-wider">{t.title}</h2>
              <div className="text-sm text-[#8E8A8B]">{t.short}</div>
            </div>
          </div>

          <p className="text-sm text-[#D6D6D6] leading-relaxed">{t.what}</p>

          {t.image && (
            <div className="border border-[#FF4D4D]/40 bg-[#0A0506] p-2 chamfer-card max-w-[80%] mx-auto">
              <div className="relative overflow-hidden w-full bg-black/80 flex items-center justify-center">
                <img
                  src={t.image.src}
                  alt={t.image.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[304px] object-cover sm:object-contain rounded-none border border-[#FF4D4D]/20 shadow-[0_0_15px_rgba(255,77,77,0.15)]"
                />
              </div>
            </div>
          )}

          <div>
            <div className="text-sm text-[#FF4D4D] font-bold mb-1.5">{t.exampleTitle}</div>
            <pre className="p-3 bg-[#0A0506] border border-[#D6D6D6]/40 text-sm text-[#D6D6D6] leading-relaxed whitespace-pre-wrap break-words">
              {t.example.join('\n')}
            </pre>
          </div>

          <div className="border-l-2 border-[#00E5FF] pl-3 text-sm text-[#D6D6D6] leading-relaxed">
            <span className="text-[#00E5FF] font-bold">WHY IT MATTERS: </span>
            {t.fact}
          </div>
        </section>
      ))}

    </div>
  );
};
