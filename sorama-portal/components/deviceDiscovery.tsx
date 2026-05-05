"use client";

import Image from "next/image";

type Props = {
  devices: string[];
  selectedDevice: string | null;
  isConnected: boolean;
  onSelectDevice: (deviceId: string) => void;
  onReloadDevices: () => void;
};

export function DeviceDiscovery({
  devices,
  selectedDevice,
  isConnected,
  onSelectDevice,
  onReloadDevices,
}: Props) {
  return (
    <main className="device-discovery-page">
      <header className="device-discovery-header">
        <Image
          src="/images/icons/sorama-logo.svg"
          alt="Sorama logo"
          width={70}
          height={70}
        />
        <h1>Welcome to Sorama Portal</h1>
        <p>Select a device to connect</p>
      </header>

      <section className="device-discovery-card">
        <h2>Device management</h2>
         <p>Select a device to connect it with the Sorama Portal</p>

        <div className="device-list">
          {devices.length === 0 ? (
            <p className="device-empty">Looking for devices...</p>
          ) : (
            devices.map((device) => (
              <button
                key={device}
                type="button"
                className="device-item"
                onClick={() => onSelectDevice(device)}
              >
                  <Image
                src="/images/icons/device.svg"
                alt=""
                width={34}
                height={34}
                className="device-item__icon"
              />
                <span>{device}</span>
              </button>
            ))
          )}
        </div>

        {selectedDevice && (
          <p className="device-status">
            {isConnected
              ? `Connected to ${selectedDevice}`
              : `Connecting to ${selectedDevice}...`}
          </p>
        )}

        <button 
        type="button" 
        className="device-reload"
        onClick={onReloadDevices}
        >Reload & look for devices</button>
      </section>
    </main>
  );
}