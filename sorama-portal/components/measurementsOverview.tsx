"use client";

import { useWebRTC } from "../hooks/useWebRTC";
import { MeasurementCard } from "./measurementCard";


export function MeasurementsOverview() {
  const { folders } = useWebRTC();  

  return (
    <main className="measurement-overview-page">
        <section className="measurements-grid">
            {folders.length === 0 ? (
                <p className="measurement-empty"> waiting for device data...</p>
            ) : (
                folders.map((folder, index) => (
                    <MeasurementCard key={index} folder={folder} />
                ))
            )}
        </section>
    </main>
  );
}