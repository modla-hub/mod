import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Play,
  Pause,
  RefreshCw,
  Download,
  Video,
  Copy,
  Check,
  Info,
  Smartphone,
  Flame,
  Volume2,
  VolumeX,
  Share2,
  Youtube,
  PenTool,
  RotateCcw,
  Sliders,
  Sparkle,
  Tv,
  ListRestart,
  Film
} from "lucide-react";
import { Scene, StoryboardProject } from "./types";
import {
  startSynthesizer,
  stopSynthesizer,
  getAnalyserNode,
  initAudio,
} from "./utils/audio";

// Preset Prompt Suggestions
const PRESETS = [
  {
    topic: "ฝนตกในกรุงเทพตอนกลางคืน",
    genre: "Lofi Hip Hop",
    mood: "Lonely & Aesthetic (เหงาอบอุ่น)"
  },
  {
    topic: "รักแรกพบในสถานีรถไฟใต้ดินที่วุ่นวาย",
    genre: "Synthwave Retro",
    mood: "Energetic & Nostalgic (หวนคืนสู่อดีต)"
  },
  {
    topic: "ร้านกาแฟเหงาๆ ในบ่ายวันอาทิตย์ที่มีแสงแดดส่อง",
    genre: "Acoustic Pop",
    mood: "Relaxing & Soft (ผ่อนคลายเบาๆ)"
  },
  {
    topic: "สงครามหุ่นยนต์ในเมืองหลวงไซเบอร์พังก์ปี 2099",
    genre: "Cyberpunk Industrial",
    mood: "Epic & Action (ตื่นเต้นตระการตา)"
  },
  {
    topic: "สายลมทะเลพัดพาสัญญาใจของสองเรา",
    genre: "Uplifting Indie Pop",
    mood: "Romantic & Breezy (อบอวลความรัก)"
  }
];

