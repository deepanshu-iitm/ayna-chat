export const apiRequest = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    try {
      const baseUrl = "https://ayna-chat-1.onrender.com"; 
      const response = await fetch(`${baseUrl}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  };