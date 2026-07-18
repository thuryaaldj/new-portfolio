import Image from "next/image";
import heroImage from "@/src/app/hero.png";
import { MobileSectionNav } from "@/src/components/FloatingSectionNav";

export default function HeroSection() {
  return (
    <section id="home" className="grid w-full max-w-7xl grid-cols-1 items-center gap-12 overflow-hidden px-8 py-24 md:grid-cols-2 md:px-20 md:py-32">
      <div className="relative z-10 space-y-6 text-center md:text-left">
        <MobileSectionNav />
        <p className="text-base font-semibold tracking-[0.3em] text-foreground/60">
          Hi i&apos;m
        </p>
        <h1 className="text-7xl font-bold tracking-tight md:text-7xl">
          Thuraya Aldj
        </h1>
        <p className="text-xl text-foreground/70">
          Front-End Developer crafting fast, polished, and delightful web
          experiences.
        </p>
      </div>
      <div className="relative z-10 flex justify-center md:justify-end">
        <Image
          src={heroImage}
          alt="Hero illustration"
          priority
          className="h-auto w-full max-w-md rounded-3xl object-contain"
        />
      </div>
    </section>
  );
}
