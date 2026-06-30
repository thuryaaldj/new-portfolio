'use client';

import { useEffect, useRef, useState, type SVGProps } from 'react';

const projects = [
  {
    title: 'Bus Booking App',
    description:
      'A user-friendly app for booking bus seats with seat selection and confirmation.',
    accent: '#25BDF2',
    panels: ['Seat selection', 'Booking details', 'Confirmation'],
    live: 'https://example.com',
    github: 'https://github.com/thuryaaldj/Bus-Booking-App',
  },
  {
    title: 'Award-Winning Animated Website',
    description:
      'A responsive web app for award-winning featuring a clean UI, smooth animations, and modern design.',
    accent: '#008C78',
    panels: ['Animated hero', 'Smooth motion', 'Modern UI'],
    live: 'https://animated-awwwards.vercel.app/',
    github: 'https://github.com/thuryaaldj/animated-awwwards',
  },
  {
    title: 'Personal Portfolio',
    description:
      'A responsive personal portfolio built from a Figma design using React and Tailwind.',
    accent: '#7C3AED',
    panels: ['Figma layout', 'React sections', 'Tailwind UI'],
    live: 'https://thuraya-portfolio.vercel.app/',
    github: 'https://github.com/thuryaaldj/Thuraya-s-portfolio',
  },
  {
    title: 'Admin Dashboard',
    description:
      'A responsive and user-friendly admin dashboard designed with a clean UI, interactive charts, and dynamic tables.',
    accent: '#F97316',
    panels: ['Charts', 'Dynamic tables', 'Admin tools'],
    live: 'https://example.com',
    github: 'https://github.com',
  },
  {
    title: 'Fruit & Vegetable Store',
    description:
      'A responsive and visually appealing website for a fruit and vegetable store with a smooth browsing experience.',
    accent: '#65A30D',
    panels: ['Product grid', 'Fresh categories', 'Storefront'],
    live: 'https://fru-vege-store.vercel.app/',
    github: 'https://github.com/thuryaaldj/Fru-vege-store',
  },
  {
    title: 'Hangman Word Game',
    description:
      'An educational and entertaining word game with a simple interface, well-organized logic, and many useful features.',
    accent: '#DB2777',
    panels: ['Word logic', 'Game state', 'Score flow'],
    live: 'https://example.com',
    github: 'https://github.com/thuryaaldj/Hangman',
  },
];

const activationWindows = [
  [0.08, 0.2],
  [0.23, 0.35],
  [0.39, 0.51],
  [0.55, 0.67],
  [0.7, 0.82],
  [0.86, 0.98],
] as const;

const trackPath =
  'M 500 0 C 500 135 390 215 285 340 C 150 500 170 660 285 800 C 455 1005 690 920 735 1110 C 790 1340 470 1430 300 1590 C 125 1755 145 1965 300 2140 C 460 2320 690 2255 735 2500 C 775 2715 475 2850 300 3010 C 120 3195 155 3445 300 3615 C 455 3795 685 3745 735 4020 C 760 4160 690 4250 615 4320';

