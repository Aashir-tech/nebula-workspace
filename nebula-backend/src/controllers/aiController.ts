import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { ApiError } from '../middleware/errorHandler.js';
import { AIEnhanceRequest } from '../types/index.js';
import Task from '../models/Task.js';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const enhanceText = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    if (!ai) {
      throw new ApiError(503, 'AI service not configured. Please add GEMINI_API_KEY to .env');
    }

    const { text, type } = req.body as AIEnhanceRequest;

    if (!text || !type) {
      throw new ApiError(400, 'Text and type are required');
    }

    let prompt = '';
    const modelName = 'gemini-2.0-flash-exp';

    switch (type) {
      case 'PROFESSIONAL':
        prompt = `Rewrite the following task description to be professional, clear, and actionable: "${text}"`;
        break;
      case 'BREAK_DOWN':
        prompt = `Break down the following task into a checklist of up to 5 sub-tasks. Return only the checklist with dashes: "${text}"`;
        break;
      case 'SUMMARIZE':
        prompt = `Summarize the following text into a concise single sentence: "${text}"`;
        break;
      default:
        throw new ApiError(400, 'Invalid enhancement type');
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt
    });

    res.json({ result: response.text || text });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('AI enhance error:', error);
      res.status(500).json({ error: 'Failed to enhance text' });
    }
  }
};

export const generateInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    if (!ai) {
      throw new ApiError(503, 'AI service not configured');
    }

    const { workspaceId } = req.body;

    if (!workspaceId) {
      throw new ApiError(400, 'Workspace ID is required');
    }

    const tasks = await Task.find({ workspaceId }).limit(50);

    if (tasks.length === 0) {
      res.json({
        title: 'No Tasks Yet',
        content: 'Create some tasks to get AI-powered insights!',
        type: 'PULSE',
        score: 0
      });
      return;
    }

    const taskSummary = tasks.map(t => `- ${t.title} (${t.status})`).join('\n');
    const prompt = `Analyze these tasks and provide a productivity insight JSON. 
Format: { "title": "Short Title", "content": "One sentence analysis", "type": "PULSE" | "BURNOUT" | "VELOCITY", "score": 0-100 }
Tasks:
${taskSummary}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const insight = JSON.parse(response.text || '{}');
    res.json(insight);
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('AI insights error:', error);
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  }
};

export const generateStandup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    if (!ai) {
      throw new ApiError(503, 'AI service not configured');
    }

    const { workspaceId } = req.body;

    if (!workspaceId) {
      throw new ApiError(400, 'Workspace ID is required');
    }

    const completedTasks = await Task.find({ 
      workspaceId, 
      status: 'DONE' 
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    if (completedTasks.length === 0) {
      res.json({ summary: 'No completed tasks to summarize.' });
      return;
    }

    const taskList = completedTasks.map(t => t.title).join(', ');
    const prompt = `Generate a professional and concise daily standup summary based on these completed tasks: ${taskList}. Keep it under 50 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt
    });

    res.json({ summary: response.text || 'Could not generate summary.' });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('AI standup error:', error);
      res.status(500).json({ error: 'Failed to generate standup' });
    }
  }
};
