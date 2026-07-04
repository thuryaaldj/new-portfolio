"use client";

import { useEffect, useRef, useState } from "react";

export default function Education() {
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
      { threshold: 0.35 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full max-w-7xl px-8 py-16 md:px-20"
      aria-labelledby="education-heading"
    >
      <article className="group relative mx-auto min-h-[33rem] max-w-5xl overflow-visible rounded-[1.25rem] transition-transform duration-300 ease-in-out hover:-translate-y-1 motion-reduce:transform-none">
        <EducationLineArt isVisible={isVisible} />

        <div className="relative z-10 mx-auto max-w-xl px-6 pb-16 pt-72 text-gray-800 [[data-theme=dark]_&]:text-white md:absolute md:left-[56%] md:right-[5%] md:top-[9.5rem] md:ml-0 md:max-w-none md:px-0 md:py-0">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500 [[data-theme=dark]_&]:text-white/55">
            Education
          </p> 
          <h2
            id="education-heading"
            className="mt-4 text-3xl font-black tracking-tight md:text-4xl"
          >
            Bachelor&apos;s Degree in Software Engineering
          </h2>
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-semibold text-gray-500 [[data-theme=dark]_&]:text-white/55">
                University
              </p>
              <p className="mt-1 font-bold">Software Engineering </p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 [[data-theme=dark]_&]:text-white/55">
                Graduation Year
              </p>
              <p className="mt-1 font-bold">Sep, 2025</p>
            </div>
            {/* <div>
              <p className="font-semibold text-gray-500 [[data-theme=dark]_&]:text-white/55">
                GPA
              </p>
              <p className="mt-1 font-bold">Available upon request</p>
            </div> */}
          </div>
          {/* <p className="mt-6 max-w-2xl leading-7 text-gray-600 [[data-theme=dark]_&]:text-white/70">
            Focused on building reliable software systems, user-friendly web
            interfaces, and practical engineering foundations for modern
            frontend development.
          </p> */}
        </div>
      </article>
    </section>
  );
}

function EducationLineArt({ isVisible }: { isVisible: boolean }) {
  const shapeTransform = "translate(450 230) scale(1.2 1.1) translate(-450 -230)";
  const tracerStyle = {
    strokeDasharray: "90 2810",
  };

  return (
    <svg
      className="absolute inset-0 h-full w-full overflow-visible text-[#9CA3AF] transition-[filter] duration-300 ease-in-out [[data-theme=dark]_&]:text-[#9CA3AF] [[data-theme=dark]_&]:group-hover:drop-shadow-[0_0_16px_rgba(255,255,255,0.28)]"
      viewBox="0 0 900 460"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <style>
        {`
          .education-line-tracer {
            animation: education-line-trace 4.5s linear infinite;
          }

          @keyframes education-line-trace {
            from {
              stroke-dashoffset: 2900;
            }
            to {
              stroke-dashoffset: 0;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .education-line-tracer {
              animation: none;
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
      <EducationLinePaths transform={shapeTransform} />
      <g
        className={`${isVisible ? "education-line-tracer opacity-100" : "opacity-0"} stroke-black transition-opacity duration-300 ease-in-out [[data-theme=dark]_&]:stroke-white`}
        transform={shapeTransform}
        style={tracerStyle}
      >
        <EducationLinePaths />
      </g>
    </svg>
  );
}

function EducationLinePaths({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      <path d="M24 225 C82 225 105 232 116 252 C124 267 101 278 99 257 C96 229 132 210 197 214" />
      <path d="M120 118 C196 138 267 152 331 172 C392 216 462 260 552 316 C561 322 555 333 544 329 C455 302 380 277 294 245 C235 224 180 207 132 205" />
      <path d="M135 205 C122 229 114 253 108 278 C152 286 195 302 236 334 C278 367 321 371 367 349 C377 324 386 299 394 276 C341 244 285 217 223 201 C184 191 151 191 135 205Z" />
      <path d="M121 282 C166 291 209 308 247 341 C282 371 320 377 363 358" />
      <path d="M448 277 C457 281 462 288 460 298 C453 338 444 376 447 415" />
      <path d="M447 415 C475 417 505 414 534 408 C558 403 581 411 603 424" />
      <path d="M459 299 C466 303 472 311 471 321 C468 354 468 384 476 416" />
      <path d="M460 299 L548 328" />
      <path d="M198 214 C242 215 284 224 321 245 C346 259 371 275 395 292" />
      <path d="M395 292 C414 303 431 315 452 328 C471 339 493 346 520 348" />
      <path d="M520 348 C548 348 548 326 526 321 C500 315 493 352 526 358 C570 366 621 360 680 352" />
      <path d="M326 82 C460 70 610 74 800 92 C831 95 846 110 842 138 C829 230 823 305 832 372 C837 406 818 424 784 424 C650 421 516 417 348 426 C315 428 298 413 302 380 C313 288 309 203 300 124 C297 98 308 85 326 82Z" />
      <path d="M303 132 C424 119 601 121 815 139" />
      <path d="M334 425 C474 403 618 409 803 421" />
    </g>
  );
}
