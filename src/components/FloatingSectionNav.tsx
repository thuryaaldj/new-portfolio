'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SVGProps,
} from 'react';
import ThemeSwitch from '@/src/components/ThemeSwitch';

type NavItem = {
  id: string;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

type SectionNavContextValue = {
  activeSection: string;
  isContactOpen: boolean;
  openContact: () => void;
  closeContact: () => void;
  scrollToSection: (sectionId: string) => void;
};

const sectionIds = ['home', 'experience', 'projects', 'skills'] as const;

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'experience', label: 'Experience', icon: BriefcaseIcon },
  { id: 'projects', label: 'Projects', icon: LayersIcon },
  { id: 'skills', label: 'Skills', icon: CodeBracketIcon },
];

const contactDetails = {
  email: 'your.email@example.com',
  phoneDisplay: '+963 000 000 000',
  phoneHref: '+963000000000',
  linkedin: 'https://www.linkedin.com/in/your-profile',
  linkedinLabel: 'linkedin.com/in/your-profile',
  github: 'https://github.com/your-username',
  githubLabel: 'github.com/your-username',
} as const;

const SectionNavContext = createContext<SectionNavContextValue | null>(null);

function useSectionNav() {
  const context = useContext(SectionNavContext);

  if (!context) {
    throw new Error('Section nav components must be used within SectionNavProvider');
  }

  return context;
}

export function SectionNavProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.1, 0.25, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isContactOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsContactOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isContactOpen]);

  const scrollToSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const value: SectionNavContextValue = {
    activeSection,
    isContactOpen,
    openContact: () => setIsContactOpen(true),
    closeContact: () => setIsContactOpen(false),
    scrollToSection,
  };

  return (
    <SectionNavContext.Provider value={value}>
      {children}
      <ContactModal />
    </SectionNavContext.Provider>
  );
}

export function DesktopSectionNav() {
  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-6 top-6 z-20 hidden flex-col items-center gap-3 md:flex"
    >
      <SectionNavCircles layout="vertical" />
    </nav>
  );
}

export function MobileSectionNav() {
  return (
    <nav
      aria-label="Section navigation"
      className="mb-6 flex w-full justify-center md:hidden"
    >
      <SectionNavCircles layout="horizontal" />
    </nav>
  );
}

export default function FloatingSectionNav() {
  return <DesktopSectionNav />;
}

function SectionNavCircles({ layout }: { layout: 'horizontal' | 'vertical' }) {
  const { activeSection, openContact, scrollToSection } = useSectionNav();
  const isHorizontal = layout === 'horizontal';
  const buttonSize = isHorizontal ? 'size-10 sm:size-11' : 'size-11';
  const iconSize = isHorizontal ? 'size-4 sm:size-5' : 'size-5';

  return (
    <div
      className={
        isHorizontal
          ? 'flex max-w-full flex-wrap items-center justify-center gap-2 sm:gap-3'
          : 'flex flex-col items-center gap-3'
      }
    >
      <ThemeSwitch compact={isHorizontal} />

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;

        return (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to ${item.label}`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => scrollToSection(item.id)}
            className={`grid ${buttonSize} place-items-center rounded-full border bg-background/80 text-foreground shadow-sm backdrop-blur transition-all duration-300 hover:scale-105 ${
              isActive
                ? 'scale-105 border-teal-500/70 shadow-[0_0_18px_rgba(20,184,166,0.25)]'
                : 'border-foreground/20 hover:border-foreground/40'
            }`}
          >
            <Icon className={iconSize} />
          </button>
        );
      })}

      <button
        type="button"
        aria-label="Open contact"
        onClick={openContact}
        className={`grid ${buttonSize} place-items-center rounded-full border border-foreground/20 bg-background/80 text-foreground shadow-sm backdrop-blur transition-all duration-300 hover:scale-105 hover:border-foreground/40`}
      >
        <MailIcon className={iconSize} />
      </button>
    </div>
  );
}

function ContactModal() {
  const { isContactOpen, closeContact } = useSectionNav();

  if (!isContactOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close contact popup"
        className="absolute inset-0 bg-background/45 backdrop-blur-md transition-opacity duration-300"
        onClick={closeContact}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-heading"
        className="absolute left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-foreground/15 bg-background/95 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/50">
              Contact
            </p>
            <h2 id="contact-heading" className="mt-3 text-3xl font-bold tracking-tight">
              Let&apos;s connect
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close contact dialog"
            onClick={closeContact}
            className="grid size-9 place-items-center rounded-full border border-foreground/15 text-foreground/70 transition hover:border-foreground/35 hover:text-foreground"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>

        <p className="mt-5 text-base leading-7 text-foreground/70">
          Open to frontend roles, collaborations, and interesting product work.
          Reach out and I&apos;ll get back to you.
        </p>

        <div className="mt-7 grid gap-3">
          <a
            href={`mailto:${contactDetails.email}`}
            className="flex items-center gap-3 rounded-xl border border-foreground/15 px-4 py-3 text-sm font-semibold transition hover:border-teal-500/50 hover:text-teal-600 [[data-theme=dark]_&]:hover:text-teal-400"
          >
            <MailIcon className="size-4 shrink-0" />
            {contactDetails.email}
          </a>
          <a
            href={`tel:${contactDetails.phoneHref}`}
            className="flex items-center gap-3 rounded-xl border border-foreground/15 px-4 py-3 text-sm font-semibold transition hover:border-teal-500/50 hover:text-teal-600 [[data-theme=dark]_&]:hover:text-teal-400"
          >
            <PhoneIcon className="size-4 shrink-0" />
            {contactDetails.phoneDisplay}
          </a>
          <a
            href={contactDetails.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-foreground/15 px-4 py-3 text-sm font-semibold transition hover:border-teal-500/50 hover:text-teal-600 [[data-theme=dark]_&]:hover:text-teal-400"
          >
            <LinkedInIcon className="size-4 shrink-0" />
            {contactDetails.linkedinLabel}
          </a>
          <a
            href={contactDetails.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-foreground/15 px-4 py-3 text-sm font-semibold transition hover:border-teal-500/50 hover:text-teal-600 [[data-theme=dark]_&]:hover:text-teal-400"
          >
            <GitHubIcon className="size-4 shrink-0" />
            {contactDetails.githubLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function BriefcaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1m-9 0h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8" />
    </svg>
  );
}

function LayersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8 4.5L12 12 4 7.5 12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5" />
    </svg>
  );
}

function CodeBracketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 9-3 3 3 3m8-6 3 3-3 3M14 5l-4 14" />
    </svg>
  );
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16v10H4V7Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 4h3l1.5 4-2 1.2a11 11 0 0 0 5.8 5.8L17 13l4 1.5v3A2 2 0 0 1 19 19.4 15.4 15.4 0 0 1 4.6 5 2 2 0 0 1 6.5 4Z"
      />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.5 8.5A1.5 1.5 0 1 1 6.5 5.5 1.5 1.5 0 0 1 6.5 8.5ZM5 20V9h3v11H5Zm5 0V9h2.9v1.5h.1c.4-.8 1.4-1.7 2.9-1.7 3.1 0 3.7 2 3.7 4.7V20h-3v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.6V20H10Z" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.25c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.37 9.37 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.13 10.13 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}
