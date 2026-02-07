import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({apiKey:"AIzaSyA-8jT4KOuJ88bn2fI6sMTU1OJxBN7dIkA"
      // Add your API key here. For example:
      // apiKey: "YOUR_API_KEY"
      // or from an environment variable (recommended):
      // apiKey: process.env.GEMINI_API_KEY
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
