"use client";

import { useWebRTC } from "../hooks/useWebRTC";
import { MeasurementsOverview } from "../components/measurementsOverview"

export default function Home() {
  useWebRTC();
  return (
    <div>
      <main>
      <MeasurementsOverview />
      </main>
    </div>
  );
}
