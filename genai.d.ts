declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(config: { apiKey: string | undefined });
    models: {
      generateContent(params: {
        model: string;
        contents: any;
        config?: any;
      }): Promise<{ text: string }>;
    };
  }
}