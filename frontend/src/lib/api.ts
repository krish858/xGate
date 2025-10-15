export interface ApiType {
  name: string;
  description: string;
  generatedEndpoint: string;
  amountGenerated: number;
}

export interface UserData {
  publicKey: string;
  restEndpoints: ApiType[];
  webSockets: ApiType[];
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchUserData(publicKey: string): Promise<UserData> {
  const res = await fetch(`${API_BASE}/api/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicKey }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user data");
  }

  const data = await res.json();
  console.log("Fetched user data:", data);
  return data.user;
}
