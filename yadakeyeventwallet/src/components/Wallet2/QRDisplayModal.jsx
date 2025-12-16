import { Modal, Text } from "@mantine/core";
import { QRCodeSVG } from "qrcode.react";
import { useMantineColorScheme } from "@mantine/core";

const QRDisplayModal = ({ isOpen, onClose, parsedData, log, styles, selectedBlockchain, walletManager }) => {
  const { colorScheme } = useMantineColorScheme();

  // Determine which address to display based on blockchain
  const getDisplayAddress = () => {
    // For Salvium blockchain
    if (selectedBlockchain?.id === "sal") {
      // Use primary address from Salvium wallet manager
      return walletManager?.primaryAddress || parsedData?.publicKeyHash || "Salvium address not initialized";
    }
    
    // For YadaCoin and other blockchains with key rotation
    if (parsedData?.publicKeyHash) {
      // Show prerotated address if rotation is ahead (secure receiving)
      return parsedData.rotation !== log.length
        ? parsedData.prerotatedKeyHash
        : parsedData.publicKeyHash;
    }
    
    return null;
  };

  const displayAddress = getDisplayAddress();

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`${selectedBlockchain?.name || 'Wallet'} Address QR Code`}
      size="sm"
      styles={{ modal: styles.qrModal, title: styles.title }}
    >
      {displayAddress ? (
        <>
          <QRCodeSVG
            value={displayAddress}
            size={200}
            bgColor={colorScheme === "dark" ? "#1A1B1E" : "#FFFFFF"}
            fgColor={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
          />
          <Text size="xs" mt="md" style={{ wordBreak: "break-all" }}>
            {displayAddress}
          </Text>
          {selectedBlockchain?.id === "sal" && (
            <>
              <Text size="xs" color="dimmed" mt="xs">
                Use this address to receive Salvium (SAL)
              </Text>
              {displayAddress && displayAddress.length > 106 && (
                <Text size="xs" color="violet" mt="xs" fw="bold">
                  ⚡ CARROT-enabled: Supports return transactions
                </Text>
              )}
              {displayAddress && displayAddress.length <= 106 && walletManager?.walletRpcUrl && (
                <Text size="xs" color="yellow" mt="xs">
                  Note: For CARROT return transactions, configure integrated addresses
                </Text>
              )}
            </>
          )}
        </>
      ) : (
        <Text>No address available</Text>
      )}
    </Modal>
  );
};

export default QRDisplayModal;
