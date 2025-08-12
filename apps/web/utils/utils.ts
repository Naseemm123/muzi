import axios from 'axios';

export async function checkPremium(accessToken: string): Promise<boolean> {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Response from Spotify API:", response);

    const data = response.data;
    
    return data.product === "premium";

  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}