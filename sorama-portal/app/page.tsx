"use client";

import { useWebRTC } from "../hooks/useWebRTC";

export default function Home() {
  useWebRTC();
  return (
    <div>
      <main>
        <h1>WebRTC Test</h1>
        <p>Check the console for WebRTC and signaling logs.</p>
      </main>
    </div>
  );
}
