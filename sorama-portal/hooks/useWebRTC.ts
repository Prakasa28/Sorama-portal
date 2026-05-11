"use client";

import { useEffect, useRef, useState } from "react";
import type { FolderEntry } from "../types/measurements";

const SIGNALING_URL = "wss://cloud-signaling-server.onrender.com";

export function useWebRTC() {
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const receivedChunks = useRef<ArrayBuffer[]>([]);
  const requestedFileKey = useRef<string | null>(null);
  const currentRequest = useRef<{
  key: string;
  type: "thumbnail" | "metadata";
} | null>(null);
const isRequestingFile = useRef(false);

  const [devices, setDevices] = useState<string[]>([]);
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [recordingMetadata, setRecordingMetadata] = useState<Record<string, any>>({});

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
  if (typeof event.data === "string") {
    try {
      const data = JSON.parse(event.data);

      if (data.folderList) {
        console.log("Received folder list:", data.folderList);
        setFolders(data.folderList);
        return;
      }

      if (data.fileComplete) {
        const request = currentRequest.current;
        if (!request) return;

        const blob = new Blob(receivedChunks.current);
        const isMetadata = request.key.endsWith("metadata.json");

        if (isMetadata) {
          blob.text().then((text) => {
            try {
              const metadata = JSON.parse(text);

              setRecordingMetadata((current) => ({
                ...current,
                [request.key]: metadata,
              }));
            } catch (error) {
              console.error("Failed to parse metadata JSON:", {
                key: request.key,
                textStart: text.slice(0, 30),
                error,
              });
            }
          });
        } else {
          const url = URL.createObjectURL(blob);

          setThumbnailUrls((current) => ({
            ...current,
            [request.key]: url,
          }));
      }

  receivedChunks.current = [];
  currentRequest.current = null;
  isRequestingFile.current = false;
  return;
}

      console.log("Parsed JSON message:", data);
    } catch {
      console.log("Raw non-JSON message:", event.data);
    }

    return;
  }

  receivedChunks.current.push(event.data as ArrayBuffer);
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

function requestFile(folder: string, file: string): boolean {
  const channel = channelRef.current;

  if (!channel || channel.readyState !== "open") {
    console.log("Data channel is not open yet");
    return false;
  }

  if (isRequestingFile.current) {
    console.log("File request already in progress");
    return false;
  }

  console.log("Requesting file:", { folder, file });

  const key = `${folder}/${file}`;

  isRequestingFile.current = true;

  currentRequest.current = {
    key,
    type: file.endsWith("metadata.json") ? "metadata" : "thumbnail",
  };

  receivedChunks.current = [];

  channel.send(JSON.stringify({ getFile: { folder, file } }));

  return true;
}

  function requestMetadata(folder: string):boolean {
  return requestFile(folder, "metadata.json");
  }

  return {
    devices,
    folders,
    selectedDevice,
    isConnected,
    connectToDevice,
    reloadDevices,
    requestFile,
    requestMetadata,
    recordingMetadata,
    thumbnailUrls
  };
}