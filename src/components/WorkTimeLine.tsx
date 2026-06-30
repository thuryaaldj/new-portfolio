'use client';

import type { SVGProps } from 'react';

const experiences = [
  {
    number: '01',
    date: 'Jun -Sep 2025',
    company: 'Digit Innovation Hub',
    role: 'Frontend Developer Volunteer',
    description:
      'Contributed to polished, responsive interfaces while collaborating with a product-focused team.',
    color: '#25BDF2',
    shadow: 'rgba(101, 144, 160, 0.2)',
    accentSide: 'right',
    align: 'left',
  },
  {
    number: '02',
    date: 'Sep 2025 - Present',
    company: 'Doctors',
    role: 'Frontend Developer',
    description:
      'Built user-friendly web experiences with attention to layout, accessibility, and clean interactions.',
    color: '#008C78',
    shadow: 'rgba(76, 105, 101, 0.2)',
    accentSide: 'left',
    align: 'right',
  },
];

export default function CustomizedTimeline() {
  return (
    <section className="w-full max-w-7xl px-8 py-24 md:px-20">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/50">
          Experience
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Work Timeline
        </h2>
        <p className="mt-4 text-lg text-foreground/65">
          A quick look at the teams, products, and frontend work shaping my
          journey.
        </p>
      </div>

      <ol className="relative flex flex-col gap-8 md:gap-10 before:absolute before:left-1/2 before:top-4 before:bottom-4 before:hidden before:w-px before:-translate-x-1/2 before:bg-teal-500/35 md:before:block">
        {experiences.map((experience, index) => (
          <li
            key={`${experience.company}-${experience.date}`}
            className="relative md:min-h-44"
          >
            <ExperienceCapsule experience={experience} />

            <TimelineAnchor align={experience.align} color={experience.color} />

            {index < experiences.length - 1 ? <MobileConnector /> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function ExperienceCapsule({ experience }: { experience: (typeof experiences)[number] }) {
  const isAccentLeft = experience.accentSide === 'left';

  return (
    <div
      className={`flex w-full md:w-[46%] ${
        experience.align === 'right' ? 'md:ml-auto' : 'md:mr-auto'
      }`}
    >
      <article
        className={`group flex min-h-28 w-full overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-background/85 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-foreground/25 sm:rounded-full ${
          isAccentLeft ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row-reverse'
        }`}
        style={{
          boxShadow: `14px 18px 30px ${experience.shadow}, 0 8px 18px rgba(15, 23, 42, 0.09)`,
        }}
      >
        <div
          className="flex min-h-20 shrink-0 items-center justify-between gap-4 px-6 py-4 text-white sm:w-28 sm:flex-col sm:justify-center sm:text-center"
          style={{ backgroundColor: experience.color }}
        >
          <span className="text-4xl font-black leading-none tracking-tight">
            {experience.number}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
            {experience.date}
          </span>
        </div>

        <div
          className={`flex flex-1 items-center gap-4 px-5 py-5 md:px-6 ${
            isAccentLeft ? 'sm:flex-row-reverse sm:text-right' : 'text-left'
          }`}
        >
          <span
            className="grid size-12 shrink-0 place-items-center rounded-full text-white shadow-lg transition duration-300 group-hover:scale-110"
            style={{ backgroundColor: experience.color }}
            aria-hidden="true"
          >
            <BriefcaseIcon className="size-6" />
          </span>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {experience.company}
            </h3>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              {experience.role}
            </p>
            <p className="mt-2.5 text-sm leading-6 text-foreground/70">
              {experience.description}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

function TimelineAnchor({ align, color }: { align: string; color: string }) {
  const isLeftCard = align === 'left';

  return (
    <>
      <span
        className={`absolute top-1/2 hidden h-px w-[4%] -translate-y-1/2 bg-teal-500/55 md:block ${
          isLeftCard ? 'left-[46%]' : 'right-[46%]'
        }`}
        aria-hidden="true"
      />
      <span
        className="absolute left-1/2 top-1/2 hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background shadow-[0_0_0_8px_rgba(20,184,166,0.12)] md:block"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
    </>
  );
}

function MobileConnector() {
  return (
    <div className="flex h-10 items-center justify-center md:hidden" aria-hidden="true">
      <div className="flex w-40 items-center gap-3">
        <span className="h-px flex-1 bg-teal-500/55" />
        <span className="flex gap-1.5">
          <span className="size-1.5 rounded-full bg-teal-500/80" />
          <span className="size-1.5 rounded-full bg-teal-500/55" />
          <span className="size-1.5 rounded-full bg-teal-500/30" />
        </span>
        <span className="h-px flex-1 bg-teal-500/55" />
      </div>
    </div>
  );
}

function BriefcaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 8h16a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h18M10 13v1h4v-1" />
    </svg>
  );
}