// Beautiful Default Storyboard Project to prevent empty state and allow immediate testing
const DEFAULT_PROJECT: StoryboardProject = {
  title: "กรุงเทพฯ ราตรี (Bangkok Midnight Vibes)",
  genre: "Lofi Synthpop",
  mood: "Lonely & Aesthetic (เหงาและอบอุ่น)",
  lyricConcept: "ค่ำคืนที่ฝนพรำกลางกรุง แสงไฟสะท้อนบนถนนที่ว่างเปล่า ความทรงจำที่ยังติดอยู่ในห้วงเวลา",
  scenes: [
    {
      sceneNumber: 1,
      lyricLine: "ฝนโปรยปราย บนถนนสายยาวที่ไร้ผู้คน",
      visualDescription: "กล้องค่อยๆ เลื่อนผ่านป้ายรถเมล์กลางฝนตก ไฟสีส้มสลัวสะท้อนบนพื้นเปียกแฉะ",
      veoPrompt: "A highly detailed vertical 9:16 cinematic video, slow pan right. Orange city lights and glowing warm bus stop under pouring rain in Bangkok. Puddles reflecting warm neon street signs, depth of field, 4k resolution, lofi vaporwave aesthetic.",
      cameraMovement: "pan_right",
      duration: 5,
      primaryColor: "#1E1B4B",
      secondaryColor: "#F43F5E",
      particleType: "bokeh"
    },
    {
      sceneNumber: 2,
      lyricLine: "เงาของเธอที่เลือนหาย ในสายหมอกจาง",
      visualDescription: "เงาสะท้อนในกระจกหน้าร้านกาแฟที่กำลังปิดไฟ มีละอองไอน้ำเกาะรอบๆ",
      veoPrompt: "A 9:16 vertical shot, slow zoom in. Raindrops on a coffee shop window at night, foggy condensation on glass, blurry streetlights passing behind, warm lofi mood, dreamy cinematic photography, 1080p.",
      cameraMovement: "zoom_in",
      duration: 5,
      primaryColor: "#0F172A",
      secondaryColor: "#38BDF8",
      particleType: "dust"
    },
    {
      sceneNumber: 3,
      lyricLine: "มองไฟสีแดงส้ม ขยับเคลื่อนคล้อยไปแสนไกล",
      visualDescription: "วิวจากกระจกด้านข้างของรถไฟฟ้า BTS มองเห็นแสงไฟของทางด่วนยามค่ำคืนยาวเป็นสาย",
      veoPrompt: "Vertical 9:16 landscape, slow pan left. Window view of a Bangkok BTS skytrain moving fast at night, long exposure tail lights of highway traffic in background, neon pink and cyber blue glow, cyberpunk vibe, 4k.",
      cameraMovement: "pan_right",
      duration: 5,
      primaryColor: "#311042",
      secondaryColor: "#FF007F",
      particleType: "starfield"
    },
    {
      sceneNumber: 4,
      lyricLine: "เสียงเพลงแผ่วเบา คลอเคล้าเสียงลมหนาว",
      visualDescription: "หูฟังครอบหูวางข้างหน้าต่างตึกสูง มองออกไปเห็นตึกกรุงเทพยามค่ำคืนท่ามกลางลมพัดละอองฝน",
      veoPrompt: "Vertical 9:16 macro shot, slow tilt up. Retro wireless headphones sitting on a high-rise balcony table in Bangkok at midnight, soft ambient blue lights, skyscrapers glittering in background dust, cozy aesthetic, 1080p.",
      cameraMovement: "tilt_up",
      duration: 5,
      primaryColor: "#0B132B",
      secondaryColor: "#64DFDF",
      particleType: "sparkles"
    },
    {
      sceneNumber: 5,
      lyricLine: "และฉันยังคงรอเธอ อยู่ตรงที่เดิมไม่ไปไหน",
      visualDescription: "ทางม้าลายกลางแยกใหญ่ของกรุงเทพ มีแสงไฟรถวิ่งสลับไปมาส่องสว่างท่ามกลางความมืด",
      veoPrompt: "Vertical 9:16 cinematic shot, slow drone flyover. Top-down view of a neon crosswalk intersection in Bangkok, colorful lights, rainy night reflections on asphalt, high angle slow camera tracking, cinematic 4k.",
      cameraMovement: "drone_flyover",
      duration: 5,
      primaryColor: "#050B14",
      secondaryColor: "#FF9F1C",
      particleType: "snow"
    },
    {
      sceneNumber: 6,
      lyricLine: "เวลาเปลี่ยนผัน แต่ใจไม่เคยลืมเลือน",
      visualDescription: "นาฬิกาดิจิทัลเรืองแสงข้างเตียงเปลี่ยนเลขในห้องมืด มีเงาฝนตกระทบหน้าต่าง",
      veoPrompt: "Vertical 9:16 aesthetic bedroom close up, slow orbit. Glowing green retro digital clock showing 02:40 AM on nightstand, soft shadows of rain dripping on window blinds, moody nostalgia, cinematic color grading.",
      cameraMovement: "orbit",
      duration: 5,
      primaryColor: "#081C15",
      secondaryColor: "#52B788",
      particleType: "bokeh"
    },
    {
      sceneNumber: 7,
      lyricLine: "ส่งความรักลอยไป ในจักรวาลแสนไกล",
      visualDescription: "กล้องหงายขึ้นมองยอดตึกระฟ้าเสียดฟ้าเข้าสู่มวลก้อนเมฆและดวงดาวสลัว",
      veoPrompt: "Vertical 9:16 cinematic wide shot, slow tilt up. Looking straight up at giant modern skyscrapers in Bangkok touching a misty night sky with tiny glowing stars, cinematic volumetric fog, cyberpunk 4k.",
      cameraMovement: "tilt_up",
      duration: 5,
      primaryColor: "#160F29",
      secondaryColor: "#FFC857",
      particleType: "starfield"
    },
    {
      sceneNumber: 8,
      lyricLine: "สักวันสัญญา... เราจะกลับมาพบกัน",
      visualDescription: "แสงไฟหน้ารถค่อยๆ สว่างวาบขึ้น ท้องฟ้าเริ่มมีแสงอรุณรุ่งสลัวจับขอบขอบฟ้ากรุงเทพ",
      veoPrompt: "Vertical 9:16 portrait sunrise, slow zoom out. Bangkok skyline transition from deep night to golden orange dawn, soft sunrise clouds, silhouette of skyscrapers, hopeful mood, stunning cinematic photography, 4k.",
      cameraMovement: "zoom_out",
      duration: 5,
      primaryColor: "#1F1235",
      secondaryColor: "#FF7E5F",
      particleType: "waves"
    }
  ]
};

// Subtitle styling presets
const SUBTITLE_STYLES = [
  { id: "neon_bounce", name: "สะท้อนแสงเด้ง (TikTok style)" },
  { id: "cinematic", name: "ตัวเขียนหรูหรา (Cinematic)" },
  { id: "solid_box", name: "บล็อกข้อความทึบ (Bouncy Green)" },
  { id: "karaoke", name: "คาราโอเกะส้ม (Karaoke Highlight)" }
];

