# **App Name**: Image Enhance AI

## Core Features:

- Image Upload and Consent: Allow users to upload an image with explicit consent for processing. Add a short modal explaining why consent is needed before upload, recording consent details.
- Automated Image Enhancement: Apply a series of automated image enhancement techniques (Grayscale, Low-pass, Gamma Correction, Histogram Equalization) to the uploaded image.  Keep the enhancement pipeline deterministic (OpenCV/scikit‑image) for reproducibility.
- Image Enhancement Explanations: Generate and display a concise explanation for each image enhancement method applied.
- Side-by-Side Comparison: Enable users to visually compare the original and enhanced images side-by-side.  Add keyboard navigation for image comparison (arrow keys to cycle through variants). Add a “highlight mode” where clicking one image enlarges it while keeping others visible in the grid.
- Image Download: Permit users to download the enhanced images they select.
- Privacy Control and Deletion: Provide users with the ability to request the immediate deletion of their uploaded image and processed results. Provide both “Delete immediately” and “Auto‑delete after 24h” options for flexibility.
- Method Relevance Tool: Use an auto-analysis tool (Gemini/Genkit) to determine and suggest which enhancement methods are most relevant to the uploaded image. Consider making it optional rather than automatic, so users can toggle “Suggest relevant methods” if they want guidance.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey professionalism and technical expertise, in keeping with the app's processing and machine learning pipeline.
- Background color: Light gray (#ECEFF1) to ensure a clean, neutral backdrop for the images and enhance visual clarity, complementing the need to inspect algorithm outputs
- Accent color: Purple (#7E57C2) to highlight interactive elements and guide the user through the enhancement options, allowing a visual focus on selectable image enhancements
- Body text: 'Inter' (sans-serif) for body text. Ensure contrast ratios meet accessibility standards.
- Headline text: 'Space Grotesk' (sans-serif) for headlines and section titles. Ensure contrast ratios meet accessibility standards.
- Use a set of modern, minimalist icons to represent each image enhancement method, creating clear associations between function and visual element. Pair icons with short text labels (e.g., “Gamma”) to avoid ambiguity for users unfamiliar with the methods.
- Employ a grid-based layout for presenting the original and enhanced images, promoting ease of comparison and visual hierarchy, thus catering to instructors to demonstrate image-processing concepts.
- Incorporate subtle transition animations for loading images and applying enhancement filters, providing a sense of fluidity and user engagement. Keep transitions under 300ms.