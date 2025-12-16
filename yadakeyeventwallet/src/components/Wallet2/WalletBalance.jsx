import { Card, Text, Button, Group, Tooltip, ActionIcon, Badge } from "@mantine/core";
import { IconInfoCircle, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import SalviumWalletRpcConfig from "./SalviumWalletRpcConfig";

const WalletBalance = ({
  balance,
  parsedData,
  log,
  onRefresh,
  onCopyAddress,
  onShowQR,
  styles,
  tokenSymbol,
  wrappedTokenSymbol,
  selectedBlockchain,
  sendWrapped,
  walletManager,
}) => {
  const [rpcConfigOpen, setRpcConfigOpen] = useState(false);
  
  // Check if this is Salvium and if wallet RPC is configured
  const isSalvium = selectedBlockchain.id === "sal";
  const hasWalletRpc = isSalvium && walletManager?.walletRpcUrl;
  return (
    <Card mt="md" withBorder radius="md" p="md" style={styles.card}>
      <Text size="lg" weight={500}>
        Wallet Balance
      </Text>
      {parsedData && (
        <Text size="sm" color="dimmed">
          Address: {parsedData.publicKeyHash}
        </Text>
      )}
      {balance ? (
        <>
          {selectedBlockchain.isBridge && (
            <Text size={25} lh={2} c="grey" id="unprotected">
              Unprotected Balance: {balance.original} {tokenSymbol || "Token"}{" "}
              <Tooltip label="The is the unwrapped/unprotected asset. This asset can be transferred with your private key without additional security checks.">
                <IconInfoCircle size={18} style={{ verticalAlign: "middle" }} />
              </Tooltip>
            </Text>
          )}
          {!selectedBlockchain.isBridge && (
            <>
              <Text size={25} lh={1} c="grey" id="unprotected">
                Balance: {balance.original || balance} {selectedBlockchain.symbol || "YDA"}
              </Text>
              {isSalvium && balance.unlocked && (
                <Text size="sm" color="dimmed">
                  Unlocked: {balance.unlocked} {selectedBlockchain.symbol}
                </Text>
              )}
              {isSalvium && balance.syncHeight && (
                <Text size="sm" color="blue">
                  Blockchain Height: {balance.syncHeight}
                </Text>
              )}
              {isSalvium && !hasWalletRpc && (
                <Badge color="yellow" variant="light" mt="xs">
                  Wallet RPC not configured
                </Badge>
              )}
              {isSalvium && hasWalletRpc && (
                <Badge color="green" variant="light" mt="xs">
                  Wallet RPC connected
                </Badge>
              )}
            </>
          )}
          {selectedBlockchain.isBridge && wrappedTokenSymbol && (
            <Text size={25} lh={1} c={selectedBlockchain.color} fw="bolder">
              Secured Balance: {balance.wrapped} Y{wrappedTokenSymbol}{" "}
              <Tooltip label="The is the wrapped/secured asset. This asset can NOT be transferred with your private key without additional security checks.">
                <IconInfoCircle size={18} style={{ verticalAlign: "middle" }} />
              </Tooltip>
            </Text>
          )}
        </>
      ) : (
        <Text size={25} lh={2} fw="bolder">
          Balance: 0.00{" "}
          {sendWrapped
            ? "Y" + (tokenSymbol || "Token")
            : selectedBlockchain.isBridge
            ? tokenSymbol || "Token"
            : selectedBlockchain.symbol || "YDA"}
        </Text>
      )}
      <Group mt="md">
        <Button onClick={onRefresh}>Refresh Balance</Button>
        <Button onClick={onCopyAddress}>Copy Address</Button>
        <Button onClick={onShowQR}>Show QR</Button>
        {isSalvium && (
          <Button
            onClick={() => setRpcConfigOpen(true)}
            leftSection={<IconSettings size={16} />}
            variant="light"
            color="violet"
          >
            Configure Wallet RPC
          </Button>
        )}
      </Group>
      
      {isSalvium && (
        <SalviumWalletRpcConfig
          opened={rpcConfigOpen}
          onClose={() => setRpcConfigOpen(false)}
          walletManager={walletManager}
        />
      )}
    </Card>
  );
};

export default WalletBalance;
