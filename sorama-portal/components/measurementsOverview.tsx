"use client";

import { useWebRTC } from "../hooks/useWebRTC";
import { MeasurementCard } from "./measurementCard";


export function MeasurementsOverview() {
  const { folders } = useWebRTC();  

  return (
    <main className="measurements-page">
        <section className="measurements-grid">
            {folders.length === 0 ? (
                <p className="measurements-empty"> waiting for device data...</p>
            ) : (
                folders.map((folder) => (
                    <MeasurementCard key={folder.name} folder={folder} />
                ))
            )}
        </section>
    </main>
  );
}