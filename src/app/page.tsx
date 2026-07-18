import FluidCursor from "@/src/components/FluidCursor";
import HeroSection from "@/src/components/HeroSection";
import Projects from "@/src/components/Projects";
import SkillsSnake from "@/src/components/SkillsSnake";
import FloatingSectionNav, { SectionNavProvider } from "@/src/components/FloatingSectionNav";
import WorkTimeLineClient from "@/src/components/WorkTimeLineClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thuraya Aldj Portfolio",
  description: "Frontend Developer ",
};

export default function Home() {
  return (
    <SectionNavProvider>
      <div className="relative flex flex-1 flex-col items-center justify-center bg-background font-sans text-foreground">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.18)_1px,transparent_1px)] bg-[size:16px_16px]" />
        <FluidCursor />
        <FloatingSectionNav />
        <main className="relative z-10 flex w-full flex-1 flex-col items-center overflow-hidden">
          <HeroSection />
          <WorkTimeLineClient />
          <Projects />
          <SkillsSnake />
        </main>
      </div>
    </SectionNavProvider>
  );
}
