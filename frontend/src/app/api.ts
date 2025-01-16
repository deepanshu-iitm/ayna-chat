export const apiRequest = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    try {
      const baseUrl = "http://localhost:1337"; 
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