import { ofetch } from "ofetch";


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com"; // Replace with your API base URL
const apiClient = ofetch.create({
    baseURL: BASE_URL,
    credentials: "include", // Include credentials for cross-origin requests if needed
});
export default apiClient;