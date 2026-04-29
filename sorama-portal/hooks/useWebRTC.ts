"use client";

import { useEffect, useRef } from "react";

const SIGNALING_URL = "wss://cloud-signaling-server.onrender.com";

export function useWebRTC() {
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    const ws = new WebSocket(SIGNALING_URL);
    const pc = new RTCPeerConnection();
    const channel = pc.createDataChannel("test");

    wsRef.current = ws;
    pcRef.current = pc;
    channelRef.current = channel;

    channel.binaryType = "arraybuffer";

    channel.onopen = () => {
      console.log("DataChannel opened");
      channel.send("Hello from Browser");
    };

    channel.onmessage = (event) => {
      console.log("Device message:", event.data);

      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          console.log("Parsed device message:", data);
        } catch {
          console.log("Raw device message:", event.data);
        }
      }
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;

      console.log("Browser ICE:", event.candidate);
      ws.send(JSON.stringify({ ice: event.candidate }));
    };

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ role: "browser", action: "listRooms" }));
    };

    ws.onmessage = async (event) => {
      if (typeof event.data !== "string") return;

      const data = JSON.parse(event.data);
      console.log("Signaling message:", data);

      if (data.rooms?.length) {
        joinDevice(data.rooms[0]);
      }

      if (data.answer) {
        await pc.setRemoteDescription(data.answer);

        for (const candidate of pendingCandidates.current) {
          await pc.addIceCandidate(candidate);
        }

        pendingCandidates.current = [];
      }

      if (data.ice) {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(data.ice);
        } else {
          pendingCandidates.current.push(data.ice);
        }
      }
    };

    async function joinDevice(deviceId: string) {
      console.log("Joining device:", deviceId);

      ws.send(
        JSON.stringify({
          role: "browser",
          action: "joinRoom",
          deviceId,
        })
      );

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("Sending offer:", offer);
      ws.send(JSON.stringify({ offer }));
    }

    return () => {
      channel.close();
      pc.close();
      ws.close();
    };
  }, []);
}