import { Modal, TextInput, PasswordInput, Button, Stack, Text, Group, Alert } from "@mantine/core";
import { IconInfoCircle, IconWallet } from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

/**
 * Salvium Wallet RPC Configuration Modal
 * Allows users to configure wallet RPC connection for full wallet functionality
 */
export function SalviumWalletRpcConfig({ opened, onClose, walletManager }) {
  const [rpcUrl, setRpcUrl] = useState(
    localStorage.getItem("salvium_wallet_rpc_url") || "http://localhost:18082"
  );
  const [username, setUsername] = useState(
    localStorage.getItem("salvium_wallet_rpc_user") || ""
  );
  const [password, setPassword] = useState("");
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      // Configure wallet RPC
      walletManager.configureWalletRpc(rpcUrl, username || null, password || null);

      // Test connection
      const result = await walletManager.walletRpcCall("get_height");

      if (result && result.height) {
        // Save configuration
        localStorage.setItem("salvium_wallet_rpc_url", rpcUrl);
        if (username) {
          localStorage.setItem("salvium_wallet_rpc_user", username);
        }

        notifications.show({
          title: "Connection Successful",
          message: `Connected to wallet RPC at height ${result.height}`,
          color: "green",
        });

        onClose();
      }
    } catch (error) {
      notifications.show({
        title: "Connection Failed",
        message: error.message,
        color: "red",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("salvium_wallet_rpc_url");
    localStorage.removeItem("salvium_wallet_rpc_user");
    walletManager.configureWalletRpc(null);
    setRpcUrl("http://localhost:18082");
    setUsername("");
    setPassword("");

    notifications.show({
      title: "Configuration Cleared",
      message: "Wallet RPC settings have been removed",
      color: "blue",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Salvium Wallet RPC Configuration"
      size="md"
    >
      <Stack spacing="md">
        <Alert icon={<IconInfoCircle size={16} />} title="Wallet RPC Required" color="blue">
          For full functionality (balance, transactions, sending), you need to run salvium-wallet-rpc.
          This connects your wallet to the Salvium blockchain for scanning and signing.
        </Alert>

        <TextInput
          label="Wallet RPC URL"
          placeholder="http://localhost:18082"
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
          description="URL of your running salvium-wallet-rpc instance"
          icon={<IconWallet size={16} />}
        />

        <TextInput
          label="Username (Optional)"
          placeholder="Leave empty if no authentication"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          description="If your wallet RPC requires authentication"
        />

        <PasswordInput
          label="Password (Optional)"
          placeholder="Leave empty if no authentication"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          description="Not stored, only used for authentication"
        />

        <Text size="sm" color="dimmed">
          <strong>How to start wallet RPC:</strong>
          <br />
          1. Open terminal in your Salvium directory
          <br />
          2. Run:{" "}
          <code>
            ./salvium-wallet-rpc --wallet-file mywallet --rpc-bind-port 18082
            --daemon-address https://rpc.salvium.io:18081
          </code>
          <br />
          3. Connect using this configuration panel
        </Text>

        <Group position="apart" mt="md">
          <Button variant="subtle" onClick={handleClear}>
            Clear Config
          </Button>
          <Group>
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleTest} loading={testing}>
              Test & Save
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}

export default SalviumWalletRpcConfig;
