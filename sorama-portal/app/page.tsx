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
    requestMetadata,
    fileUrls,
    requestDownloadFile,
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
       fileUrls={fileUrls}
       requestFile={requestFile}
       requestMetadata={requestMetadata}
       requestDownloadFile={requestDownloadFile}
       recordingMetadata={recordingMetadata}
       />
      
      </main>
    </div>
  );
}
