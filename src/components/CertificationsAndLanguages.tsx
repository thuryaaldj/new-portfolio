'use client';

import { useEffect, useRef, useState, type SVGProps } from 'react';

const certifications = [
  {
    title: 'Generative AI: Prompt Engineering Basics',
    issuer: 'IBM',
    date: 'Apr 2026',
    credentialUrl: 'https://drive.google.com/file/d/1RaAjimbBWUlX0BDg1PsTAdLKL-lz7S0v/view?usp=sharing',
    accent: '#7C3AED',
  },
  {
    title: 'React Basics',
    issuer: 'Meta',
    date: 'Nov 2024',
    credentialUrl: 'https://drive.google.com/file/d/1rYhnlLxWg9OvL5VE6Q9xZSR5t4GeJZrI/view?usp=sharing',
    accent: '#25BDF2',
  },
] as const;

const languages = [
  {
    name: 'Arabic',
    level: 'Native',
    proficiency: 100,
    accent: '#008C78',
  },
  {
    name: 'English',
    level: 'Intermediate (B2 – CEFR) ',
    proficiency: 70,
    accent: '#25BDF2',
  },
] as const;

export default function CertificationsAndLanguages() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="credentials"
      className="w-full max-w-7xl px-8 py-24 md:px-20"
      aria-labelledby="credentials-heading"
    >
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/50">
          Credentials
        </p>
        <h2 id="credentials-heading" className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Certifications & Languages
        </h2>
        <p className="mt-4 text-lg text-foreground/65">
          Formal learning milestones and the languages I communicate in.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span
              className="grid size-10 place-items-center rounded-full text-white"
              style={{ backgroundColor: '#7C3AED' }}
              aria-hidden="true"
            >
              <AwardIcon className="size-5" />
            </span>
            <h3 className="text-xl font-bold tracking-tight">Certifications</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {certifications.map((certification) => (
              <article
                key={certification.title}
                className="group relative overflow-hidden rounded-[1.5rem] border border-foreground/10 bg-background/85 p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-foreground/25"
                style={{
                  boxShadow: `0 18px 36px ${certification.accent}22`,
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: certification.accent }}
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between gap-4">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-2xl text-white shadow-lg transition duration-300 group-hover:scale-105"
                    style={{ backgroundColor: certification.accent }}
                    aria-hidden="true"
                  >
                    <CertificateIcon className="size-5" />
                  </span>
                  <span className="rounded-full border border-foreground/15 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/55">
                    {certification.date}
                  </span>
                </div>

                <h4 className="mt-5 text-lg font-bold leading-snug tracking-tight text-foreground">
                  {certification.title}
                </h4>
                <p
                  className="mt-2 text-sm font-semibold uppercase tracking-[0.16em]"
                  style={{ color: certification.accent }}
                >
                  {certification.issuer}
                </p>

                <a
                  href={certification.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 transition hover:text-teal-600 [[data-theme=dark]_&]:hover:text-teal-400"
                >
                  View credential
                  <ArrowIcon className="size-4 transition group-hover:translate-x-0.5" />
                </a>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-6 flex items-center gap-3">
            <span
              className="grid size-10 place-items-center rounded-full text-white"
              style={{ backgroundColor: '#008C78' }}
              aria-hidden="true"
            >
              <GlobeIcon className="size-5" />
            </span>
            <h3 className="text-xl font-bold tracking-tight">Languages</h3>
          </div>

          <div className="rounded-[1.75rem] border border-foreground/10 bg-background/85 p-6 backdrop-blur sm:p-8">
            <div className="grid gap-7">
              {languages.map((language, index) => (
                <div key={language.name}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid size-10 place-items-center rounded-full border border-foreground/10 text-sm font-black text-foreground/80"
                        aria-hidden="true"
                      >
                        {language.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-lg font-bold tracking-tight">{language.name}</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
                          {language.level}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: language.accent }}
                    >
                      {language.proficiency}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                      style={{
                        width: isVisible ? `${language.proficiency}%` : '0%',
                        backgroundColor: language.accent,
                        transitionDelay: `${index * 180}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* <div className="mt-8 grid grid-cols-2 gap-3">
              {languages.map((language) => (
                <div
                  key={`${language.name}-chip`}
                  className="rounded-2xl border border-foreground/10 px-4 py-3 text-center transition duration-300 hover:border-foreground/25"
                >
                  <p className="text-sm font-bold">{language.name}</p>
                  <p
                    className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: language.accent }}
                  >
                    {language.level}
                  </p>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}

function AwardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l1 14H7L8 4Zm4 14v3m-5 3h10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4 10 2h4l1 2" />
    </svg>
  );
}

function CertificateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10v12H7V4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v4l-2-1-2 1v-4" />
    </svg>
  );
}

function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.8 4 6.2 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6.2-4 9s1.5 6.2 4 9" />
    </svg>
  );
}

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0-5-5m5 5-5 5" />
    </svg>
  );
}
