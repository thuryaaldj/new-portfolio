'use client';

import dynamic from 'next/dynamic';

const WorkTimeLine = dynamic(() => import('@/src/components/WorkTimeLine'), {
  ssr: false,
});

export default function WorkTimeLineClient() {
  return <WorkTimeLine />;
}
