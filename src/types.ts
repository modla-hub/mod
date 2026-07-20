export interface Scene {
  sceneNumber: number;
  lyricLine: string;
  visualDescription: string;
  veoPrompt: string;
  cameraMovement: "pan_right" | "tilt_up" | "zoom_in" | "zoom_out" | "orbit" | "static" | "drone_flyover";
  duration: number; // usually 5
  primaryColor: string; // e.g. #FF5E62
  secondaryColor: string; // e.g. #FF9966
  particleType: "sparkles" | "snow" | "waves" | "bokeh" | "dust" | "starfield";
  generatedVideoUrl?: string; // used if we download/preview video or mock
  isGenerating?: boolean;
}

export interface StoryboardProject {
  title: string;
  genre: string;
  mood: string;
  lyricConcept: string;
  scenes: Scene[];
}
