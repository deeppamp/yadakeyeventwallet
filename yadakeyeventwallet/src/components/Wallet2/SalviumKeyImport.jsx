import { useState } from "react";
import { TextInput, Button, Stack, Text, Card } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { isValidCryptoNotePrivateKey, getAddressFromKeys, deriveViewKey } from "../../utils/cryptonote";

const SalviumKeyImport = ({ onImport, styles }) => {
  const [privateKey, setPrivateKey] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!privateKey.trim()) {
      notifications.show({
        title: "Error",
        message: "Please enter a private spend key",
        color: "red",
      });
      return;
    }

    // Remove any whitespace
    const cleanKey = privateKey.trim();

    // Validate the key format
    if (!isValidCryptoNotePrivateKey(cleanKey)) {
      notifications.show({
        title: "Invalid Key",
        message: "Private key must be a 64-character hexadecimal string",
        color: "red",
      });
      return;
    }

    setIsImporting(true);

    try {
      // Derive view key from spend key
      const viewKey = await deriveViewKey(cleanKey);
      
      // Generate address from keys
      const address = await getAddressFromKeys(cleanKey, viewKey, 0);

      // Create a private key object compatible with the wallet
      const privateKeyObj = {
        privateKey: Buffer.from(cleanKey, 'hex'),
        spendKey: cleanKey,
        viewKey: viewKey,
        address: address,
      };

      // Call the onImport callback
      if (onImport) {
        await onImport(privateKeyObj, address);
      }

      notifications.show({
        title: "Success",
        message: `Salvium wallet imported successfully!`,
        color: "green",
      });

      // Clear the input
      setPrivateKey("");
    } catch (error) {
      console.error("Error importing Salvium key:", error);
      notifications.show({
        title: "Import Failed",
        message: error.message || "Failed to import private key",
        color: "red",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card withBorder mt="md" radius="md" p="md" style={styles?.card}>
      <Text size="sm" fw="bold" mb="md">
        Import Salvium Private Key
      </Text>
      <Stack spacing="md">
        <TextInput
          label="Private Spend Key (64 hex characters)"
          placeholder="Enter your Salvium private spend key..."
          value={privateKey}
          onChange={(e) => setPrivateKey(e.currentTarget.value)}
          disabled={isImporting}
          type="password"
        />
        <Text size="xs" color="dimmed">
          Your private key is stored locally and never sent to any server.
          The view key will be automatically derived from your spend key.
        </Text>
        <Button
          onClick={handleImport}
          loading={isImporting}
          disabled={!privateKey.trim()}
          color="violet"
        >
          Import Wallet
        </Button>
      </Stack>
    </Card>
  );
};

export default SalviumKeyImport;