export default function App() {
  // Application state
  const [topic, setTopic] = useState("");
  const [genre, setGenre] = useState("Lofi Hip Hop");
  const [mood, setMood] = useState("Lonely & Aesthetic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [project, setProject] = useState<StoryboardProject>(DEFAULT_PROJECT);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Video player / state controllers
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // 0s to 40s
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [copiedSceneIndex, setCopiedSceneIndex] = useState<number | null>(null);
  const [subtitleStyle, setSubtitleStyle] = useState("neon_bounce");
  const [showSafeZones, setShowSafeZones] = useState(true);

  // Live simulation and recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportedFileUrl, setExportedFileUrl] = useState<string | null>(null);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const particlesRef = useRef<any[]>([]);

  // Sound spectrum data helper state
  const [spectrumBars, setSpectrumBars] = useState<number[]>(Array(16).fill(10));

  // Load preset helper
  const handleLoadPreset = (preset: typeof PRESETS[0]) => {
    setTopic(preset.topic);
    setGenre(preset.genre);
    setMood(preset.mood);
  };

  // Generate Storyboard API Call
  const handleGenerateStoryboard = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/storyboard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, genre, mood }),
      });
      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการประมวลผลสตอรี่บอร์ด");
      }
      const data = await response.json();
      setProject(data);
      setActiveSceneIndex(0);
      setCurrentTime(0);
      setIsPlayingVideo(false);
      stopSynthesizer();
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถติดต่อ Gemini ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsGenerating(false);
    }
  };

  // Synchronize playing position with scene cards index
  useEffect(() => {
    const sceneIndex = Math.floor(currentTime / 5);
    if (sceneIndex >= 0 && sceneIndex < 8 && sceneIndex !== activeSceneIndex) {
      setActiveSceneIndex(sceneIndex);
    }
  }, [currentTime, activeSceneIndex]);

  // Handle Play/Pause
  const togglePlayVideo = () => {
    if (isPlayingVideo) {
      setIsPlayingVideo(false);
      stopSynthesizer();
    } else {
      setIsPlayingVideo(true);
      initAudio();
      if (!isAudioMuted) {
        startSynthesizer(project.genre);
      }
    }
  };

  // Video Time/Timeline Loop
  useEffect(() => {
    if (isPlayingVideo) {
      const intervalMs = 33; // ~30 FPS timer
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const nextTime = prev + intervalMs / 1000;
          if (nextTime >= 40) {
            // End of clip
            setIsPlayingVideo(false);
            stopSynthesizer();
            return 0;
          }
          return nextTime;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlayingVideo, project]);

  // Synchronize synthesizer mute state
  useEffect(() => {
    if (isPlayingVideo) {
      if (isAudioMuted) {
        stopSynthesizer();
      } else {
        startSynthesizer(project.genre);
      }
    }
  }, [isAudioMuted]);

  // Handle scene timeline seek
  const handleSeekTimeline = (time: number) => {
    setCurrentTime(time);
    setActiveSceneIndex(Math.floor(time / 5));
  };

  // Copy Prompt to Clipboard
  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSceneIndex(index);
    setTimeout(() => setCopiedSceneIndex(null), 2000);
  };

  // Procedural Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high resolution internally but scale via CSS for perfect pixels
    canvas.width = 540;
    canvas.height = 960;

    let localParticles = particlesRef.current;
    if (localParticles.length === 0) {
      // Seed particles
      for (let i = 0; i < 120; i++) {
        localParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 5 + 1,
          speedY: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 1.5,
          angle: Math.random() * Math.PI * 2,
          omega: (Math.random() - 0.5) * 0.05,
          alpha: Math.random() * 0.5 + 0.5,
          color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`
        });
      }
      particlesRef.current = localParticles;
    }

    let beatCounter = 0;

    const render = () => {
      beatCounter += 0.05;
      const t = currentTime;
      const sceneIndex = Math.min(Math.floor(t / 5), 7);
      const sceneProgress = (t % 5) / 5;
      const currentScene = project.scenes[sceneIndex] || DEFAULT_PROJECT.scenes[0];

      // Audio analysis logic
      const analyser = getAnalyserNode();
      const frequencies = new Uint8Array(16);
      if (analyser && isPlayingVideo && !isAudioMuted) {
        analyser.getByteFrequencyData(frequencies);
        const nextBars = Array.from(frequencies).map((val) => Math.max(10, val / 4));
        setSpectrumBars(nextBars);
      } else {
        // Fallback pulsing if no real-time audio
        const simulatedFreqs = Array(16).fill(0).map((_, i) => {
          return 10 + Math.abs(Math.sin(beatCounter * 1.2 + i * 0.5)) * (isPlayingVideo ? 40 : 12);
        });
        setSpectrumBars(simulatedFreqs);
      }

      // Compute average volume for pulsating visual elements
      const currentVolume = spectrumBars.reduce((a, b) => a + b, 0) / 16;
      const pulseScale = 1.0 + (currentVolume / 140) * 0.25;

      // 1. Draw Background Gradient
      const primaryColor = currentScene.primaryColor;
      const secondaryColor = currentScene.secondaryColor;

      // Render Camera movement backdrop
      ctx.save();
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        100 * pulseScale,
        canvas.width / 2,
        canvas.height / 2,
        canvas.height * 0.8
      );
      grad.addColorStop(0, secondaryColor + "BB");
      grad.addColorStop(0.5, primaryColor + "EE");
      grad.addColorStop(1, "#020205");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply camera transitions on coordinates
      const movement = currentScene.cameraMovement;
      ctx.translate(canvas.width / 2, canvas.height / 2);

      if (movement === "pan_right") {
        ctx.translate((sceneProgress - 0.5) * -120, 0);
      } else if (movement === "tilt_up") {
        ctx.translate(0, (sceneProgress - 0.5) * -120);
      } else if (movement === "zoom_in") {
        const zoom = 1.0 + sceneProgress * 0.28;
        ctx.scale(zoom, zoom);
      } else if (movement === "zoom_out") {
        const zoom = 1.28 - sceneProgress * 0.28;
        ctx.scale(zoom, zoom);
      } else if (movement === "orbit") {
        ctx.rotate(sceneProgress * Math.PI * 0.12);
      } else if (movement === "drone_flyover") {
        ctx.translate(0, (sceneProgress - 0.5) * -80);
        ctx.scale(1.0 + sceneProgress * 0.08, 1.0 + sceneProgress * 0.08);
      }

      // 2. Draw Theme Procedural Base Mesh
      ctx.shadowBlur = 30;
      ctx.shadowColor = secondaryColor;

      const pType = currentScene.particleType;

      // We draw beautiful procedural symbols based on scene mood
      if (currentScene.sceneNumber % 3 === 1) {
        // Neon Cyberpunk Cyber Ring or Portal
        ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -40, 110 * pulseScale, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing ring
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(0, -40, 90 * pulseScale, beatCounter * 0.5, beatCounter * 0.5 + Math.PI * 1.5);
        ctx.stroke();

        // Core light orb
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, -40, 30 * pulseScale, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentScene.sceneNumber % 3 === 2) {
        // Glowing Neon Mountains / Waves Grid
        ctx.lineWidth = 3;
        ctx.strokeStyle = secondaryColor;
        ctx.beginPath();
        for (let x = -canvas.width / 2; x <= canvas.width / 2; x += 15) {
          const y = Math.sin(x * 0.015 + beatCounter) * 35 * pulseScale + Math.cos(x * 0.005) * 15 + 100;
          if (x === -canvas.width / 2) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Second layer
        ctx.strokeStyle = primaryColor;
        ctx.beginPath();
        for (let x = -canvas.width / 2; x <= canvas.width / 2; x += 15) {
          const y = Math.cos(x * 0.012 - beatCounter * 0.8) * 45 * pulseScale + 140;
          if (x === -canvas.width / 2) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      } else {
        // Infinite Geometric Star tunnel
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        for (let i = 1; i <= 4; i++) {
          const side = 60 * i * pulseScale;
          ctx.strokeStyle = i % 2 === 0 ? secondaryColor : primaryColor;
          ctx.strokeRect(-side / 2, -side / 2 - 40, side, side);
        }
      }

      ctx.restore();
      ctx.shadowBlur = 0;

      // 3. Update & Draw Particles (Always relative to camera frame bounds)
      localParticles.forEach((p) => {
        // Update positions based on type
        if (pType === "snow") {
          p.y += p.speedY * 1.5;
          p.x += Math.sin(beatCounter + p.y * 0.01) * 0.5;
          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          // Draw snow flake
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (pType === "sparkles") {
          p.y -= p.speedY * 1.2;
          p.angle += p.omega;
          p.x += Math.cos(p.angle) * 0.8;
          if (p.y < 0) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
          // Draw star sparkle
          ctx.fillStyle = secondaryColor;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            ctx.lineTo(0, -p.size * 2);
            ctx.lineTo(p.size / 2, -p.size / 2);
            ctx.rotate(Math.PI / 2);
          }
          ctx.fill();
          ctx.restore();
        } 
        else if (pType === "bokeh") {
          p.y -= p.speedY * 0.5;
          p.x += p.speedX * 0.3;
          if (p.y < -50) p.y = canvas.height + 50;
          if (p.x < -50) p.x = canvas.width + 50;
          if (p.x > canvas.width + 50) p.x = -50;

          // Soft circle
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 6 * pulseScale, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (pType === "starfield") {
          // Travel effect
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          p.angle += 0.01;
          const distFromCenter = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
          const factor = 1.05 + (currentVolume / 200) * 0.05;
          p.x = cx + (p.x - cx) * factor;
          p.y = cy + (p.y - cy) * factor;

          if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
            const angle = Math.random() * Math.PI * 2;
            p.x = cx + Math.cos(angle) * 20;
            p.y = cy + Math.sin(angle) * 20;
          }

          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (pType === "waves") {
          // Flowing energy waves lines
          p.angle += p.omega;
          p.x += 1.5;
          p.y = canvas.height * 0.65 + Math.sin(p.x * 0.01 + beatCounter) * 100 * Math.sin(p.angle);
          if (p.x > canvas.width) {
            p.x = 0;
            p.y = Math.random() * canvas.height;
          }

          ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } 
        else {
          // Dust floating randomly
          p.x += Math.sin(beatCounter + p.y * 0.02) * 0.4;
          p.y += p.speedY * 0.4;
          if (p.y > canvas.height) p.y = -10;

          ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Draw Subtitles directly onto the canvas for video capture!
      const currentLyrics = currentScene.lyricLine || "...";
      ctx.textAlign = "center";

      if (subtitleStyle === "neon_bounce") {
        // Yellow, Bouncy, Thick Black Stroke
        ctx.font = "bold 26px 'Inter', sans-serif";
        const textY = canvas.height * 0.82 + Math.sin(beatCounter * 2) * 8;

        // Draw shadow/outline
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 8;
        ctx.strokeText(currentLyrics, canvas.width / 2, textY);

        // Core text
        ctx.fillStyle = "#FACC15"; // Tailwind yellow-400
        ctx.fillText(currentLyrics, canvas.width / 2, textY);
      } 
      else if (subtitleStyle === "cinematic") {
        // Clean elegant serif text, subtle fade
        ctx.font = "italic 22px 'Playfair Display', serif, sans-serif";
        const textY = canvas.height * 0.85;

        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(currentLyrics, canvas.width / 2, textY);
        ctx.shadowBlur = 0;
      } 
      else if (subtitleStyle === "solid_box") {
        // Bright green lime block with black text
        ctx.font = "bold 22px 'Inter', sans-serif";
        const textY = canvas.height * 0.83;
        const textWidth = ctx.measureText(currentLyrics).width;

        // Draw lime box background
        ctx.fillStyle = "#22C55E"; // Green
        ctx.fillRect(
          canvas.width / 2 - textWidth / 2 - 16,
          textY - 26,
          textWidth + 32,
          38
        );

        ctx.fillStyle = "#000000";
        ctx.fillText(currentLyrics, canvas.width / 2, textY + 2);
      } 
      else if (subtitleStyle === "karaoke") {
        // Karaoke Style highlight
        ctx.font = "bold 25px 'Inter', sans-serif";
        const textY = canvas.height * 0.84;

        // Draw backing outline
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.strokeText(currentLyrics, canvas.width / 2, textY);

        // Underlay: white
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(currentLyrics, canvas.width / 2, textY);

        // Overlay clipping region based on progress of active scene
        ctx.save();
        ctx.beginPath();
        const textWidth = ctx.measureText(currentLyrics).width;
        ctx.rect(
          canvas.width / 2 - textWidth / 2,
          textY - 30,
          textWidth * sceneProgress,
          40
        );
        ctx.clip();

        // Highlight layer: bright orange
        ctx.fillStyle = "#FF7E5F";
        ctx.fillText(currentLyrics, canvas.width / 2, textY);
        ctx.restore();
      }

      // Progress bar overlay (glowing aesthetic)
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(30, canvas.height * 0.94, canvas.width - 60, 6);

      ctx.fillStyle = secondaryColor;
      ctx.fillRect(
        30,
        canvas.height * 0.94,
        (canvas.width - 60) * (currentTime / 40),
        6
      );

      // Loop frame
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTime, project, subtitleStyle, isPlayingVideo, isAudioMuted]);

  // Combine & Export Video File using Browser MediaRecorder
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRecording(true);
    setRecordingProgress(0);
    setExportComplete(false);
    setExportedFileUrl(null);
    recordedChunksRef.current = [];

    // Reset playing state
    setIsPlayingVideo(false);
    setCurrentTime(0);
    stopSynthesizer();

    // Setup streams
    try {
      const canvasStream = canvas.captureStream(30); // 30 FPS video
      
      // Attempt to capture Web Audio API synth stream
      const audioCtxInstance = initAudio().audioCtx;
      const dest = audioCtxInstance.createMediaStreamDestination();
      
      // Wire up master node to destination so it gets recorded
      const analyser = getAnalyserNode();
      if (analyser) {
        analyser.connect(dest);
      }

      const combinedStream = new MediaStream();
      canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));
      dest.stream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));

      // Re-route output sound so user can hear it during recording
      analyser?.connect(audioCtxInstance.destination);

      let options = { mimeType: "video/webm;codecs=vp9,opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/mp4" };
      }

      const mediaRecorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const superBuffer = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(superBuffer);
        setExportedFileUrl(videoUrl);
        setExportComplete(true);
        setIsRecording(false);
        stopSynthesizer();
      };

      // Start recording
      mediaRecorder.start();
      
      // Start playback and synthesizer
      setIsPlayingVideo(true);
      startSynthesizer(project.genre);

      // Track progress loop
      const progressTimer = setInterval(() => {
        setCurrentTime((prev) => {
          const progressVal = Math.min(100, Math.floor((prev / 40) * 100));
          setRecordingProgress(progressVal);

          if (prev >= 40) {
            clearInterval(progressTimer);
            if (mediaRecorder.state !== "inactive") {
              mediaRecorder.stop();
            }
            setIsPlayingVideo(false);
            return 0;
          }
          return prev;
        });
      }, 33);

    } catch (e) {
      console.error("Recording initialization failed:", e);
      setIsRecording(false);
      alert("เบราว์เซอร์นี้ไม่รองรับระบบบันทึกภาพวิดีโอแบบเรียลไทม์ กรุณาลองใช้เบราว์เซอร์ Chrome หรือ Firefox");
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-gray-100 font-sans flex flex-col antialiased overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Cinematic Glowing Background Aura */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-rose-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-gray-800 bg-[#06060c]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-500 rounded-xl shadow-lg shadow-purple-500/20">
              <Film className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300">
                AI Song Video Storyboard Creator
              </h1>
              <p className="text-xs text-purple-400 font-medium">
                TikTok & Shorts 9:16 Visual Video Builder • Powered by Gemini 3.5
              </p>
            </div>
          </div>

          {/* Social Platforms Quick Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">ขนาดแนะนำ:</span>
            <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md font-mono flex items-center gap-1">
              <Youtube className="w-3.5 h-3.5" /> 9:16 Shorts
            </span>
            <span className="px-2 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-md font-mono flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> TikTok Ready
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Setup & Input Panel */}
        <section className="lg:col-span-4 bg-[#0a0a14] border border-gray-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5 self-start">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
            <PenTool className="w-5 h-5 text-purple-400" />
            <h2 className="text-md font-semibold text-white">ตั้งค่าหัวข้อและสไตล์เพลง</h2>
          </div>

          {/* Preset Chips */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400">ไอเดียตัวเลือกด่วน (Preset):</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadPreset(preset)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-purple-500 hover:bg-gray-800 transition text-gray-300 text-left"
                >
                  ✨ {preset.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Topic input */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>หัวข้อเพลง หรือเรื่องราวหลัก (ไทย/อังกฤษ):</span>
              <span className="text-[10px] text-purple-400">ระบุจินตนาการได้เต็มที่</span>
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ตัวอย่าง: คนเหงาจิบกาแฟกลางดึกมองดูเมืองกรุงเทพยามฝนพรำ หรือ ความรักที่สดใสในทุ่งดอกทานตะวันยามเช้า..."
              className="w-full h-24 text-sm px-3 py-2.5 bg-gray-950 border border-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none transition resize-none"
            />
          </div>

          {/* Genre & Mood Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">แนวเพลง (Genre):</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-gray-950 border border-gray-800 focus:border-purple-500 rounded-xl text-gray-300 focus:outline-none"
              >
                <option value="Lofi Hip Hop">Lofi Hip Hop ☕</option>
                <option value="Synthwave Retro">Synthwave Retro 🌃</option>
                <option value="Cinematic Orchestral">Cinematic 🎻</option>
                <option value="Aesthetic Pop">Bright Pop 🍭</option>
                <option value="Indie Acoustic">Indie Folk 🎸</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">อารมณ์วิดีโอ (Mood):</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-gray-950 border border-gray-800 focus:border-purple-500 rounded-xl text-gray-300 focus:outline-none"
              >
                <option value="Lonely & Dreamy">เหงาและเพ้อฝัน</option>
                <option value="Energetic Cyberpunk">ตื่นเต้นไซเบอร์พังก์</option>
                <option value="Cozy & Relaxing">อบอุ่นผ่อนคลาย</option>
                <option value="Romantic Epic">โรแมนติกอลังการ</option>
                <option value="Dark Nostalgia">ดาร์กย้อนวันวาน</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGenerateStoryboard}
            disabled={isGenerating || !topic.trim()}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                <span>กำลังแต่งเพลง & วางฉาก 8 ซีน...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                <span>เขียนสตอรี่บอร์ด 8 ฉากด้วย Gemini</span>
              </>
            )}
          </button>

          {/* Custom Controls for preview Player */}
          <div className="mt-2 border-t border-gray-800 pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-gray-300">สไตล์ซับไตเติล (Subtitles Style)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {SUBTITLE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSubtitleStyle(style.id)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition ${
                    subtitleStyle === style.id
                      ? "bg-purple-600/10 border-purple-500 text-purple-300"
                      : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-gray-400">เปิดเส้นขอบกรอบปลอดภัย (TikTok UI Safe Zone)</span>
              <button
                onClick={() => setShowSafeZones(!showSafeZones)}
                className={`px-3 py-1 rounded-md text-[10px] font-mono border transition ${
                  showSafeZones
                    ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                    : "bg-gray-900 border-gray-800 text-gray-500"
                }`}
              >
                {showSafeZones ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="bg-gray-950/60 rounded-xl p-3 border border-gray-800/80 text-[11px] text-gray-400 leading-relaxed">
            <div className="flex items-center gap-1.5 text-purple-400 font-medium mb-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>เกี่ยวกับกระบวนการ Veo 9:16</span>
            </div>
            <ul className="space-y-1 list-disc pl-3.5 text-gray-400">
              <li>สตอรี่บอร์ด 8 ฉาก แบ่งเวลาซีนละ 5 วินาที รวมความยาว 40 วินาที</li>
              <li>พร้อมเขียนวีดีโอพร้อมท์ Veo ด้วยไวยากรณ์ขั้นสูง (English)</li>
              <li>รวมเป็นคลิป 9:16 ความละเอียดสูงพร้อมลง Youtube Shorts/TikTok</li>
            </ul>
          </div>
        </section>

        {/* Center/Right Content Area (Grid span 8) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Middle: 9:16 Preview Player Phone Mockup (4 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4 items-center justify-center">
            
            {/* Phone Frame */}
            <div className="relative w-full max-w-[280px] sm:max-w-[300px] aspect-[9/16] bg-black rounded-[42px] p-2.5 shadow-[0_0_50px_rgba(147,51,234,0.15)] border-4 border-gray-800/80 ring-1 ring-white/5 overflow-hidden flex flex-col">
              
              {/* Speaker Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-28 bg-black rounded-b-2xl z-30 flex items-center justify-center">
                <div className="w-10 h-1 bg-gray-800 rounded-full" />
              </div>

              {/* TikTok Safe Zone Markers Overlays */}
              {showSafeZones && (
                <div className="absolute inset-0 pointer-events-none z-20 text-[10px]">
                  {/* TikTok interactions simulation on right side */}
                  <div className="absolute right-2 bottom-20 flex flex-col items-center gap-3 text-white/70">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/20 flex items-center justify-center mb-0.5 text-[8px]">👤</div>
                      <span className="scale-75">1.2K</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-0.5">❤️</div>
                      <span className="scale-75">450</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/20 flex items-center justify-center mb-0.5">💬</div>
                      <span className="scale-75">32</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/20 flex items-center justify-center mb-0.5">➡️</div>
                      <span className="scale-75">แชร์</span>
                    </div>
                  </div>

                  {/* Left Bottom Channel Tag */}
                  <div className="absolute left-4 bottom-8 max-w-[70%] text-white/60">
                    <p className="font-bold">@AISongVideo</p>
                    <p className="truncate text-[8px] opacity-80">{project.title} • {project.genre}</p>
                  </div>

                  {/* Top Feed tabs */}
                  <div className="absolute top-6 left-0 right-0 flex justify-center gap-4 text-white/50 font-bold scale-90">
                    <span className="opacity-60">Following</span>
                    <span className="text-white border-b-2 border-white pb-1">For You</span>
                  </div>
                </div>
              )}

              {/* Procedural Canvas Video Player */}
              <div className="relative flex-1 w-full h-full bg-gray-950 rounded-[32px] overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover rounded-[32px]"
                />

                {/* Simulated Scene Watermark */}
                <div className="absolute top-14 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md text-[9px] text-teal-400 font-mono z-10">
                  SCENE 0{activeSceneIndex + 1} / 08 • {project.scenes[activeSceneIndex]?.cameraMovement.toUpperCase()}
                </div>

                {/* Progress bar line right on the bottom edge */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${(currentTime / 40) * 100}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Simulated Live Audio Spectrum Lines */}
            <div className="w-full max-w-[280px] bg-[#0a0a14] border border-gray-800/60 p-3 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>สเปกตรัมเพลง AI Synth (40s Loop)</span>
                </span>
                <span className="text-gray-500 text-[10px]">{Math.floor(currentTime)}s / 40s</span>
              </div>
              <div className="h-10 flex items-end justify-center gap-1.5 pt-1">
                {spectrumBars.map((bar, idx) => (
                  <div
                    key={idx}
                    className="w-2.5 bg-gradient-to-t from-purple-600 via-pink-500 to-amber-400 rounded-t-md transition-all duration-30.000ms"
                    style={{ height: `${bar}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Player Controls Panel */}
            <div className="w-full flex items-center justify-center gap-3">
              <button
                onClick={() => handleSeekTimeline(0)}
                className="p-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition"
                title="ย้อนกลับไปเริ่มต้น"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlayVideo}
                className={`p-4 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                  isPlayingVideo
                    ? "bg-rose-600 shadow-rose-600/10 text-white"
                    : "bg-purple-600 shadow-purple-600/10 text-white"
                }`}
              >
                {isPlayingVideo ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                )}
              </button>

              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`p-2.5 rounded-xl border transition ${
                  isAudioMuted
                    ? "bg-rose-950/40 border-rose-900 text-rose-400"
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                }`}
                title={isAudioMuted ? "เปิดเสียงสังเคราะห์" : "ปิดเสียงชั่วคราว"}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Video Export Feature Trigger */}
            <div className="w-full max-w-[280px]">
              <button
                onClick={handleExportVideo}
                disabled={isRecording}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#020205] font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 text-sm"
              >
                <Video className="w-4.5 h-4.5" />
                <span>รวมคลิปวิดีโอ 9:16 (เรนเดอร์ MP4)</span>
              </button>
            </div>

          </div>

          {/* Right: Project Overview & Storyboard Grid (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-5">
            
            {/* Song Meta Header Card */}
            <div className="bg-[#0a0a14] border border-gray-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-purple-900/30 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                  {project.genre}
                </span>
                <span className="text-[10px] bg-rose-900/30 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                  {project.mood}
                </span>
              </div>
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                  🎵 {project.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 italic">
                  &ldquo;{project.lyricConcept}&rdquo;
                </p>
              </div>
            </div>

            {/* Storyboard 8-Scene List */}
            <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1.5 custom-scrollbar">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-gray-400">ผังเหตุการณ์สตอรี่บอร์ด 8 ซีน (Timeline)</span>
                <span className="text-[10px] text-gray-500">คลิกการ์ดเพื่อนำไปเล่นในเครื่องเล่นพรีวิว</span>
              </div>

              {project.scenes.map((scene, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSeekTimeline(idx * 5)}
                  className={`border rounded-xl p-3.5 text-left cursor-pointer transition flex flex-col gap-2.5 relative ${
                    activeSceneIndex === idx
                      ? "bg-purple-950/20 border-purple-500 shadow-lg shadow-purple-500/5"
                      : "bg-[#06060c] border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {/* Badge & Meta Info */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 inline-flex items-center justify-center font-mono text-xs border border-purple-500/20">
                        {scene.sceneNumber}
                      </span>
                      <span>ฉากที่ {scene.sceneNumber} • วินาทีที่ {idx * 5} - {(idx + 1) * 5}s</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-900 border border-gray-800 text-gray-300 rounded font-mono">
                        🎥 {scene.cameraMovement.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/10"
                        style={{ backgroundColor: scene.primaryColor }}
                        title="โทนสีอารมณ์ฉาก"
                      />
                    </div>
                  </div>

                  {/* Lyric & Action */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-amber-300">
                      🎤 เสียงร้อง/เนื้อหาซับ: &ldquo;{scene.lyricLine}&rdquo;
                    </p>
                    <p className="text-[11px] text-gray-300">
                      🎬 เหตุการณ์ภาพ: <span className="text-gray-400">{scene.visualDescription}</span>
                    </p>
                  </div>

                  {/* Veo Prompt container */}
                  <div className="bg-gray-950 p-2 rounded-lg border border-gray-900 flex flex-col gap-1 mt-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                        <Sparkle className="w-3 h-3 text-amber-400" />
                        <span>พร้อมท์ภาพวิดีโอ Veo 3.1:</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPrompt(scene.veoPrompt, idx);
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        {copiedSceneIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">คัดลอกแล้ว!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>คัดลอกพร้อมท์</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono italic leading-relaxed break-words bg-black/40 p-1.5 rounded border border-gray-900/60 select-all">
                      {scene.veoPrompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </main>

      {/* Render/Export Progress Overlay */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <div className="bg-[#0b0b14] border border-gray-800 rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center gap-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
              
              <div className="p-4 bg-purple-900/10 rounded-full border border-purple-500/20 text-purple-400 animate-bounce">
                <Video className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">กำลังเรนเดอร์และสังเคราะห์วิดีโอ 9:16</h3>
                <p className="text-xs text-gray-400 mt-1.5">
                  โปรแกรมกำลังเล่นและแปลงซีนอนิเมชันรวมถึงบีบอัดเสียงดนตรีเข้าด้วยกัน...
                </p>
              </div>

              {/* Progress visualizer */}
              <div className="w-full space-y-2 mt-2">
                <div className="h-2.5 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${recordingProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-purple-400">กระบวนการ: บันทึกเรียลไทม์</span>
                  <span className="text-white font-bold">{recordingProgress}%</span>
                </div>
              </div>

              {/* Status text */}
              <div className="text-[11px] text-gray-500 space-y-1">
                <p>⚠️ กรุณาอย่าปิดแท็บนี้ระหว่างการเรนเดอร์</p>
                <p>วิดีโอจะดาวน์โหลดเป็นไฟล์ .webm/mp4 อัตโนมัติเมื่อครบ 40 วินาที</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Complete Notification/Modal */}
      <AnimatePresence>
        {exportComplete && exportedFileUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#0b0b14] border border-gray-800 rounded-3xl p-6 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl relative">
              <div className="p-3.5 bg-green-950/50 rounded-full border border-green-500/30 text-green-400">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-md font-bold text-white">🎉 รวมวิดีโอ 9:16 สำเร็จแล้ว!</h3>
                <p className="text-xs text-gray-400 mt-1">
                  ไฟล์วิดีโอความยาว 40 วินาทีพร้อมนำไปใช้อัปโหลดแล้ว
                </p>
              </div>

              {/* Download links */}
              <div className="w-full flex flex-col gap-2 mt-2">
                <a
                  href={exportedFileUrl}
                  download={`${project.title.replace(/\s+/g, "_")}_916.webm`}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 px-4 rounded-xl transition text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดวิดีโอ (WebM/MP4)</span>
                </a>
                
                <button
                  onClick={() => setExportComplete(false)}
                  className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white py-2.5 px-4 rounded-xl transition text-xs"
                >
                  กลับสู่หน้าจัดการสตอรี่บอร์ด
                </button>
              </div>

              <div className="bg-gray-950 p-3 rounded-xl text-[10px] text-gray-400 text-left border border-gray-900 w-full mt-1.5">
                <p className="font-semibold text-purple-400 mb-1">💡 เคล็ดลับเพิ่มเติม:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>นำไปลง YouTube Shorts, TikTok, และ Instagram Reels ได้ทันที</li>
                  <li>ซับไตเติลและเสียงดนตรีสังเคราะห์ถูกฝังเข้าไปในตัวคลิปแล้ว</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#030307] py-6 px-4 text-center mt-auto">
        <p className="text-xs text-gray-600">
          © 2026 AI Song Video Storyboard Creator. Built with React, Tailwind CSS & Google Gemini 3.5.
        </p>
      </footer>
    </div>
  );
}
