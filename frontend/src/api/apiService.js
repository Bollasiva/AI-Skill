import axios from "axios";

// Axios instance
const API = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers["x-auth-token"] = token;
  return req;
});

// Handle request safely
const handleRequest = async (apiCall) => {
  try {
    const response = await apiCall;
    return response;
  } catch (error) {
    const errMsg =
      error?.response?.data?.content || // MentorBot-style responses
      error?.response?.data?.error ||
      error.message ||
      "Something went wrong!";
    console.error("API Error:", errMsg);
    console.log(genAI.listModels())
    throw new Error(errMsg); // always throw string
  }
};

// --- AUTH ---
export const login = (formData) =>
  handleRequest(API.post("/auth/login", formData));

export const register = (formData) =>
  handleRequest(API.post("/auth/register", formData));

export const getUserProfile = () =>
  handleRequest(API.get("/auth"));

// --- USER ---
export const updateUserSkills = (skills) =>
  handleRequest(API.put("/users/skills", { skills }));

// --- RECOMMENDATIONS ---
export const getMarketRecommendations = (userSkills, careerInterest) =>
  handleRequest(API.post("/recommendations/market", { skills: userSkills, careerInterest }));

export const getCollaborativeRecommendations = () =>
  handleRequest(API.get("/recommendations/collaborative"));

// --- CAREERS ---
export const getCareerPaths = () =>
  handleRequest(API.get("/careers"));

// --- DASHBOARD ---
export const getDashboardData = () =>
  handleRequest(API.get("/dashboard/trends"));

// --- MENTOR BOT (Gemini backend ready) ---
export const getMentorResponse = (message, history) =>
  handleRequest(API.post("/mentor/chat", { message, history }));
