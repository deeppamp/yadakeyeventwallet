// Flasher.js
import React from "react";
import "esp-web-tools/dist/web/install-button"; // Load the web component
import { Text, Stack } from "@mantine/core";
import { useAppContext } from "../../context/AppContext";

// Firmware manifest URLs for different blockchains
const FIRMWARE_MANIFESTS = {
  yda: "https://raw.githubusercontent.com/pdxwebdev/yada-wallet/refs/heads/master/YADA/manifest.json",
  bsc: "https://raw.githubusercontent.com/pdxwebdev/yada-wallet/refs/heads/master/YADA/manifest.json", // BSC uses YadaCoin firmware
  sal: `${window.location.origin}/wallet/salvium-firmware/manifest.json?v=${Date.now()}`, // Local Salvium firmware (development)
  btc: null, // Bitcoin not yet implemented
  eth: null, // Ethereum not yet implemented
};

console.log('Salvium manifest URL:', FIRMWARE_MANIFESTS.sal);

export default function Flasher() {
  const { selectedBlockchain } = useAppContext();
  
  const manifestUrl = FIRMWARE_MANIFESTS[selectedBlockchain?.id];
  
  if (!manifestUrl) {
    return (
      <Stack spacing="xs">
        <Text color="orange" size="sm">
          Hardware wallet firmware for {selectedBlockchain?.name || "this blockchain"} is not yet available.
        </Text>
        <Text size="xs" color="dimmed">
          Please check back later or follow the project repository for updates.
        </Text>
      </Stack>
    );
  }
  
  return (
    <Stack spacing="xs">
      {selectedBlockchain?.id === "sal" && (
        <Text size="sm" color="orange" fw="bold" mb="sm">
          ⚠️ ALPHA WARNING: Salvium firmware is in early development. Do NOT use with real funds!
        </Text>
      )}
      <Text size="sm" mb="xs">
        Flash {selectedBlockchain?.name} firmware to your ESP32 hardware wallet:
      </Text>
      <esp-web-install-button manifest={manifestUrl}></esp-web-install-button>
      {selectedBlockchain?.id === "sal" && (
        <>
          <Text size="xs" color="dimmed" mt="xs">
            Note: Salvium firmware requires CryptoNote-compatible hardware wallet implementation with Ed25519/Curve25519 cryptography.
          </Text>
          <Text size="xs" color="red" mt="xs">
            Current binaries are placeholders. Real firmware requires implementation of ring signatures and Bulletproofs.
          </Text>
        </>
      )}
    </Stack>
  );
}
