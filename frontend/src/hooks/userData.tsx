import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { fetchUserData, type UserData } from "../lib/api";

export function useUserData() {
  const { address, isConnected } = useAccount();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      setLoading(true);
      fetchUserData(address)
        .then((data: any) => setUserData(data))
        .catch((err: any) => console.error("Error fetching user data:", err))
        .finally(() => setLoading(false));
    } else {
      setUserData(null);
    }
  }, [isConnected, address]);

  return { userData, loading, isConnected, address };
}
