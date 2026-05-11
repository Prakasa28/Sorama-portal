"use client";

import { useWebRTC } from "../hooks/useWebRTC";
import { MeasurementsOverview } from "../components/measurementsOverview"
import { DeviceDiscovery } from "../components/deviceDiscovery";

export default function Home() {
  const{
    devices,
    folders,
    selectedDevice,
    isConnected,
    thumbnailUrls,
    requestFile,
    connectToDevice,
    reloadDevices,
    recordingMetadata,
    requestMetadata
  } = useWebRTC();

  if (!isConnected) {
    return (
      <DeviceDiscovery
        devices={devices}
        selectedDevice={selectedDevice}
        isConnected={isConnected}
        onSelectDevice={connectToDevice}
        onReloadDevices={reloadDevices}
      />
    );
  }
  return (
    <div>
      <main>
      <MeasurementsOverview
       folders={folders}
       thumbnailUrls={thumbnailUrls}
       requestFile={requestFile}
       requestMetadata={requestMetadata}
       recordingMetadata={recordingMetadata}
       />
      
      </main>
    </div>
  );
}
