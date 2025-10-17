import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { fetchUserData, type UserData } from "../lib/api";

export function useUserData() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFetchedAddress, setLastFetchedAddress] = useState<string | null>(
    null
  );

  const refetch = async () => {
    if (!address || !isConnected) return;
    setLoading(true);
    try {
      const data = await fetchUserData(address);
      setUserData(data);
      setLastFetchedAddress(address);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && address !== lastFetchedAddress) {
      refetch();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (!isConnected || !address) {
      setUserData(null);
      setLastFetchedAddress(null);
    }
  }, [isConnected, address]);

  return { userData, loading, isConnected, address, refetch };
}
