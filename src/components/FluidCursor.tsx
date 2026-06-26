'use client';
import { useEffect } from 'react';

import fluidCursor from '@/src/hooks/use-FluidCursor';

const FluidCursor = () => {
  useEffect(() => {
    fluidCursor();
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <canvas id="fluid" className="h-full w-full" />
    </div>
  );
};
export default FluidCursor;