export default function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const [ballPosition, setBallPosition] = useState({ x: 500, y: 0 });
  const [activeProject, setActiveProject] = useState<number | null>(null);

  useEffect(() => {
    const renderBallAtProgress = (progress: number) => {
      const path = pathRef.current;

      if (!path) {
        return;
      }

      const point = path.getPointAtLength(path.getTotalLength() * progress);

      setBallPosition({
        x: point.x,
        y: point.y,
      });

      const nextActive = activationWindows.findIndex(
        ([start, end]) => progress >= start && progress <= end,
      );

      setActiveProject(nextActive === -1 ? null : nextActive);
    };

    const animateBall = () => {
      const currentProgress = currentProgressRef.current;
      const targetProgress = targetProgressRef.current;
      const nextProgress = currentProgress + (targetProgress - currentProgress) * 0.12;

      currentProgressRef.current = Math.abs(targetProgress - nextProgress) < 0.001
        ? targetProgress
        : nextProgress;

      renderBallAtProgress(currentProgressRef.current);

      if (currentProgressRef.current !== targetProgressRef.current) {
        animationFrameRef.current = window.requestAnimationFrame(animateBall);
      } else {
        animationFrameRef.current = null;
      }
    };

    const updateProgress = () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const travelDistance = Math.max(rect.height - viewportHeight * 0.35, 1);
      const rawProgress = (viewportHeight * 0.28 - rect.top) / travelDistance;

      targetProgressRef.current = Math.min(Math.max(rawProgress, 0), 1);

      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(animateBall);
      }
    };

    currentProgressRef.current = targetProgressRef.current;
    renderBallAtProgress(currentProgressRef.current);
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate w-full max-w-7xl px-8 py-24 md:px-20">
      <svg
        className="pointer-events-none absolute inset-x-0 -top-24 z-0 hidden h-[calc(100%+6rem)] w-full md:block"
        viewBox="0 0 1000 4320"
        fill="none"
        aria-hidden="true"
      >
        <filter id="project-ball-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feDropShadow dx="0" dy="20" stdDeviation="16" floodColor="#14b8a6" floodOpacity="0.38" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#14b8a6" floodOpacity="0.28" />
        </filter>
        <path
          ref={pathRef}
          d={trackPath}
          stroke="rgba(20,184,166,0.42)"
          strokeWidth="5"
          strokeDasharray="2 18"
          strokeLinecap="round"
        />
        <circle
          cx={ballPosition.x}
          cy={ballPosition.y}
          r="15"
          fill="#14b8a6"
          stroke="var(--background)"
          strokeWidth="5"
          filter="url(#project-ball-glow)"
        />
      </svg>

      <div className="relative z-10 mx-auto mb-14 max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/50">
          Selected Work
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Featured Projects
        </h2>
        <p className="mt-4 text-lg text-foreground/65">
          Real projects arranged as an interactive path through my
          frontend work.
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-20 md:gap-28">
        {projects.map((project, index) => (
          <article
            key={project.title}
            className={`grid items-center gap-10 transition duration-700 ease-out md:grid-cols-2 md:gap-16 ${
              activeProject === index
                ? 'opacity-100 grayscale-0'
                : 'opacity-45 grayscale'
            }`}
          >
            <div className={index % 2 === 1 ? 'md:order-2' : undefined}>
              <ProjectMockup project={project} index={index} />
            </div>
            <ProjectDetails project={project} index={index} />
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectDetails({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  return (
    <div className="max-w-xl">
      <p
        className="text-sm font-bold uppercase tracking-[0.32em]"
        style={{ color: project.accent }}
      >
        PROJECT {index + 1}
      </p>
      <h3 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">
        {project.title}
      </h3>
      <p className="mt-5 text-base leading-8 text-foreground/68 md:text-lg">
        {project.description}
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <a
          href={project.live}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-foreground transition hover:text-teal-500"
        >
          Read more
          <span className="transition duration-300 group-hover:translate-x-1" aria-hidden="true">
            &rarr;
          </span>
        </a>
        <a
          href={project.github}
          target="_blank"
          rel="noreferrer"
          aria-label={`${project.title} GitHub repository`}
          className="grid size-10 place-items-center rounded-full border border-foreground/10 bg-background/80 text-foreground/70 transition hover:-translate-y-0.5 hover:border-foreground/25 hover:text-foreground"
        >
          <GitHubIcon className="size-5" />
        </a>
        <a
          href={project.live}
          target="_blank"
          rel="noreferrer"
          aria-label={`${project.title} live demo`}
          className="grid size-10 place-items-center rounded-full border border-foreground/10 bg-background/80 text-foreground/70 transition hover:-translate-y-0.5 hover:border-foreground/25 hover:text-teal-500"
        >
          <LiveDemoIcon className="size-5" />
        </a>
      </div>
    </div>
  );
}

function ProjectMockup({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  return (
    <div className="relative mx-auto w-full max-w-lg py-6">
      <div
        className="absolute inset-6 translate-x-5 translate-y-5 rounded-[2rem] border-2 border-dashed opacity-70"
        style={{ borderColor: project.accent }}
        aria-hidden="true"
      />
      <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-foreground/10 bg-background/88 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur">
        <div
          className="absolute inset-x-8 top-8 h-36 rounded-[1.5rem] opacity-95"
          style={{ backgroundColor: project.accent }}
          aria-hidden="true"
        />
        <div className="relative mt-12 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
          <ScreenPanel
            label={project.panels[0]}
            accent={project.accent}
            className="min-h-52 rotate-[-3deg]"
          />
          <div className="grid gap-4 pt-8">
            <ScreenPanel
              label={project.panels[1]}
              accent={project.accent}
              className="min-h-32 rotate-[4deg]"
              compact
            />
            <ScreenPanel
              label={project.panels[2]}
              accent={project.accent}
              className="min-h-28 rotate-[-2deg]"
              compact
            />
          </div>
        </div>
        <span
          className={`absolute bottom-6 size-20 rounded-full opacity-15 blur-xl ${
            index % 2 === 0 ? 'left-8' : 'right-8'
          }`}
          style={{ backgroundColor: project.accent }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function ScreenPanel({
  label,
  accent,
  compact = false,
  className = '',
}: {
  label: string;
  accent: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.35rem] border border-foreground/10 bg-background/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur transition duration-500 hover:-translate-y-1 ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="size-2 rounded-full" style={{ backgroundColor: accent }} />
        <span className="h-2 w-20 rounded-full bg-foreground/12" />
      </div>
      <p className="text-sm font-bold text-foreground">{label}</p>
      <div className="mt-4 space-y-2">
        <span className="block h-2 rounded-full bg-foreground/12" />
        <span className="block h-2 w-4/5 rounded-full bg-foreground/10" />
        <span className="block h-2 w-2/3 rounded-full bg-foreground/10" />
      </div>
      {!compact ? (
        <div className="mt-6 grid grid-cols-3 gap-2">
          <span className="h-14 rounded-2xl bg-foreground/8" />
          <span className="h-14 rounded-2xl bg-foreground/8" />
          <span className="h-14 rounded-2xl bg-foreground/8" />
        </div>
      ) : null}
    </div>
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

function LiveDemoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 5h5m0 0v5m0-5-8 8"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"
      />
    </svg>
  );
}
