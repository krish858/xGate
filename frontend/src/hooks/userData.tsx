import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { fetchUserData, type UserData } from "../lib/api";

export function useUserData() {
  const { address, isConnected } = useAccount();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isConnected || !address) return;
    setLoading(true);
    try {
      const data = await fetchUserData(address);
      setUserData(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { userData, loading, isConnected, address, refetch: fetchData };
}
