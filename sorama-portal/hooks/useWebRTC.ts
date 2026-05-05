"use client";

import { useEffect, useRef, useState } from "react";
import type { FolderEntry } from "../types/measurements";

const SIGNALING_URL = "wss://cloud-signaling-server.onrender.com";

export function useWebRTC() {
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const [devices, setDevices] = useState<string[]>([]);
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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
      setIsConnected(true);
      channel.send("Hello from Browser");
    };

    channel.onmessage = (event) => {
      if (typeof event.data !== "string") {
        console.log("Binary data received:", event.data);
        return;
      }

      try {
        const data = JSON.parse(event.data);

        if (data.folderList) {
          console.log("Received folder list:", data.folderList);
          setFolders(data.folderList);
          return;
        }

        console.log("Parsed JSON message:", data);
      } catch {
        console.log("Raw non-JSON message:", event.data);
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

      if (data.rooms) {
        setDevices(data.rooms);
        return;
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

    return () => {
      channel.close();
      pc.close();
      ws.close();
    };
  }, []);

  async function connectToDevice(deviceId: string) {
    const ws = wsRef.current;
    const pc = pcRef.current;

    if (!ws || !pc) return;

    console.log("Joining device:", deviceId);
    setSelectedDevice(deviceId);

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

  function reloadDevices() {
  wsRef.current?.send(
    JSON.stringify({ role: "browser", action: "listRooms" })
  );
}

  return {
    devices,
    folders,
    selectedDevice,
    isConnected,
    connectToDevice,
    reloadDevices,
  };
}