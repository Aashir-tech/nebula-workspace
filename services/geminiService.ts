import { Task, TaskStatus } from "../types";
import { aiAPI } from './api';

export const enhanceTextWithGemini = async (text: string, type: 'PROFESSIONAL' | 'BREAK_DOWN' | 'SUMMARIZE'): Promise<string> => {
  try {
    const { data } = await aiAPI.enhanceText({ text, mode: type });
    return data.result;
  } catch (error: any) {
    console.error("AI enhance error:", error);
    return error.response?.data?.error || "AI enhancement failed. Please try again.";
  }
};

export const getDailyStandup = async (workspaceId: string, userId: string): Promise<string> => {
  try {
    const { data } = await aiAPI.generateStandup({ workspaceId, userId });
    return data.summary;
  } catch (error: any) {
    console.error("AI standup error:", error);
    return "Failed to generate daily standup.";
  }
};

export const generateInsights = async (workspaceId: string): Promise<any> => {
  try {
    const { data } = await aiAPI.generateInsights(workspaceId);
    return data;
  } catch (error: any) {
    console.error("AI insights error:", error);
    return { 
      title: "Insights Unavailable", 
      content: "Unable to generate AI insights at this time.", 
      type: "PULSE", 
      score: 0 
    };
  }
};