import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export default function App() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<string | null>(null);

  const wallet = wallets[0];

  useEffect(() => {
    async function fetchBalance() {
      try {
        if (!wallet) return; // <-- important

        const provider = await wallet.getEthereumProvider();
        const rawBalance = await provider.request({
          method: "eth_getBalance",
          params: [wallet.address, "latest"],
        });

        if (typeof rawBalance !== "string") return;

        const wei = BigInt(rawBalance);
        const eth = (Number(wei) / 1e18).toFixed(4);

        setBalance(eth);
      } catch (err) {
        console.error("Error fetching balance:", err);
        setBalance(null);
      }
    }

    fetchBalance();
  }, [wallet]);

  if (!ready) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Privy Wallet Connector</h1>

      {!authenticated ? (
        <button style={styles.button} onClick={login}>
          Connect Wallet
        </button>
      ) : !wallet ? (
        <p style={{ color: "white" }}>Loading wallet...</p>
      ) : (
        <div style={styles.card}>
          <p>
            <b>Address:</b> {wallet.address}
          </p>
          <p>
            <b>Balance:</b> {balance ? `${balance} ETH` : "Loading..."}
          </p>
          <button style={styles.logout} onClick={logout}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

const styles: any = {
  container: {
    fontFamily: "Inter, sans-serif",
    color: "white",
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    textAlign: "center",
  },
  title: {
    fontSize: "34px",
    marginBottom: "30px",
  },
  button: {
    padding: "14px 24px",
    fontSize: "16px",
    background: "#6366F1",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  logout: {
    marginTop: "20px",
    padding: "10px 18px",
    background: "#ef4444",
    border: "none",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
  },
  card: {
    background: "#1e293b",
    padding: "28px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "380px",
  },
};
