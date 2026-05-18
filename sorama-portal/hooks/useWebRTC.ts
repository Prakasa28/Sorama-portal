"use client";

import { useEffect, useRef, useState } from "react";
import type { FolderEntry } from "../types/measurements";

const SIGNALING_URL = "wss://cloud-signaling-server.onrender.com";

type RequestType = "thumbnail" | "metadata" | "preview" | "download" | "blob";

type CurrentRequest = {
  key: string;
  type: RequestType;
};

export function useWebRTC() {
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const receivedChunks = useRef<ArrayBuffer[]>([]);
  const currentRequest = useRef<CurrentRequest | null>(null);
  const isRequestingFile = useRef(false);

  const [devices, setDevices] = useState<string[]>([]);
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [recordingMetadata, setRecordingMetadata] = useState<Record<string, any>>({});
  const fileBlobResolver = useRef<((blob: Blob | null) => void) | null>(null);

  function handleFileComplete() {
    const request = currentRequest.current;
    if (!request) return;

    const extension = request.key.split(".").pop()?.toLowerCase();

    const mimeType =
      extension === "pdf"
        ? "application/pdf"
        : extension === "mp4"
        ? "video/mp4"
        : "image/jpeg";

    const blob = new Blob(receivedChunks.current, { type: mimeType });

    if (request.type === "metadata") {
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
    }

    if (request.type === "thumbnail") {
      const url = URL.createObjectURL(blob);
      setThumbnailUrls((current) => ({
        ...current,
        [request.key]: url,
      }));
    }

    if (request.type === "preview") {
      const url = URL.createObjectURL(blob);
      setFileUrls((current) => ({
        ...current,
        [request.key]: url,
      }));
    }

    if (request.type === "download") {
      downloadBlob(blob, request.key);
    }
     
    if (request.type === "blob") {
      fileBlobResolver.current?.(blob);
      fileBlobResolver.current = null;
    }

    receivedChunks.current = [];
    currentRequest.current = null;
    isRequestingFile.current = false;

  }

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
            setFolders(data.folderList);
            return;
          }

          if (data.fileComplete) {
            handleFileComplete();
            return;
          }
        } catch {
          console.log("Raw non-JSON message:", event.data);
        }

        return;
      }

      receivedChunks.current.push(event.data as ArrayBuffer);
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      ws.send(JSON.stringify({ ice: event.candidate }));
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({ role: "browser", action: "listRooms" }));
    };

    ws.onmessage = async (event) => {
      if (typeof event.data !== "string") return;

      const data = JSON.parse(event.data);

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

    ws.send(JSON.stringify({ offer }));
  }

  function reloadDevices() {
    wsRef.current?.send(
      JSON.stringify({ role: "browser", action: "listRooms" })
    );
  }

  function requestFile(folder: string, file: string): boolean {
    return startFileRequest(folder, file, getPreviewRequestType(file));
  }

  function requestDownloadFile(folder: string, file: string): boolean {
    return startFileRequest(folder, file, "download");
  }

  function requestMetadata(folder: string): boolean {
    return requestFile(folder, "metadata.json");
  }

  function startFileRequest(
    folder: string,
    file: string,
    type: RequestType
  ): boolean {
    const channel = channelRef.current;

    if (!channel || channel.readyState !== "open") {
      console.log("Data channel is not open yet");
      return false;
    }

    if (isRequestingFile.current) {
      console.log("File request already in progress");
      return false;
    }

    const key = `${folder}/${file}`;

    isRequestingFile.current = true;
    receivedChunks.current = [];
    currentRequest.current = { key, type };

    channel.send(JSON.stringify({ getFile: { folder, file } }));

    return true;
  }

   function requestFileBlob(folder: string, file: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const channel = channelRef.current;

    if (!channel || channel.readyState !== "open") {
      resolve(null);
      return;
    }

    if (isRequestingFile.current) {
      resolve(null);
      return;
    }

    const key = `${folder}/${file}`;

    isRequestingFile.current = true;
    receivedChunks.current = [];

    currentRequest.current = {
      key,
      type: "blob",
    };

    fileBlobResolver.current = resolve;

    channel.send(JSON.stringify({ getFile: { folder, file } }));
  });
}

  return {
    devices,
    folders,
    selectedDevice,
    isConnected,
    connectToDevice,
    reloadDevices,
    requestFile,
    requestDownloadFile,
    requestMetadata,
    requestFileBlob,
    recordingMetadata,
    thumbnailUrls,
    fileUrls,
  };
}

function getPreviewRequestType(file: string): RequestType {
  if (file.endsWith("metadata.json")) return "metadata";
  if (file.endsWith("thumbnail.jpeg")) return "thumbnail";
  if (file.endsWith("image.jpeg") || file.endsWith("video.mp4")) return "preview";

  return "download";
}

function downloadBlob(blob: Blob, key: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = key.split("/").pop() ?? "download";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}