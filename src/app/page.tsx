import FluidCursor from "@/src/components/FluidCursor";
import ThemeSwitch from "@/src/components/ThemeSwitch";
import Image from "next/image";
import heroImage from "./hero.png";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center bg-background font-sans text-foreground">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.18)_1px,transparent_1px)] bg-[size:16px_16px]" />
      <FluidCursor />
      <div className="fixed right-6 top-6 z-20">
        <ThemeSwitch />
      </div>
      <main className="relative z-10 grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 overflow-hidden px-8 py-32 md:grid-cols-2 md:px-20">
        {/* <FluidCursor /> */}
        <section className="relative z-10 space-y-6 text-center md:text-left">
          <p className="text-base font-semibold tracking-[0.3em] text-foreground/60">
            Hi i'm
          </p>
          <h1 className="text-7xl font-bold tracking-tight md:text-7xl">
            Thuraya Aldj
          </h1>
          <p className="text-xl text-foreground/70">
          Front-End Developer crafting fast, polished, and delightful web experiences.
          </p>
        </section>
        <div className="relative z-10 flex justify-center md:justify-end">
          <Image
            src={heroImage}
            alt="Hero illustration"
            priority
            className="h-auto w-full max-w-md rounded-3xl object-contain"
          />
        </div>
      </main>
      
      </div>
    // </div>
  );
}
