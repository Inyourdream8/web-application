import { useState, useEffect } from "react";

export interface UserProfileData {
  user_id?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  [key: string]: any;
}

const useUserProfile = (): {
  profile: UserProfileData | null;
  loading: boolean;
  error: string;
} => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        setError("No access token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(
            `Request failed: ${response.status} ${response.statusText}`
          );
        }

        const data: UserProfileData = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { profile, loading, error };
};

export default useUserProfile;
