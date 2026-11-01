import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StudentRaceSetup from "../components/raceGame/StudentRaceSetup.jsx";
import FullScreenRaceGame from "../components/raceGame/FullScreenRaceGame.jsx";
import { RacerCostumeSprite, getRacerPlacement } from "../components/raceGame/RaceCostumeSprites.jsx";
import {
  Sparkles,
  Trophy,
  Dices,
  RotateCw,
  Users,
  Crown,
  Play,
  Pause,
  RefreshCw,
  Volume2,
  VolumeX,
  CheckCircle2,
  X,
  Copy,
  Printer,
  FileSpreadsheet,
  Award,
  Flame,
  Shuffle,
  Timer,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  UserPlus,
  ArrowRightLeft,
  Sliders,
  Settings,
  Database,
  Check,
  ClipboardList,
  Maximize2,
  Minimize2,
  Square
} from "lucide-react";
import * as XLSX from "xlsx";
import { getAdminStudents, getAdminScoringOverview } from "../api/adminApi.js";
import { useSchool } from "../context/SchoolContext.jsx";
import {
  playTickSound,
  playCountdownBeep,
  playWhistleSound,
  playWinnerFanfare,
  playPistolBang,
  setSoundMuted,
  getSoundMuted
} from "../utils/classroomAudio.js";
import { triggerConfetti } from "../utils/confetti.js";

// Vibrant palettes for wheel slices with high contrast for 100+ students
const WHEEL_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#14B8A6", "#6366F1",
  "#84CC16", "#A855F7", "#0EA5E9", "#E11D48", "#D97706",
  "#10B981", "#6366F1", "#F43F5E", "#0284C7", "#D946EF",
  "#F59E0B", "#059669", "#4F46E5", "#DC2626", "#2563EB", "#7C3AED"
];

// 8 Sports & Cartoon Themes derived directly from online-stopwatch.com / classroom-timers image
const RACE_THEMES = [
  {
    id: "fancy",
    nameKh: "រ៉ូបសម្លៀកបំពាក់កំប្លែង (Fancy Dress Costumes)",
    icon: "🎭",
    category: "Cartoon & Fancy Timers",
    trackBg: "from-slate-800 via-indigo-950 to-slate-900 border-indigo-500/50",
    laneColor: "border-white/30",
    accentColor: "bg-indigo-500",
    character: "🎭",
    characterName: "តួអង្គកំប្លែងចម្រុះ"
  },
  {
    id: "running",
    nameKh: "រត់ប្រណាំងកីឡាដ្ឋាន (Running Timer)",
    icon: "🏃‍♂️",
    category: "Sports Themed Timers",
    trackBg: "from-amber-800 to-amber-950 border-amber-600/50",
    laneColor: "border-white/30",
    accentColor: "bg-red-500",
    character: "🏃‍♂️",
    characterName: "អ្នករត់ប្រណាំង"
  },
  {
    id: "turtle",
    nameKh: "ប្រណាំងអណ្តើកកំប្លែង (Fancy Dress Turtle - Bib 88)",
    icon: "🐢",
    category: "Sports Themed Timers",
    trackBg: "from-emerald-900 to-teal-950 border-emerald-600/50",
    laneColor: "border-emerald-500/30",
    accentColor: "bg-emerald-500",
    character: "🐢",
    characterName: "អណ្តើកពាក់ឈុតកំប្លែង"
  },
  {
    id: "sack",
    nameKh: "ប្រណាំងលោតបាវ (Sack Race Timer)",
    icon: "🥔",
    category: "Sports Day Themed Timers",
    trackBg: "from-yellow-900 via-amber-950 to-stone-900 border-amber-600/50",
    laneColor: "border-amber-400/30",
    accentColor: "bg-amber-600",
    character: "🦘",
    characterName: "កីឡាករលោតបាវ"
  },
  {
    id: "swimming",
    nameKh: "ប្រណាំងហែលទឹកអាងខៀវ (Swimming Timer)",
    icon: "🏊‍♂️",
    category: "Sports Themed Timers",
    trackBg: "from-cyan-900 via-blue-900 to-indigo-950 border-cyan-500/50",
    laneColor: "border-cyan-300/40",
    accentColor: "bg-cyan-500",
    character: "🏊‍♂️",
    characterName: "អ្នកហែលទឹក"
  },
  {
    id: "bmx",
    nameKh: "ប្រណាំងកង់ BMX (BMX Bike Timer)",
    icon: "🚴‍♂️",
    category: "Sports Themed Timers",
    trackBg: "from-slate-800 to-stone-900 border-slate-600/50",
    laneColor: "border-yellow-400/30",
    accentColor: "bg-indigo-500",
    character: "🚴‍♂️",
    characterName: "កីឡាករជិះកង់ BMX"
  },
  {
    id: "spacehopper",
    nameKh: "ប្រណាំងបាល់លោត (Space Hopper Race)",
    icon: "🔴",
    category: "Sports Day Themed Timers",
    trackBg: "from-orange-950 via-stone-900 to-slate-900 border-orange-500/50",
    laneColor: "border-orange-400/30",
    accentColor: "bg-orange-500",
    character: "🔴",
    characterName: "កីឡាករលោត Space Hopper"
  },
  {
    id: "claw",
    nameKh: "ម៉ាស៊ីនកៀបចាប់ឈ្មោះ (Crane Claw Picker)",
    icon: "🕹️",
    category: "Arcade Themed Timers",
    trackBg: "from-purple-950 via-slate-900 to-indigo-950 border-purple-500/50",
    laneColor: "border-purple-400/30",
    accentColor: "bg-purple-600",
    character: "🕹️",
    characterName: "ដៃកៀបម៉ាស៊ីន (Crane Claw)"
  },
  {
    id: "canoe",
    nameKh: "ប្រណាំងទូកកានូ (Canoe Race Timer)",
    icon: "🚣‍♂️",
    category: "Sports Themed Timers",
    trackBg: "from-sky-950 via-blue-900 to-teal-950 border-sky-500/50",
    laneColor: "border-sky-300/40",
    accentColor: "bg-sky-500",
    character: "🚣‍♂️",
    characterName: "កីឡាករចែវទូក"
  }
];

export default function ClassroomGamesPage({ defaultMode = "tabs", defaultTab = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { schoolInfo } = useSchool();

  const getResolvedTab = () => {
    if (location.pathname.includes("/wheel")) return "wheel";
    if (location.pathname.includes("/groups")) return "groups";
    if (location.pathname.includes("/race-game")) return "race";
    if (defaultTab) return defaultTab;
    const params = new URLSearchParams(location.search);
    const q = params.get("tab");
    if (q && ["race", "wheel", "groups"].includes(q)) return q;
    return defaultMode === "race-setup" ? "race" : "wheel";
  };

  const [activeTab, setActiveTab] = useState(getResolvedTab);
  const [viewMode, setViewMode] = useState(defaultMode === "race-setup" ? "setup" : "tabs");
  const [activeRaceSession, setActiveRaceSession] = useState(null);

  useEffect(() => {
    if (location.pathname.includes("/wheel")) {
      setActiveTab("wheel");
      setViewMode("tabs");
    } else if (location.pathname.includes("/groups")) {
      setActiveTab("groups");
      setViewMode("tabs");
    } else if (location.pathname.includes("/race-game")) {
      setActiveTab("race");
      setViewMode("tabs");
    } else if (location.pathname.includes("/picker")) {
      const params = new URLSearchParams(location.search);
      const q = params.get("tab");
      setActiveTab(q || defaultTab || "wheel");
      setViewMode("tabs");
    }
  }, [location.pathname, location.search, defaultTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "wheel") {
      navigate("/admin/wheel");
    } else if (tab === "groups") {
      navigate("/admin/groups");
    } else if (tab === "race") {
      navigate("/admin/race-game");
    }
  };

  // Data Source Management
  const [sheetStudents, setSheetStudents] = useState([]);
  const [customStudents, setCustomStudents] = useState([]);
  const [dataSourceMode, setDataSourceMode] = useState("sheet"); // "sheet" | "custom" | "merged"
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [isMuted, setIsMuted] = useState(getSoundMuted());

  // Manual Input / Roster Modal State
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [pasteInputText, setPasteInputText] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentGender, setNewStudentGender] = useState("ស្រី");
  const [newStudentId, setNewStudentId] = useState("");
  const [newStudentRoom, setNewStudentRoom] = useState("N");
  const [rosterNotice, setRosterNotice] = useState(null);

  // Wheel State
  const [wheelStudents, setWheelStudents] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [winnerRole, setWinnerRole] = useState("leader"); // "leader" | "qa" | "lucky"
  const [winnerHistory, setWinnerHistory] = useState([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState("normal"); // "fast" (3s), "normal" (5s), "slow" (8s)
  const wheelCanvasRef = useRef(null);

  // ==========================================
  // RACE & ONLINE-STOPWATCH STATE
  // ==========================================
  const [selectedTheme, setSelectedTheme] = useState(RACE_THEMES[0]);
  const [raceLaneCount, setRaceLaneCount] = useState(6); // 6 racers like reference screenshot!
  const [allStudentsMode, setAllStudentsMode] = useState("heats"); // "heats" (6 per round) | "marathon" (all together)
  const [currentHeatIndex, setCurrentHeatIndex] = useState(0);
  const [raceParticipants, setRaceParticipants] = useState([]);
  const [raceDuration, setRaceDuration] = useState(15); // seconds
  const [raceTimeLeft, setRaceTimeLeft] = useState(15);
  const [isRacing, setIsRacing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(null); // 3, 2, 1, "GO!"
  const [raceWinner, setRaceWinner] = useState(null);
  const [racePodium, setRacePodium] = useState(null); // { first, second, third, rankings }
  const [racePositions, setRacePositions] = useState([]); // Array of { id, progress: 0..100, speed }
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [addRacerModalOpen, setAddRacerModalOpen] = useState(false);
  const raceAnimRef = useRef(null);
  const raceStartTimeRef = useRef(0);
  const raceElapsedBeforePause = useRef(0);
  const raceContainerRef = useRef(null);
  const raceProfilesRef = useRef([]);
  const raceWinnerIdRef = useRef(null);
  const raceDomRefs = useRef([]);
  const lastSecondRef = useRef(null);
  const pendingPodiumRef = useRef(null);

  // Group Maker State
  const [groupCount, setGroupCount] = useState(4);
  const [balanceGender, setBalanceGender] = useState(true);
  const [groups, setGroups] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupModalForSpin, setGroupModalForSpin] = useState(null); // group for leader spin
  const [movingStudentInfo, setMovingStudentInfo] = useState(null); // { student, fromGroupId }
  const [addMemberToGroupId, setAddMemberToGroupId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // 1. Fetch Students from Google Sheet
  const fetchGoogleSheetStudents = async (forceRefresh = false) => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("mypintou_admin_token") || "MyPintou#Sec2026$X9z";
      // Fetch using pageSize 1000 so all 111 students are loaded
      const res = await getAdminStudents(token, {
        pageSize: 1000,
        refresh: forceRefresh ? "true" : "false"
      });

      if (res && res.success && res.data && Array.isArray(res.data.students) && res.data.students.length > 0) {
        setSheetStudents(res.data.students);
        setLastSyncTime(new Date());
      } else {
        // Fallback to scoring overview which has all students
        const fallbackRes = await getAdminScoringOverview(token, forceRefresh);
        if (fallbackRes && fallbackRes.success && fallbackRes.data && Array.isArray(fallbackRes.data.students)) {
          setSheetStudents(fallbackRes.data.students);
          setLastSyncTime(new Date());
        }
      }
    } catch (err) {
      console.warn("Failed to load Google Sheet students:", err);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleSheetStudents(false);
  }, []);

  // Compute active roster based on dataSourceMode and selectedRoom
  const activeStudents = useMemo(() => {
    let pool = [];
    if (dataSourceMode === "sheet") {
      pool = sheetStudents;
    } else if (dataSourceMode === "custom") {
      pool = customStudents;
    } else {
      // merged
      pool = [...sheetStudents, ...customStudents];
    }

    if (selectedRoom === "all") return pool;
    return pool.filter((s) => s.room === selectedRoom);
  }, [dataSourceMode, sheetStudents, customStudents, selectedRoom]);

  // Available Rooms from Google Sheet data
  const availableRooms = useMemo(() => {
    const rSet = new Set(sheetStudents.map((s) => s.room).filter(Boolean));
    return Array.from(rSet);
  }, [sheetStudents]);

  // Sync wheel and race participants when active pool changes
  useEffect(() => {
    if (activeStudents.length > 0) {
      setWheelStudents(activeStudents);
      setupRaceParticipants(raceLaneCount, activeStudents);
    }
  }, [activeStudents]);

  // Spacebar (Start/Pause) and Escape (Clear/Close) keyboard listener for classroom races
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab !== "race") return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (isRacing) {
          pauseRace();
        } else {
          startRace();
        }
      } else if (e.key === "Escape") {
        if (racePodium) {
          setRacePodium(null);
        } else if (isRacing || isPaused) {
          clearRace();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, isRacing, isPaused, racePodium]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
  };

  // ==========================================
  // MANUAL INPUT & ROSTER HANDLERS
  // ==========================================
  const handleBatchPaste = () => {
    if (!pasteInputText.trim()) return;

    const lines = pasteInputText
      .split(/[\n,;]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const generated = lines.map((name, idx) => ({
      studentId: `M-${Math.floor(1000 + Math.random() * 9000)}`,
      fullNameKh: name,
      fullNameEn: name,
      fullName: name,
      gender: idx % 2 === 0 ? "ស្រី" : "ប្រុស",
      room: selectedRoom === "all" ? "N" : selectedRoom,
      isCustom: true
    }));

    setCustomStudents((prev) => [...prev, ...generated]);
    setDataSourceMode("custom");
    setPasteInputText("");
    setRosterNotice(`បានបញ្ចូលឈ្មោះនិស្សិតចំនួន ${generated.length} នាក់ដោយជោគជ័យ!`);
    setTimeout(() => setRosterNotice(null), 3000);
  };

  const handleAddSingleStudent = (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newS = {
      studentId: newStudentId.trim() || `C-${Math.floor(1000 + Math.random() * 9000)}`,
      fullNameKh: newStudentName.trim(),
      fullNameEn: newStudentName.trim(),
      fullName: newStudentName.trim(),
      gender: newStudentGender,
      room: newStudentRoom || "N",
      isCustom: true
    };

    setCustomStudents((prev) => [newS, ...prev]);
    setNewStudentName("");
    setNewStudentId("");
    setRosterNotice(`បានបន្ថែម "${newS.fullNameKh}" ទៅក្នុងបញ្ជី!`);
    setTimeout(() => setRosterNotice(null), 3000);
  };

  const handleRemoveCustomStudent = (id) => {
    setCustomStudents((prev) => prev.filter((s) => s.studentId !== id));
  };

  const handleClearCustomRoster = () => {
    if (window.confirm("តើអ្នកប្រាកដជាចង់សម្អាតបញ្ជីបញ្ចូលដោយដៃទាំងអស់មែនទេ?")) {
      setCustomStudents([]);
      setDataSourceMode("sheet");
    }
  };

  // ==========================================
  // 1. WHEEL OF FORTUNE LOGIC (CANVAS)
  // ==========================================
  const displayWheelStudents = useMemo(() => {
    // All students can play the game spinner without any 36 limit!
    return wheelStudents;
  }, [wheelStudents]);

  // Real-time student pointed by the top flapper needle
  const pointedStudent = useMemo(() => {
    if (!displayWheelStudents || displayWheelStudents.length === 0) return null;
    const count = displayWheelStudents.length;
    const arcSize = (2 * Math.PI) / count;
    const normalizedRot = (wheelRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const pointerAngle = (1.5 * Math.PI - normalizedRot + 4 * Math.PI) % (2 * Math.PI);
    const index = Math.floor(pointerAngle / arcSize) % count;
    return displayWheelStudents[index];
  }, [wheelRotation, displayWheelStudents]);

  const drawWheel = () => {
    const canvas = wheelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 24;

    ctx.clearRect(0, 0, width, height);

    const list = displayWheelStudents;
    const count = list.length;
    if (count === 0) {
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 16px Kantumruy Pro, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("គ្មានទិន្នន័យនិស្សិតឡើយ", centerX, centerY);
      return;
    }

    const arcSize = (2 * Math.PI) / count;

    // Responsive font size & slice borders for 100+ students
    let fontSize = 13;
    if (count > 80) fontSize = 7.5;
    else if (count > 50) fontSize = 9;
    else if (count > 30) fontSize = 10.5;
    else if (count > 20) fontSize = 12;

    const sliceLineWidth = count > 80 ? 0.6 : count > 50 ? 1 : 1.5;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(wheelRotation);

    for (let i = 0; i < count; i++) {
      const angle = i * arcSize;
      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];

      // Draw slice
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arcSize);
      ctx.lineTo(0, 0);
      ctx.fill();

      // Border line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = sliceLineWidth;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      ctx.stroke();

      // Slice Text
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${fontSize}px Kantumruy Pro, sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      const textAngle = angle + arcSize / 2;
      ctx.rotate(textAngle);

      const name = list[i].fullNameKh || list[i].fullName || list[i].fullNameEn;
      const truncated = count > 80
        ? (name.length > 12 ? name.substring(0, 11) + "…" : name)
        : (name.length > 16 ? name.substring(0, 15) + "…" : name);

      // Stagger radial position if more than 50 students to avoid text collision
      const textRadius = count > 50
        ? ((i % 2 === 0) ? radius - 10 : radius - 30)
        : radius - 18;

      ctx.fillText(truncated, textRadius, 0);
      ctx.restore();
    }

    // Outer Glowing Ring
    ctx.beginPath();
    ctx.arc(0, 0, radius + 6, 0, 2 * Math.PI);
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Center Hub Chrome
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 36);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, "#cbd5e1");
    grad.addColorStop(1, "#1e293b");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#F59E0B";
    ctx.stroke();

    ctx.restore();
  };

  useEffect(() => {
    drawWheel();
  }, [wheelRotation, displayWheelStudents]);

  const spinWheel = () => {
    if (isSpinning || displayWheelStudents.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setShowWinnerModal(false);

    const fullSpins = spinSpeed === "fast" ? 6 : spinSpeed === "slow" ? 14 : 9;
    const duration = spinSpeed === "fast" ? 3200 : spinSpeed === "slow" ? 7500 : 5000;
    const randomOffset = Math.random() * (2 * Math.PI);
    const targetRotation = wheelRotation + fullSpins * (2 * Math.PI) + randomOffset;

    const startTime = performance.now();
    const initialRotation = wheelRotation;
    const arcSize = (2 * Math.PI) / displayWheelStudents.length;

    let lastSector = -1;
    let lastTickTime = 0;

    const animateSpin = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth cubic-ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentRot = initialRotation + (targetRotation - initialRotation) * easeOut;

      setWheelRotation(currentRot);

      // Flapper tick sound with speed throttling for 100+ students
      const normalizedRot = (currentRot % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSector = Math.floor(normalizedRot / arcSize);
      if (currentSector !== lastSector) {
        lastSector = currentSector;
        const timeSinceLast = now - lastTickTime;
        // Limit tick frequency to at least 26ms so 100+ slices make a crisp ratchet sound
        if (timeSinceLast >= 26) {
          playTickSound(520 + (progress * 180));
          lastTickTime = now;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);

        // Needle points at 3*PI/2 (top)
        const finalNormalized = (targetRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (1.5 * Math.PI - finalNormalized + 4 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(pointerAngle / arcSize) % displayWheelStudents.length;

        const chosenStudent = displayWheelStudents[winningIndex];
        setWinner(chosenStudent);
        setShowWinnerModal(true);

        playWinnerFanfare();
        triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);

        setWinnerHistory((prev) => [
          {
            student: chosenStudent,
            role: winnerRole,
            timestamp: new Date().toLocaleTimeString("km-KH")
          },
          ...prev.slice(0, 19)
        ]);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  const removeWinnerFromWheel = () => {
    if (!winner) return;
    setWheelStudents((prev) => prev.filter((s) => s.studentId !== winner.studentId));
    setShowWinnerModal(false);
  };

  // ==========================================
  // 2. SPORTS THEMED TIMERS & RACE ARENA
  // ==========================================
  const setupRaceParticipants = (
    mode = raceLaneCount,
    pool = activeStudents,
    heatIdx = currentHeatIndex,
    overrideAllMode = allStudentsMode
  ) => {
    if (pool.length === 0) return;

    let selected = [];
    if (mode === "all") {
      if (overrideAllMode === "marathon") {
        selected = [...pool];
      } else {
        // Tournament Heats mode: 6 racers per heat (matches Online-Stopwatch reference!)
        const heatSize = 6;
        const totalHeats = Math.max(1, Math.ceil(pool.length / heatSize));
        const validHeatIdx = Math.max(0, Math.min(totalHeats - 1, heatIdx));
        selected = pool.slice(validHeatIdx * heatSize, (validHeatIdx + 1) * heatSize);
        setCurrentHeatIndex(validHeatIdx);
      }
    } else {
      const count = Number(mode) || 6;
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      selected = shuffled.slice(0, count);
    }

    setRaceParticipants(selected);
    setRaceWinner(null);
    setRacePodium(null);
    setIsRacing(false);
    setIsPaused(false);
    setRaceTimeLeft(raceDuration);
    lastSecondRef.current = raceDuration;
    raceElapsedBeforePause.current = 0;
    setRacePositions(selected.map((s) => ({ id: s.studentId, progress: 0, speed: 1 })));
  };

  const handleAssignRacerToLane = (laneIndex, studentId) => {
    const found = activeStudents.find((s) => s.studentId === studentId);
    if (!found) return;

    setRaceParticipants((prev) => {
      const next = [...prev];
      next[laneIndex] = found;
      return next;
    });
  };

  const handleRemoveRacer = (studentId) => {
    setRaceParticipants((prev) => prev.filter((s) => s.studentId !== studentId));
    setRacePositions((prev) => prev.filter((p) => p.id !== studentId));
  };

  const handleAddSingleRacer = (student) => {
    if (raceParticipants.some((s) => s.studentId === student.studentId)) return;
    setRaceParticipants((prev) => [...prev, student]);
    setRacePositions((prev) => [...prev, { id: student.studentId, progress: 0, speed: 1 }]);
    setAddRacerModalOpen(false);
  };

  // Start or Resume Race
  const startRace = () => {
    if (isRacing || raceParticipants.length === 0) return;

    if (isPaused) {
      // Resume from pause
      setIsPaused(false);
      setIsRacing(true);
      runRaceAnimation(raceElapsedBeforePause.current);
      return;
    }

    setRaceWinner(null);
    setRacePodium(null);
    setRacePositions(raceParticipants.map((s) => ({ id: s.studentId, progress: 0, speed: 1 })));
    raceElapsedBeforePause.current = 0;

    // Countdown 3, 2, 1, GO!
    setCountdown(3);
    playCountdownBeep(false);

    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playCountdownBeep(false);
      } else if (count === 0) {
        setCountdown("GO!");
        playPistolBang();
        playWhistleSound();
      } else {
        clearInterval(timer);
        setCountdown(null);
        runRaceAnimation(0);
      }
    }, 900);
  };

  const pauseRace = () => {
    if (!isRacing) return;
    setIsRacing(false);
    setIsPaused(true);
    cancelAnimationFrame(raceAnimRef.current);
    if (raceProfilesRef.current.length > 0) {
      setRacePositions(
        raceProfilesRef.current.map((p) => ({
          id: p.id,
          progress: p.currentProgress || 0,
          speed: 1,
          isBoosting: false
        }))
      );
    }
  };

  const clearRace = () => {
    setIsRacing(false);
    setIsPaused(false);
    setCountdown(null);
    cancelAnimationFrame(raceAnimRef.current);
    setRaceTimeLeft(raceDuration);
    lastSecondRef.current = raceDuration;
    raceElapsedBeforePause.current = 0;
    setRaceWinner(null);
    setRacePodium(null);
    pendingPodiumRef.current = null;
    raceProfilesRef.current = [];
    raceWinnerIdRef.current = null;
    setRacePositions(raceParticipants.map((s) => ({ id: s.studentId, progress: 0, speed: 1, isBoosting: false })));
    raceDomRefs.current.forEach((el, idx) => {
      if (el) {
        const placement = getRacerPlacement(idx, raceParticipants.length, selectedTheme.id);
        el.style.left = `calc(${placement.startX}px)`;
      }
    });
  };

  const runRaceAnimation = (startOffsetMs = 0) => {
    setIsRacing(true);
    const durationMs = raceDuration * 1000;
    const baseTime = performance.now() - startOffsetMs;
    raceStartTimeRef.current = baseTime;

    // Initialize or retain deterministic profiles directly synchronized with the timer
    if (
      startOffsetMs === 0 ||
      !raceProfilesRef.current ||
      raceProfilesRef.current.length !== raceParticipants.length
    ) {
      const winnerIdx = Math.floor(Math.random() * raceParticipants.length);
      raceWinnerIdRef.current = raceParticipants[winnerIdx]?.studentId;

      const isLargeField = raceParticipants.length > 18;
      raceProfilesRef.current = raceParticipants.map((s, idx) => {
        const isChamp = idx === winnerIdx;
        const placement = getRacerPlacement(idx, raceParticipants.length, selectedTheme.id);
        // In large field (Marathon), disperse runners dynamically across the track (leaders, contenders, mid, trail)
        // so they naturally stream out like a real marathon, NOT a flat vertical wall!
        const largeFieldPace = idx < 6
          ? (93 + Math.random() * 5.5)
          : idx < 20
          ? (82 + Math.random() * 9.5)
          : idx < 50
          ? (68 + Math.random() * 12.0)
          : (48 + Math.random() * 18.0);
        const finishPace = isChamp ? 100 : isLargeField ? largeFieldPace : 91 + Math.random() * 7.5;
        const phase = Math.random() * Math.PI * 2;
        const surgeFrequency = 1.4 + Math.random() * 1.6;
        const surgeAmp = 3.2 + Math.random() * 4.0;
        const strideFreq = 4.0 + Math.random() * 2.0;

        return {
          id: s.studentId,
          isChamp,
          finishPace,
          phase,
          surgeFrequency,
          surgeAmp,
          strideFreq,
          startX: placement.startX,
          currentProgress: 0
        };
      });
    }

    let winnerCrownTriggered = false;
    let celebrationStartTime = null;

    const updateRace = (now) => {
      const elapsed = now - baseTime;
      raceElapsedBeforePause.current = elapsed;

      // Exact elapsed time ratio strictly between 0.0 and 1.0
      const timeRatio = Math.min(1, Math.max(0, elapsed / durationMs));

      // Throttle LCD seconds state to strictly once per second (prevents 60 FPS full re-render)
      const currentSec = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      if (currentSec !== lastSecondRef.current) {
        lastSecondRef.current = currentSec;
        setRaceTimeLeft(currentSec);
      }

      // Mid-race drama envelope: sin(timeRatio * PI) is 0 at start, peaks at 50%, returns to 0 at finish
      const midRaceDrama = Math.sin(timeRatio * Math.PI);

      // Direct GPU style updates on DOM elements (60 FPS silky smooth with ZERO lag)
      raceProfilesRef.current.forEach((profile, idx) => {
        const strideOffset = 0.3 * Math.sin(now * 0.005 * profile.strideFreq + profile.phase);
        const organicSurge =
          Math.sin(timeRatio * Math.PI * profile.surgeFrequency + profile.phase) *
          profile.surgeAmp *
          midRaceDrama;

        const baseProgress = timeRatio * profile.finishPace;
        let currentProgress = Math.max(0, baseProgress + organicSurge + strideOffset);

        if (timeRatio >= 1.0) {
          currentProgress = profile.isChamp ? 100 : Math.min(99, profile.finishPace);
        } else {
          currentProgress = Math.min(99.4, currentProgress);
        }

        profile.currentProgress = currentProgress;

        const el = raceDomRefs.current[idx];
        if (el) {
          const startX = profile.startX || 120;
          el.style.left = `calc(${startX}px + (100% - ${startX + 140}px) * (${currentProgress} / 100))`;
        }
      });

      // Crown winner when time reaches 0 (or timeRatio >= 1.0)
      if (timeRatio >= 1.0 && !winnerCrownTriggered) {
        winnerCrownTriggered = true;
        celebrationStartTime = now;

        // Commit final positions to state
        setRacePositions(
          raceProfilesRef.current.map((p) => ({
            id: p.id,
            progress: p.currentProgress,
            speed: 1,
            isBoosting: false
          }))
        );

        const first =
          raceParticipants.find((p) => p.studentId === raceWinnerIdRef.current) ||
          raceParticipants[0];

        const sorted = [...raceProfilesRef.current].sort((a, b) => b.currentProgress - a.currentProgress);
        const rankedParticipants = sorted
          .map((item, rIdx) => {
            const student = raceParticipants.find((p) => p.studentId === item.id);
            return student ? { ...student, rank: rIdx + 1, progress: item.currentProgress } : null;
          })
          .filter(Boolean);

        const second = rankedParticipants[1] || null;
        const third = rankedParticipants[2] || null;

        setRaceWinner(first);
        pendingPodiumRef.current = { first, second, third, rankings: rankedParticipants };

        playWinnerFanfare();
        triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
      }

      // Allow 3.5 seconds of finish celebration on the track at the finish line!
      if (winnerCrownTriggered) {
        if (now - celebrationStartTime >= 3500) {
          setIsRacing(false);
          setIsPaused(false);
          cancelAnimationFrame(raceAnimRef.current);
          if (pendingPodiumRef.current) {
            setRacePodium(pendingPodiumRef.current);
          }
          return;
        }
      }

      raceAnimRef.current = requestAnimationFrame(updateRace);
    };

    raceAnimRef.current = requestAnimationFrame(updateRace);
  };

  const toggleFullscreen = () => {
    if (!raceContainerRef.current) return;
    if (!document.fullscreenElement) {
      raceContainerRef.current.requestFullscreen().catch((err) => {
        console.warn("Fullscreen error", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  // Format digital LCD stopwatch string (e.g., 00:00:15)
  const formatDigitalTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `00:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ==========================================
  // 3. SMART GROUP MAKER & CUSTOMIZER
  // ==========================================
  const generateGroups = () => {
    if (activeStudents.length === 0) return;

    let pool = [...activeStudents];

    let generated = [];
    for (let i = 0; i < groupCount; i++) {
      generated.push({
        id: `group-${i + 1}`,
        name: `ក្រុមទី ${i + 1}`,
        leader: null,
        members: []
      });
    }

    if (balanceGender) {
      const females = pool.filter((s) => s.gender === "ស្រី" || s.gender === "Female" || s.gender === "F").sort(() => 0.5 - Math.random());
      const males = pool.filter((s) => s.gender !== "ស្រី" && s.gender !== "Female" && s.gender !== "F").sort(() => 0.5 - Math.random());

      let gIdx = 0;
      females.forEach((f) => {
        generated[gIdx % groupCount].members.push(f);
        gIdx++;
      });

      males.forEach((m) => {
        generated[gIdx % groupCount].members.push(m);
        gIdx++;
      });
    } else {
      pool.sort(() => 0.5 - Math.random());
      pool.forEach((s, idx) => {
        generated[idx % groupCount].members.push(s);
      });
    }

    setGroups(generated);
  };

  useEffect(() => {
    if (activeStudents.length > 0 && groups.length === 0) {
      generateGroups();
    }
  }, [activeStudents, groupCount, balanceGender]);

  // Group Customization Actions
  const handleAddNewGroup = () => {
    const newId = `group-${groups.length + 1}`;
    const newG = {
      id: newId,
      name: `ក្រុមទី ${groups.length + 1}`,
      leader: null,
      members: []
    };
    setGroups((prev) => [...prev, newG]);
    setGroupCount((c) => c + 1);
  };

  const handleClearGroups = () => {
    setGroups((prev) => prev.map((g) => ({ ...g, leader: null, members: [] })));
  };

  const handleDeleteGroup = (groupId) => {
    if (groups.length <= 1) {
      alert("ត្រូវមានក្រុមយ៉ាងហោចណាស់ ១!");
      return;
    }
    const toDelete = groups.find((g) => g.id === groupId);
    if (!toDelete) return;

    if (window.confirm(`តើអ្នកពិតជាចង់លុប "${toDelete.name}" ដែរឬទេ? សមាជិកនឹងត្រូវបែងចែកទៅក្រុមផ្សេង។`)) {
      const remainingGroups = groups.filter((g) => g.id !== groupId);
      const membersToRedistribute = toDelete.members;

      let idx = 0;
      membersToRedistribute.forEach((m) => {
        remainingGroups[idx % remainingGroups.length].members.push(m);
        idx++;
      });

      setGroups(remainingGroups);
      setGroupCount(remainingGroups.length);
    }
  };

  const handleRenameGroup = (groupId, newName) => {
    if (!newName.trim()) return;
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name: newName.trim() } : g))
    );
    setEditingGroupId(null);
  };

  const handleMoveStudent = (targetGroupId) => {
    if (!movingStudentInfo || !targetGroupId) return;
    const { student, fromGroupId } = movingStudentInfo;

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === fromGroupId) {
          return {
            ...g,
            leader: g.leader?.studentId === student.studentId ? null : g.leader,
            members: g.members.filter((m) => m.studentId !== student.studentId)
          };
        }
        if (g.id === targetGroupId) {
          return {
            ...g,
            members: [...g.members, student]
          };
        }
        return g;
      })
    );

    setMovingStudentInfo(null);
  };

  const handleRemoveMemberFromGroup = (groupId, studentId) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            leader: g.leader?.studentId === studentId ? null : g.leader,
            members: g.members.filter((m) => m.studentId !== studentId)
          };
        }
        return g;
      })
    );
  };

  const handleToggleLeader = (groupId, member) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const isCurrentlyLeader = g.leader?.studentId === member.studentId;
          return {
            ...g,
            leader: isCurrentlyLeader ? null : member
          };
        }
        return g;
      })
    );
  };

  // Spin specifically for a group's leader
  const spinForGroupLeader = (group) => {
    if (!group || group.members.length === 0) return;
    setGroupModalForSpin(group);

    // Fast 1.5s shuffle animation
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      playTickSound(650);
      if (tickCount > 12) {
        clearInterval(interval);
        const randomLeader = group.members[Math.floor(Math.random() * group.members.length)];

        setGroups((prev) =>
          prev.map((g) => (g.id === group.id ? { ...g, leader: randomLeader } : g))
        );

        playWinnerFanfare();
        triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
        setTimeout(() => setGroupModalForSpin(null), 1600);
      }
    }, 120);
  };

  const copyGroupsToClipboard = () => {
    let text = `📋 បញ្ជីបែងចែកក្រុមនិស្សិត (${schoolInfo?.universityNameKh || "MyPintou"})\n`;
    text += `ថ្នាក់/បន្ទប់៖ ${selectedRoom === "all" ? "គ្រប់បន្ទប់" : selectedRoom} • កាលបរិច្ឆេទ៖ ${new Date().toLocaleDateString("km-KH")}\n\n`;

    groups.forEach((g) => {
      text += `🌟 ${g.name} (${g.members.length} នាក់)\n`;
      if (g.leader) {
        text += `   👑 ប្រធានក្រុម៖ ${g.leader.fullNameKh || g.leader.fullName} (អត្តលេខ៖ ${g.leader.studentId})\n`;
      }
      g.members.forEach((m, i) => {
        const isL = g.leader?.studentId === m.studentId ? " [ប្រធាន]" : "";
        text += `   ${i + 1}. ${m.fullNameKh || m.fullName} (${m.gender || "ស្រី"}) - ID: ${m.studentId}${isL}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const exportGroupsToExcel = () => {
    const rows = [];
    groups.forEach((g) => {
      g.members.forEach((m, idx) => {
        rows.push({
          "ឈ្មោះក្រុម (Group)": g.name,
          "តួនាទី (Role)": g.leader?.studentId === m.studentId ? "👑 ប្រធានក្រុម" : "សមាជិក",
          "ល.រ": idx + 1,
          "អត្តលេខនិស្សិត": m.studentId,
          "គោត្តនាម-នាម": m.fullNameKh || m.fullName,
          "យេនឌ័រ": m.gender || "ស្រី",
          "បន្ទប់សិក្សា": m.room || selectedRoom || "N"
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "តារាងបែងចែកក្រុម");
    XLSX.writeFile(workbook, `បញ្ជីក្រុម_${selectedRoom}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 1. If Full-Screen Race Game is Active, occupy entire viewport (No dashboard sidebar!)
  if (activeRaceSession) {
    return (
      <FullScreenRaceGame
        participants={activeRaceSession.participants}
        durationSeconds={activeRaceSession.durationSeconds}
        theme={activeRaceSession.theme}
        roomName={activeRaceSession.roomName}
        onExitGame={() => setActiveRaceSession(null)}
        onChooseNewStudents={() => {
          setActiveRaceSession(null);
          setViewMode("tabs");
        }}
        onBackToDashboard={() => {
          setActiveRaceSession(null);
          setViewMode("tabs");
        }}
      />
    );
  }

  // 2. If Dedicated Setup Mode is active, render clean Khmer setup page
  if (viewMode === "setup") {
    return (
      <StudentRaceSetup
        students={sheetStudents}
        availableRooms={availableRooms}
        loading={loading}
        onRefreshData={() => fetchGoogleSheetStudents(true)}
        onStartRace={(sessionConfig) => {
          setActiveRaceSession(sessionConfig);
        }}
        onBackToDashboard={() => {
          setViewMode("tabs");
        }}
      />
    );
  }

  return (
    <div className="space-y-6 font-['Kantumruy_Pro'] pb-16">
      {/* ========================================================
          TOP HERO & CONTROL BAR (ONLINE-STOPWATCH CLASSROOM SUITE)
      ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-[#0B0F19] p-6 lg:p-8 border-4 border-indigo-500/40 shadow-[0_12px_45px_rgba(0,0,0,0.5)] text-white">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Online-Stopwatch Classroom Timers & Sports Suite
              </span>

              {/* Live Cloud Database Status Badge */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Database className="w-3.5 h-3.5" />
                <span>Cloud Database Live៖ {sheetStudents.length} នាក់</span>
              </div>

              {customStudents.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  + បញ្ចូលដោយដៃ៖ {customStudents.length} នាក់
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-300">
              ⏱️ ហ្គេមប្រណាំង & កង់បង្វិលរើសឈ្មោះ (Classroom Timers)
            </h1>
            <p className="text-sm text-slate-300/90 max-w-2xl leading-relaxed">
              រចនាបថ និងតួអង្គកីឡាចម្រុះដូចក្នុង Online-Stopwatch៖ រត់ប្រណាំង, ប្រណាំងអណ្តើក, លោតបាវ, ហែលទឹក, BMX, Space Hopper, និងទូកកានូ។ សិស្សទាំងអស់ទាំង ១១១ នាក់ អាចចូលរួមប្រណាំងបានក្នុងពេលតែមួយ!
            </p>
          </div>

          {/* Quick Actions & Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Setup Mode Button */}
            <button
              type="button"
              onClick={() => setViewMode("setup")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
              title="បើកផ្ទាំងរៀបចំការប្រណាំងពេញលេញ (Full Setup Mode)"
            >
              <Sliders className="w-4 h-4" />
              <span>ផ្ទាំងរៀបចំការប្រណាំង (Setup Mode)</span>
            </button>

            {/* Sync from Database Button */}
            <button
              type="button"
              onClick={() => fetchGoogleSheetStudents(true)}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
              title="ទាញយកទិន្នន័យចុងក្រោយពី Cloud Database ឡើងវិញ"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "កំពុង Sync..." : "Sync ទិន្នន័យសិស្ស"}</span>
            </button>

            {/* Manual Roster / Input Button */}
            <button
              type="button"
              onClick={() => setShowRosterModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-fuchsia-500/30 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>បញ្ចូល/កែឈ្មោះដោយដៃ</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${isMuted
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? "បិទសំឡេង" : "សំឡេងបើក"}</span>
            </button>

            {/* Room Filter Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/40 border border-white/15">
              <span className="text-xs text-slate-400">បន្ទប់៖</span>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">
                  គ្រប់បន្ទប់ ({sheetStudents.length} នាក់)
                </option>
                {availableRooms.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    បន្ទប់ {r} ({sheetStudents.filter((s) => s.room === r).length} នាក់)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-3 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={() => handleTabChange("race")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${activeTab === "race"
              ? "bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/30 scale-102"
              : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
              }`}
          >
            <Flame className={`w-4 h-4 ${activeTab === "race" ? "text-red-600" : ""}`} />
            <span>🏃‍♂️ ១. ហ្គេមប្រណាំងកីឡា (Sports Themed Races)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("wheel")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${activeTab === "wheel"
              ? "bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/30 scale-102"
              : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
              }`}
          >
            <RotateCw className={`w-4 h-4 ${activeTab === "wheel" ? "text-indigo-600" : ""}`} />
            <span>🎡 ២. កង់បង្វិលចាប់ឈ្មោះ (Wheel Picker)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("groups")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${activeTab === "groups"
              ? "bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/30 scale-102"
              : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
              }`}
          >
            <Users className={`w-4 h-4 ${activeTab === "groups" ? "text-emerald-600" : ""}`} />
            <span>👥 ៣. បែងចែកក្រុម & រើសប្រធាន (Group Maker)</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1 (FEATURED): ONLINE-STOPWATCH SPORTS RACE ARENA
      ======================================================== */}
      {activeTab === "race" && (
        <div ref={raceContainerRef} className="space-y-6">
          {/* Online-Stopwatch Style Themed Cards Carousel */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-4 border-blue-500/40 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-500 text-white text-xs font-black uppercase">
                    ONLINE-STOPWATCH
                  </span>
                  <span>ជ្រើសរើសប្រភេទហ្គេមប្រណាំង (Sports Themed Timers & Races)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  រចនាបថ និងតួអង្គកីឡាចម្រុះដូចក្នុងរូបភាព៖ រត់ប្រណាំង, ប្រណាំងអណ្តើក, លោតបាវ, ហែលទឹក, កង់ BMX, Space Hopper និងទូកកានូ
                </p>
              </div>

              {/* Race Participant Mode Selector (ALL STUDENTS CAN PLAY!) */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 pl-2 pr-1 font-bold">
                    សិស្សចូលរួម៖
                  </span>

                  {/* 6 Students (Matches Reference Screenshot Directly!) */}
                  <button
                    type="button"
                    onClick={() => {
                      setRaceLaneCount(6);
                      setupRaceParticipants(6);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black cursor-pointer transition-all flex items-center gap-1.5 ${raceLaneCount === 6
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/30 scale-105"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                  >
                    <span>៦ នាក់ (ដូចក្នុងរូប ⭐)</span>
                  </button>

                  {/* All Students Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setRaceLaneCount("all");
                      setupRaceParticipants("all", activeStudents, 0, allStudentsMode);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black cursor-pointer transition-all flex items-center gap-1.5 ${raceLaneCount === "all"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 scale-105"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>ទាំងអស់គ្នា ({activeStudents.length} នាក់)</span>
                  </button>

                  {[16, 8, 4, 2].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setRaceLaneCount(num);
                        setupRaceParticipants(num);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${raceLaneCount === num
                        ? "bg-indigo-600 text-white shadow-sm font-black"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                      {num === 2 ? "1 vs 1" : `${num} នាក់`}
                    </button>
                  ))}
                </div>

                {/* Tournament Heats & Marathon Bar when 'all' is selected */}
                {raceLaneCount === "all" && (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-2xl border border-amber-500/30 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                        {allStudentsMode === "heats" ? "ការប្រកួតតាមវគ្គ (Tournament Heats)" : "រត់រួមគ្នាទាំងអស់ (Mass Marathon)"}
                      </span>
                      {allStudentsMode === "heats" && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                          • សិស្ស {currentHeatIndex * 6 + 1} ដល់ {Math.min((currentHeatIndex + 1) * 6, activeStudents.length)} នៃ {activeStudents.length} នាក់
                        </span>
                      )}
                    </div>

                    {allStudentsMode === "heats" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={currentHeatIndex === 0}
                          onClick={() => {
                            const nextIdx = Math.max(0, currentHeatIndex - 1);
                            setupRaceParticipants("all", activeStudents, nextIdx, "heats");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          ◀ វគ្គមុន
                        </button>

                        <span className="px-3 py-1 rounded-lg bg-amber-500 text-white font-black shadow-sm">
                          វគ្គទី {currentHeatIndex + 1} / {Math.max(1, Math.ceil(activeStudents.length / 6))}
                        </span>

                        <button
                          type="button"
                          disabled={currentHeatIndex >= Math.ceil(activeStudents.length / 6) - 1}
                          onClick={() => {
                            const nextIdx = currentHeatIndex + 1;
                            setupRaceParticipants("all", activeStudents, nextIdx, "heats");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          វគ្គបន្ទាប់ ▶
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAllStudentsMode("marathon");
                            setupRaceParticipants("all", activeStudents, 0, "marathon");
                          }}
                          className="ml-2 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                        >
                          🏃‍♂️ រត់រួមគ្នា ({activeStudents.length} នាក់)
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold">
                          សិស្សទាំងអស់ {activeStudents.length} នាក់នៅលើទីលានតែមួយ!
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAllStudentsMode("heats");
                            setupRaceParticipants("all", activeStudents, 0, "heats");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer shadow-sm"
                        >
                          🏆 ប្តូរមកវគ្គជម្រុះ (៦ នាក់/ជុំ)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Online-Stopwatch Thumbnail Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
              {RACE_THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${isSelected
                      ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-black scale-105 shadow-lg shadow-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-blue-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    <span className="text-4xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 inline-block shadow-inner">
                      {theme.icon}
                    </span>
                    <span className="text-xs font-bold leading-tight line-clamp-2">
                      {theme.nameKh.split("(")[0]}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {theme.characterName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Online-Stopwatch Stadium Arena & HUD Controller */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 p-6 lg:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Top Classic Online-Stopwatch Digital HUD Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B0F19] to-slate-900 border-2 border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
              {/* Left: Classic Online-Stopwatch Buttons [ Start ] [ Pause ] [ Clear ] */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={startRace}
                  disabled={isRacing}
                  className="px-5 py-2.5 rounded-xl font-black text-sm bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/40 active:translate-y-0.5 border border-emerald-300/40 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isPaused ? "បន្ត (Resume)" : "ចាប់ផ្តើម (Start)"}</span>
                </button>

                <button
                  type="button"
                  onClick={pauseRace}
                  disabled={!isRacing}
                  className="px-4 py-2.5 rounded-xl font-black text-sm bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 active:translate-y-0.5 border border-amber-300/40 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Pause className="w-4 h-4 fill-slate-950" />
                  <span>ផ្អាក (Pause)</span>
                </button>

                <button
                  type="button"
                  onClick={clearRace}
                  className="px-4 py-2.5 rounded-xl font-black text-sm bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white shadow-lg shadow-rose-500/30 active:translate-y-0.5 border border-rose-300/40 transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>សម្អាត (Clear)</span>
                </button>

                {/* Preset Time Buttons */}
                <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-white/20 text-xs">
                  {[5, 10, 15, 30, 60].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      disabled={isRacing}
                      onClick={() => {
                        setRaceDuration(sec);
                        setRaceTimeLeft(sec);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer disabled:opacity-50 ${raceDuration === sec
                        ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                        : "bg-white/10 hover:bg-white/20 text-slate-300"
                        }`}
                    >
                      {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Signature LED 7-Segment Digital Clock */}
              <div className="flex items-center gap-3">
                <div className="px-5 py-2 rounded-xl bg-black border-2 border-slate-700/80 shadow-inner flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                    TIMER:
                  </span>
                  <span className="font-mono text-2xl lg:text-3xl font-black tracking-widest text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]">
                    {formatDigitalTimer(raceTimeLeft)}
                  </span>
                </div>

                {/* Full-Screen Classroom Mode Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveRaceSession({
                      participants: raceParticipants.length > 0 ? raceParticipants : activeStudents,
                      durationSeconds: raceDuration,
                      theme: selectedTheme,
                      roomName: selectedRoom === "all" ? "គ្រប់ថ្នាក់" : `បន្ទប់ ${selectedRoom}`
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="បើកល្បែងប្រណាំងពេញអេក្រង់ (Full-Screen Race Game)"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">លេងពេញអេក្រង់</span>
                </button>

                {/* Fullscreen Toggle Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all cursor-pointer"
                  title="ពង្រីកពេញអេក្រង់ (Fullscreen)"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Race Arena Title & Current Roster Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  {selectedTheme.icon}
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <span>{selectedTheme.nameKh}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40">
                      {raceParticipants.length} នាក់កំពុងប្រណាំង
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {raceLaneCount === "all"
                      ? "សិស្សទាំងអស់គ្នាចូលរួមប្រណាំងក្នុងសង្វៀនម៉ារ៉ាតុងអូឡាំពិក!"
                      : `ជ្រើសរើសចំនួន ${raceParticipants.length} នាក់ ដើម្បីប្រណាំងរកជើងឯក/ឆ្លើយសំណួរ!`}
                  </p>
                </div>
              </div>

              {/* Quick Actions: Shuffle / Add Racer */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setupRaceParticipants(raceLaneCount)}
                  disabled={isRacing}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>ប្តូរសិស្សចៃដន្យ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddRacerModalOpen(true)}
                  disabled={isRacing}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ បន្ថែមសិស្ស</span>
                </button>
              </div>
            </div>

            {/* Countdown Overlay (3, 2, 1, GO!) with Gun Blast */}
            {countdown !== null && (
              <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
                <div className="text-center space-y-3">
                  <div className="text-8xl md:text-9xl font-black text-amber-400 animate-bounce tracking-widest drop-shadow-[0_10px_35px_rgba(245,158,11,0.9)]">
                    {countdown}
                  </div>
                  <p className="text-lg font-black text-white uppercase tracking-wider">
                    {countdown === "GO!" ? "🔫 BANG! ចាប់ផ្តើមរត់!" : "ត្រៀមខ្លួនរួចរាល់..."}
                  </p>
                </div>
              </div>
            )}

            {/* Winner Celebration Banner on Track */}
            {raceWinner && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-4 border-amber-600 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-950 animate-bounce">
                <div className="flex items-center gap-3.5">
                  <span className="text-5xl drop-shadow-md">🏆</span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider bg-black/20 text-slate-950 px-2.5 py-0.5 rounded-lg inline-block mb-1">
                      🎉 ជ័យលាភីជើងឯកការប្រណាំង! (WINNER!)
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black">
                      {raceWinner.fullNameKh || raceWinner.fullName || raceWinner.fullNameEn}
                    </h3>
                    <p className="text-xs font-bold font-mono text-slate-800">
                      អត្តលេខ៖ {raceWinner.studentId} • បន្ទប់ {raceWinner.room || "N"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRacePodium(
                        racePodium || {
                          first: raceWinner,
                          second: raceParticipants[1] || null,
                          third: raceParticipants[2] || null,
                          rankings: raceParticipants
                        }
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>មើលវេទិកាជ័យលាភី (Podium)</span>
                  </button>

                  <button
                    type="button"
                    onClick={startRace}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ប្រណាំងម្តងទៀត</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                CARTOON STADIUM TRACK ARENA (MATCHING REFERENCE SCREENSHOT!)
            ======================================================== */}
            {/* ========================================================
                CARTOON STADIUM TRACK ARENA — ALL STUDENTS RACE TOGETHER
                (Single Shared Animated Track, No Separate Card Boxes!)
            ======================================================== */}
            <div className="rounded-3xl border-4 border-slate-700/80 shadow-2xl overflow-hidden bg-slate-900 flex flex-col relative select-none">
              {/* 1. Upper Illustrated Sky, Stadium Grandstand & Festival Flags */}
              <div className="relative w-full h-24 sm:h-28 bg-gradient-to-b from-[#38BDF8] via-[#7DD3FC] to-[#BAE6FD] overflow-hidden shrink-0 border-b-4 border-amber-600/60 shadow-md">
                {/* Sun Glow in top corner */}
                <div className="absolute top-2 right-12 w-16 h-16 rounded-full bg-amber-200/60 blur-xl pointer-events-none" />

                {/* Soft Cartoon Clouds Drifting */}
                <div className="absolute top-3 left-10 opacity-70 pointer-events-none">
                  <div className="w-16 h-6 bg-white rounded-full relative">
                    <div className="w-8 h-8 bg-white rounded-full absolute -top-3 left-3" />
                    <div className="w-6 h-6 bg-white rounded-full absolute -top-2 left-8" />
                  </div>
                </div>
                <div className="absolute top-4 right-32 opacity-60 pointer-events-none hidden sm:block">
                  <div className="w-20 h-7 bg-white rounded-full relative">
                    <div className="w-10 h-10 bg-white rounded-full absolute -top-4 left-4" />
                    <div className="w-7 h-7 bg-white rounded-full absolute -top-2 left-10" />
                  </div>
                </div>

                {/* Cheering Stadium Spectators Crowd Silhouettes with Festive Banners */}
                <div className="absolute bottom-2 inset-x-0 flex items-end justify-around opacity-40 select-none pointer-events-none px-4">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center"
                      style={{
                        transform: `scale(${0.7 + (i % 4) * 0.12}) translateY(${(i % 3) * 3}px)`
                      }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-900" />
                      <div className="w-7 h-6 rounded-t-lg bg-slate-900 -mt-0.5" />
                    </div>
                  ))}
                </div>

                {/* Stadium Barrier Wall with School Banner */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700 flex items-center justify-between px-6 text-[9px] font-black text-amber-300 uppercase tracking-widest border-t border-blue-450 shadow-xs">
                  <span>★ MYPINTOU OLYMPIC ARENA ★</span>
                  <span className="hidden sm:inline">ពហុកីឡាដ្ឋានជាតិសាលារៀនកម្ពុជា</span>
                  <span>★ RACE CHAMPIONSHIP ★</span>
                </div>

                {/* Colorful Triangular Bunting Pennant Flags across the Top */}
                <div className="absolute top-0 left-0 right-0 flex justify-between items-start pointer-events-none z-10 px-0.5">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const flagColors = [
                      "border-t-rose-500",
                      "border-t-amber-400",
                      "border-t-emerald-500",
                      "border-t-blue-500",
                      "border-t-purple-500",
                      "border-t-pink-500"
                    ];
                    const colorClass = flagColors[i % flagColors.length];
                    return (
                      <div
                        key={i}
                        className={`w-0 h-0 border-l-[7px] sm:border-l-[11px] border-l-transparent border-r-[7px] sm:border-r-[11px] border-r-transparent border-t-[14px] sm:border-t-[20px] ${colorClass} drop-shadow-sm`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 2. ONE Shared Continuous Running Track Surface (No Separate Rows/Lanes!) */}
              <div
                className={`relative w-full p-4 sm:p-6 min-h-[460px] sm:min-h-[520px] flex flex-col justify-between overflow-hidden ${selectedTheme.id === "swimming"
                    ? "bg-gradient-to-b from-[#0284C7] via-[#0369A1] to-[#075985]"
                    : selectedTheme.id === "canoe"
                      ? "bg-gradient-to-b from-[#075985] via-[#0284C7] via-[#0369A1] to-[#0c4a6e]"
                      : selectedTheme.id === "claw" || selectedTheme.id === "eggspoon"
                        ? "bg-gradient-to-b from-[#1E1B4B] via-[#2E1065] to-[#0F172A]"
                        : selectedTheme.id === "bmx"
                          ? "bg-gradient-to-b from-[#78716C] via-[#57534E] to-[#44403C]"
                          : selectedTheme.id === "turtle"
                            ? "bg-gradient-to-b from-[#15803D] via-[#166534] to-[#14532D]"
                            : "bg-gradient-to-b from-[#C5C7CC] via-[#BCBFC6] to-[#AEB2B9]"
                  } shadow-inner select-none`}
              >
                {/* Soft Shadow Cast from Top Grandstand Railing */}
                <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-black/25 to-transparent pointer-events-none z-10" />

                {/* Swimming Pool Lane Markers for Swimming Theme */}
                {selectedTheme.id === "swimming" && (
                  <div className="absolute inset-0 pointer-events-none opacity-25">
                    <div className="absolute inset-x-0 top-1/4 h-0.5 border-b-2 border-dashed border-cyan-200" />
                    <div className="absolute inset-x-0 top-2/4 h-0.5 border-b-2 border-dashed border-cyan-200" />
                    <div className="absolute inset-x-0 top-3/4 h-0.5 border-b-2 border-dashed border-cyan-200" />
                  </div>
                )}

                {/* Canoe River Regatta Course: Lush Riverbanks & Olympic Floating Buoy Lines */}
                {selectedTheme.id === "canoe" && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
                    {/* Top Riverbank */}
                    <div className="absolute top-0 inset-x-0 h-10 sm:h-12 bg-gradient-to-b from-[#14532D] via-[#166534] to-[#15803D] border-b-2 border-emerald-400/30 shadow-md flex items-end justify-between px-4 z-10">
                      <div className="w-full flex items-end justify-around pb-1">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className="w-2 sm:w-2.5 h-4 sm:h-5 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 rounded-t-sm shadow-sm border border-amber-950/60" />
                            <div className="w-4 h-1.5 bg-emerald-400/40 rounded-full -mt-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Riverbank */}
                    <div className="absolute bottom-0 inset-x-0 h-9 sm:h-11 bg-gradient-to-t from-[#14532D] via-[#166534] to-[#15803D] border-t-2 border-emerald-400/30 shadow-inner flex items-start justify-between px-4 z-10">
                      <div className="w-full flex items-start justify-around pt-1">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className={`rounded-full shadow-sm ${i % 3 === 0 ? "w-2.5 h-1.5 bg-stone-300" : i % 3 === 1 ? "w-2 h-1 bg-stone-400" : "w-1.5 h-1 bg-amber-200"}`} />
                            <div className="w-1 h-2 bg-emerald-400/50 rounded-t-full transform -rotate-12" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* River Surface Shimmer Caustic Overlay */}
                    <div className="absolute inset-0 top-10 bottom-9 sm:top-12 sm:bottom-11 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/15 via-transparent to-blue-950/30 pointer-events-none" />

                    {/* Horizontal River Current Wave Streaks */}
                    <div className="absolute inset-x-0 top-12 bottom-11 overflow-hidden pointer-events-none opacity-40">
                      <svg className="w-[120%] h-full animate-river-flow" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <defs>
                          <pattern id="riverWavesPatternClassroom" width="160" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 0 10 Q 40 4 80 10 T 160 10" fill="none" stroke="#E0F2FE" strokeWidth="1.5" strokeOpacity="0.45" />
                            <path d="M 0 25 Q 40 31 80 25 T 160 25" fill="none" stroke="#7DD3FC" strokeWidth="1.2" strokeOpacity="0.35" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#riverWavesPatternClassroom)" />
                      </svg>
                    </div>

                    {/* Olympic Regatta Floating Buoy Lines (3 Course Guideline Strands) */}
                    {[0.26, 0.50, 0.74].map((ratio, lineIdx) => {
                      const buoys = [
                        { left: "12%", color: "red" },
                        { left: "22%", color: "yellow" },
                        { left: "32%", color: "white" },
                        { left: "42%", color: "red" },
                        { left: "52%", color: "yellow" },
                        { left: "62%", color: "white" },
                        { left: "72%", color: "red" },
                        { left: "82%", color: "yellow" },
                        { left: "92%", color: "white" }
                      ];

                      return (
                        <div
                          key={lineIdx}
                          className="absolute inset-x-0 pointer-events-none"
                          style={{ top: `${ratio * 100}%` }}
                        >
                          <div className="absolute inset-x-0 h-0.5 border-b border-dashed border-sky-200/35" />
                          {buoys.map((buoy, bIdx) => {
                            const bgGrad =
                              buoy.color === "red"
                                ? "from-rose-500 via-red-600 to-red-800 border-red-300"
                                : buoy.color === "yellow"
                                  ? "from-amber-300 via-amber-500 to-amber-700 border-amber-200"
                                  : "from-white via-slate-100 to-slate-300 border-white";

                            return (
                              <div
                                key={bIdx}
                                className="absolute -top-2 flex flex-col items-center"
                                style={{
                                  left: buoy.left,
                                  animationDelay: `${((lineIdx * 3 + bIdx) * 0.18)}s`
                                }}
                              >
                                <div
                                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br ${bgGrad} border shadow-md animate-buoy-bob flex items-center justify-center`}
                                  style={{ animationDelay: `${((lineIdx * 3 + bIdx) * 0.18)}s` }}
                                >
                                  <div className="w-1 h-1 bg-white/80 rounded-full -mt-1 -ml-1" />
                                </div>
                                <div
                                  className="w-5 h-2 rounded-full border border-sky-300/40 bg-sky-400/20 animate-buoy-ripple -mt-1"
                                  style={{ animationDelay: `${((lineIdx * 3 + bIdx) * 0.18)}s` }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Arcade Claw Machine Neon Ambient Grid */}
                {(selectedTheme.id === "claw" || selectedTheme.id === "eggspoon") && (
                  <div className="absolute inset-0 pointer-events-none opacity-25">
                    <div className="absolute inset-0 bg-[radial-gradient(#C084FC_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
                  </div>
                )}

                {/* Distance Progress Markers Chalk Lines on the Track Floor */}
                <div className="w-full flex items-center justify-between text-xs font-black text-slate-800 dark:text-white mb-2 px-6 select-none pointer-events-none drop-shadow-sm z-10">
                  <span className="flex items-center gap-1.5 bg-black/40 text-white px-3 py-1 rounded-full border border-white/20">
                    <span>🚩 ចំណុចចេញដំណើរ (START)</span>
                  </span>
                  <span className="hidden sm:inline bg-black/20 text-slate-900 px-2.5 py-0.5 rounded-full border border-black/10 font-mono font-bold">25%</span>
                  <span className="hidden sm:inline bg-black/20 text-slate-900 px-2.5 py-0.5 rounded-full border border-black/10 font-mono font-bold">50%</span>
                  <span className="hidden sm:inline bg-black/20 text-slate-900 px-2.5 py-0.5 rounded-full border border-black/10 font-mono font-bold">75%</span>
                  <span className="flex items-center gap-1.5 bg-black/50 text-white px-3 py-1 rounded-full border border-white/20 text-amber-300">
                    <span>ខ្សែបន្ទាត់ព្រ័ត្រ (FINISH LINE)</span>
                    <span>🏁</span>
                  </span>
                </div>

                {/* The START LINE on the Left: Double Solid White Chalk Line */}
                <div className="absolute top-10 bottom-0 left-10 sm:left-14 w-2 border-r-4 border-solid border-white/80 pointer-events-none z-10 flex flex-col justify-between py-2">
                  <div className="w-4 -ml-1 text-xs">🚩</div>
                  <div className="w-4 -ml-1 text-xs">🚩</div>
                </div>

                {/* The FINISH LINE on the Right: Continuous Checkered Ribbon spanning entire track */}
                <div className="absolute top-0 bottom-0 right-8 sm:right-16 w-8 pointer-events-none z-30 flex flex-col items-center justify-between py-4">
                  <div className={`w-5 h-full border-r-4 border-dashed border-white flex flex-col justify-around items-center drop-shadow-lg transition-all duration-300 ${
                    raceWinner ? "opacity-40 scale-y-95 translate-x-3" : "opacity-100"
                  }`}>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-4 bg-black text-[9px] font-black text-white flex items-center justify-center rotate-90 rounded-sm shadow-md"
                      >
                        🏁
                      </div>
                    ))}
                  </div>
                </div>

                {/* WINNER ON-TRACK BANNER: Displays right at the finish line so everyone sees the winner! (Hidden once modal opens) */}
                {!racePodium && raceWinner && (
                  <div className="absolute top-4 right-6 sm:right-16 z-40 flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-2xl border-2 border-white ring-4 ring-amber-400/80 animate-in fade-in slide-in-from-right-4 duration-300">
                    <span className="text-3xl animate-bounce">👑</span>
                    <div className="text-left leading-tight">
                      <span className="text-[10px] uppercase tracking-wider text-amber-900 block font-black">
                        🏆 ជ័យលាភីលេខ ១ បានកាត់ខ្សែព្រ័ត្រ!
                      </span>
                      <span className="text-base sm:text-lg font-black text-slate-950">
                        {raceWinner.fullNameKh || raceWinner.fullName || raceWinner.fullNameEn}
                      </span>
                    </div>
                    <span className="text-2xl animate-pulse">🏁</span>
                  </div>
                )}

                {/* OPEN TRACK ARENA — ALL RACERS CLUSTERED TOGETHER AT START LINE!
                    (Isolated stacking context so racers never render on top of page modals) */}
                <div className={`relative isolate w-full flex-1 ${raceParticipants.length > 30 ? "min-h-[520px] sm:min-h-[580px]" : "min-h-[380px] sm:min-h-[440px]"}`}>
                  {raceParticipants.map((student, idx) => {
                    const bibNumber = idx + 1;
                    const pos = racePositions[idx] || {};
                    const progress = pos.progress || 0;
                    const isWinnerRacer = raceWinner && (raceWinner.studentId === student.studentId);
                    const isBoosting = pos.isBoosting;

                    // Staggered depth starting grid coordinates:
                    const { startX, bottomPercent, zIndex: depthZ, colIndex, rowIndex } = getRacerPlacement(
                      idx,
                      raceParticipants.length,
                      selectedTheme.id
                    );
                    const isCanoe = selectedTheme.id === "canoe";
                    const racerScale = isCanoe
                      ? (raceParticipants.length > 18 ? 0.88 : raceParticipants.length > 8 ? 1.05 : 1.15)
                      : (raceParticipants.length > 18 ? 0.96 : raceParticipants.length > 8 ? 1.12 : 1.25);

                    return (
                      <div
                        key={student.studentId || idx}
                        ref={(el) => { raceDomRefs.current[idx] = el; }}
                        className="absolute pointer-events-auto transition-transform group"
                        style={{
                          bottom: `${bottomPercent}%`,
                          left: `calc(${startX}px + (100% - ${startX + 140}px) * (${Math.min(100, Math.max(0, progress))} / 100))`,
                          zIndex: isWinnerRacer ? 60 : depthZ,
                          transition: isRacing ? "none" : "left 0.4s ease-out"
                        }}
                      >
                        {/* Remove Racer button on hover (setup time) */}
                        {!isRacing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRacer(student.studentId)}
                            className="absolute -top-3 -right-2 z-40 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] transition-all cursor-pointer shadow-md"
                            title="ដកចេញពីការប្រណាំង"
                          >
                            ✕
                          </button>
                        )}

                        <RacerCostumeSprite
                          index={idx}
                          bibNumber={bibNumber}
                          themeId={selectedTheme.id}
                          isRacing={isRacing}
                          isWinning={isWinnerRacer}
                          studentName={student.fullNameKh || student.fullName || student.fullNameEn}
                          studentId={student.studentId}
                          scale={racerScale}
                          isBoosting={isBoosting}
                          speed={pos.speed || 1}
                          durationSeconds={raceDuration}
                          isPaused={isPaused}
                          totalRacers={raceParticipants.length}
                          colIndex={colIndex}
                          rowIndex={rowIndex}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              RACE PODIUM & LEADERBOARD MODAL (CELEBRATE ALL RACERS)
          ======================================================== */}
          {racePodium && (
            <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
              <div className="relative z-[100001] w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border-4 border-amber-500/50 p-6 md:p-8 shadow-2xl text-center space-y-6 max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setRacePodium(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center mx-auto text-4xl shadow-xl shadow-amber-500/40 animate-bounce">
                  🏆
                </div>

                <div className="space-y-1">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/40">
                    🎉 ជ័យលាភីប្រណាំងជើងឯក! (CHAMPIONSHIP PODIUM)
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white pt-2">
                    {racePodium.first?.fullNameKh || racePodium.first?.fullName}
                  </h3>
                  <p className="text-sm text-indigo-500 font-bold font-mono">
                    អត្តលេខ៖ {racePodium.first?.studentId} • បន្ទប់ {racePodium.first?.room || "N"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    បានមកដល់ទីព្រ័ត្រមុនគេបង្អស់ក្នុងចំណោមសិស្ស {raceParticipants.length} នាក់ លើវិញ្ញាសា "{selectedTheme.nameKh}"!
                  </p>
                </div>

                {/* 1st, 2nd, 3rd Olympic Podium Display */}
                <div className="grid grid-cols-3 gap-2 pt-2 items-end">
                  {/* 2nd Place (Silver) */}
                  {racePodium.second && (
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 text-center space-y-1">
                      <span className="text-2xl">🥈</span>
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                        {racePodium.second.fullNameKh || racePodium.second.fullName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">ជើងឯករង (លេខ ២)</span>
                    </div>
                  )}

                  {/* 1st Place (Gold) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/25 to-amber-500/10 border-2 border-amber-500 text-center space-y-1 transform -translate-y-3 shadow-xl shadow-amber-500/30">
                    <span className="text-3xl">🥇</span>
                    <p className="text-sm font-black text-amber-600 dark:text-amber-400 truncate">
                      {racePodium.first.fullNameKh || racePodium.first.fullName}
                    </p>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                      👑 ម្ចាស់ជើងឯកលេខ ១
                    </span>
                  </div>

                  {/* 3rd Place (Bronze) */}
                  {racePodium.third && (
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 text-center space-y-1">
                      <span className="text-2xl">🥉</span>
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                        {racePodium.third.fullNameKh || racePodium.third.fullName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">ជើងឯកលេខ ៣</span>
                    </div>
                  )}
                </div>

                {/* Top 10 Finisher Table */}
                {racePodium.rankings && racePodium.rankings.length > 3 && (
                  <div className="space-y-2 pt-2 text-left">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      🏆 តារាងចំណាត់ថ្នាក់សិស្សឆ្នើមទាំង ១០ នាក់ដំបូង (Top 10 Finishers)៖
                    </span>
                    <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1">
                      {racePodium.rankings.slice(0, 10).map((racer) => (
                        <div
                          key={racer.studentId}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-400 w-6">
                              #{racer.rank}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-white">
                              {racer.fullNameKh || racer.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({racer.studentId})
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-500">
                            {racer.rank === 1 ? "🥇 ជើងឯក" : racer.rank === 2 ? "🥈 លេខ ២" : racer.rank === 3 ? "🥉 លេខ ៣" : `ជាប់ចំណាត់ថ្នាក់ #${racer.rank}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRacePodium(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    បិទផ្ទាំង
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRacePodium(null);
                      clearRace();
                      setTimeout(() => startRace(), 300);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md hover:from-emerald-400 hover:to-teal-500 transition-all cursor-pointer"
                  >
                    ប្រណាំងម្តងទៀត ➔
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Add Specific Racer to Race */}
          {addRacerModalOpen && (
            <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
              <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-500" />
                  <span>ជ្រើសរើសសិស្សបន្ថែមចូលសង្វៀនប្រណាំង</span>
                </h4>

                <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
                  {activeStudents
                    .filter((s) => !raceParticipants.some((p) => p.studentId === s.studentId))
                    .map((s) => (
                      <button
                        key={s.studentId}
                        type="button"
                        onClick={() => handleAddSingleRacer(s)}
                        className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500 text-xs text-left text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-bold">{s.fullNameKh || s.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.studentId}</span>
                      </button>
                    ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setAddRacerModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    បិទ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: WHEEL OF FORTUNE (LUCKY WHEEL PICKER)
      ======================================================== */}
      {activeTab === "wheel" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Wheel Stage */}
          <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl flex flex-col items-center justify-center relative min-h-[580px]">
            {/* Top Indicator & Real-Time Needle Readout */}
            <div className="absolute top-6 left-6 right-6 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>សិស្សទាំងអស់ក្នុងកង់៖ {displayWheelStudents.length} នាក់ (លេងទាំងអស់ ១០០%)</span>
                </span>
              </div>

              {pointedStudent && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm animate-in fade-in">
                  <span>🎯 ចង្អុលចំ៖</span>
                  <span className="text-slate-900 dark:text-white font-black">{pointedStudent.fullNameKh || pointedStudent.fullName}</span>
                  <span className="text-[10px] font-mono text-indigo-500 font-normal">({pointedStudent.studentId})</span>
                </div>
              )}
            </div>

            {/* Needle / Flapper Pin */}
            <div className="relative flex flex-col items-center">
              <div className="z-20 -mb-5 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[34px] border-t-amber-400 filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]" />

              {/* Wheel Canvas Container */}
              <div className="relative p-3 rounded-full bg-gradient-to-tr from-slate-200 via-slate-100 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-2xl border-4 border-amber-500/40">
                <canvas
                  ref={wheelCanvasRef}
                  width={640}
                  height={640}
                  className="rounded-full max-w-[340px] max-h-[340px] sm:max-w-[460px] sm:max-h-[460px] md:max-w-[520px] md:max-h-[520px]"
                />

                {/* Center Spin Button Overlay */}
                <button
                  type="button"
                  onClick={spinWheel}
                  disabled={isSpinning || displayWheelStudents.length === 0}
                  className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center border-4 border-white cursor-pointer disabled:opacity-50"
                >
                  <RotateCw className={`w-5 h-5 mb-0.5 ${isSpinning ? "animate-spin" : ""}`} />
                  <span>{isSpinning ? "កំពុងវិល" : "បង្វិល"}</span>
                </button>
              </div>
            </div>

            {/* Bottom Quick Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={spinWheel}
                disabled={isSpinning || displayWheelStudents.length === 0}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-base shadow-xl shadow-amber-500/30 transform hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Dices className="w-5 h-5" />
                <span>ចាប់ផ្តើមបង្វិលកង់ (SPIN NOW)</span>
              </button>

              <button
                type="button"
                onClick={() => setWheelStudents(activeStudents)}
                className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="បញ្ចូលឈ្មោះសិស្សឡើងវិញទាំងអស់"
              >
                🔄 ផ្ទុកឈ្មោះឡើងវិញ
              </button>

              {/* Spin Speed Picker */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-400 pl-2 pr-1 font-medium">ល្បឿន៖</span>
                <button
                  type="button"
                  onClick={() => setSpinSpeed("fast")}
                  className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition-all ${spinSpeed === "fast" ? "bg-amber-500 text-white" : "text-slate-600 dark:text-slate-400"
                    }`}
                >
                  ⚡ លឿន
                </button>
                <button
                  type="button"
                  onClick={() => setSpinSpeed("normal")}
                  className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition-all ${spinSpeed === "normal" ? "bg-amber-500 text-white" : "text-slate-600 dark:text-slate-400"
                    }`}
                >
                  🎯 មធ្យម
                </button>
                <button
                  type="button"
                  onClick={() => setSpinSpeed("slow")}
                  className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition-all ${spinSpeed === "slow" ? "bg-amber-500 text-white" : "text-slate-600 dark:text-slate-400"
                    }`}
                >
                  🐢 យឺត
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Spin Goals & Live History */}
          <div className="lg:col-span-4 space-y-6">
            {/* Goal Selector */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>គោលបំណងនៃការចាប់ឈ្មោះ</span>
              </h2>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setWinnerRole("leader")}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${winnerRole === "leader"
                    ? "bg-amber-500/10 border-amber-500/60 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👑</span>
                    <div>
                      <p className="text-xs font-bold">រើសជាប្រធានក្រុម (Pick Leader)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">រើសតំណាង ឬប្រធានក្រុមសម្រាប់កិច្ចការ</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWinnerRole("qa")}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${winnerRole === "qa"
                    ? "bg-blue-500/10 border-blue-500/60 text-blue-600 dark:text-blue-400 font-bold shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">❓</span>
                    <div>
                      <p className="text-xs font-bold">ហៅឆ្លើយសំណួរ (Random Q&A)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">ហៅនិស្សិតឡើងឆ្លើយសំណួរក្នុងម៉ោងរៀន</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWinnerRole("lucky")}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${winnerRole === "lucky"
                    ? "bg-rose-500/10 border-rose-500/60 text-rose-600 dark:text-rose-400 font-bold shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎁</span>
                    <div>
                      <p className="text-xs font-bold">ចាប់រង្វាន់លើកទឹកចិត្ត (Lucky Draw)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">ផ្តល់រង្វាន់ ឬពិន្ទុបន្ថែម (Bonus Points)</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Live History Roster */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>ប្រវត្តិនាក់ត្រូវរើស ({winnerHistory.length})</span>
                </h2>
                {winnerHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setWinnerHistory([])}
                    className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                  >
                    សម្អាត
                  </button>
                )}
              </div>

              {winnerHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  មិនទាន់មានការបង្វិលនៅឡើយ
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {winnerHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-white">
                            {item.student.fullNameKh || item.student.fullName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-mono">
                            {item.student.studentId}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {item.role === "leader" ? "👑 ប្រធានក្រុម" : item.role === "qa" ? "❓ ឆ្លើយសំណួរ" : "🎁 ឈ្នះរង្វាន់"} • {item.timestamp}
                        </p>
                      </div>
                      <span className="text-base">
                        {item.role === "leader" ? "👑" : item.role === "qa" ? "🎯" : "🎉"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: SMART GROUP MAKER & CUSTOMIZER
      ======================================================== */}
      {activeTab === "groups" && (
        <div className="space-y-6">
          {/* Group Controls Bar */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Group Count Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  ចំនួនក្រុម៖
                </span>
                <select
                  value={groupCount}
                  onChange={(e) => setGroupCount(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                    <option key={num} value={num}>
                      {num} ក្រុម ({num} Groups)
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Balance Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={balanceGender}
                  onChange={(e) => setBalanceGender(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>⚖️ ថ្លឹងតុល្យភាពយេនឌ័រ (ស្រី / ប្រុស ស្មើគ្នា)</span>
              </label>

              {/* Add New Group Button */}
              <button
                type="button"
                onClick={handleAddNewGroup}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>បង្កើតក្រុមថ្មី</span>
              </button>
            </div>

            {/* Action Buttons: Shuffle, Copy, Excel Export */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={generateGroups}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>បែងចែកស្វ័យប្រវត្តិ (Generate)</span>
              </button>

              <button
                type="button"
                onClick={handleClearGroups}
                disabled={groups.every((g) => g.members.length === 0 && !g.leader)}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                title="សម្អាតសមាជិក និងប្រធានក្រុមទាំងអស់ (Clear All Members & Leaders)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>សម្អាត (Clear)</span>
              </button>

              <button
                type="button"
                onClick={copyGroupsToClipboard}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copyFeedback ? "បានចម្លងរួច!" : "ចម្លងបញ្ជី"}</span>
              </button>

              <button
                type="button"
                onClick={exportGroupsToExcel}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Groups Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
              >
                {/* Group Header Card */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      {editingGroupId === group.id ? (
                        <input
                          type="text"
                          defaultValue={group.name}
                          autoFocus
                          onBlur={(e) => handleRenameGroup(group.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameGroup(group.id, e.target.value);
                          }}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-indigo-500 text-sm font-bold text-slate-800 dark:text-white"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-slate-800 dark:text-white text-base">
                            {group.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setEditingGroupId(group.id)}
                            className="text-slate-400 hover:text-indigo-500 cursor-pointer"
                            title="ប្តូរឈ្មោះក្រុម"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Spin Leader Button */}
                      <button
                        type="button"
                        onClick={() => spinForGroupLeader(group)}
                        disabled={group.members.length === 0}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="បង្វិលកង់រើសប្រធានក្រុមនេះ"
                      >
                        <Crown className="w-3 h-3" />
                        <span>រើសប្រធាន</span>
                      </button>

                      {/* Delete Group */}
                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="លុបក្រុមនេះ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>សមាជិក៖ {group.members.length} នាក់</span>
                    <span className="text-[11px]">
                      (ស្រី: {group.members.filter((m) => m.gender === "ស្រី" || m.gender === "Female" || m.gender === "F").length} • ប្រុស: {group.members.filter((m) => m.gender !== "ស្រី" && m.gender !== "Female" && m.gender !== "F").length})
                    </span>
                  </div>

                  {/* Leader Spotlight Banner */}
                  {group.leader && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👑</span>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
                            ប្រធានក្រុម (GROUP LEADER)
                          </p>
                          <p className="text-xs font-black text-slate-800 dark:text-white">
                            {group.leader.fullNameKh || group.leader.fullName} ({group.leader.studentId})
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleLeader(group.id, group.leader)}
                        className="text-[10px] text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="ដកតួនាទីប្រធាន"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Members List */}
                <div className="p-4 space-y-2 max-h-[360px] overflow-y-auto flex-1">
                  {group.members.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      គ្មានសមាជិកក្នុងក្រុមនេះឡើយ
                    </div>
                  ) : (
                    group.members.map((member, mIdx) => {
                      const isLeader = group.leader?.studentId === member.studentId;
                      return (
                        <div
                          key={member.studentId || mIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all group/item ${isLeader
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200"
                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono text-[11px] w-4 text-right">
                              {mIdx + 1}.
                            </span>
                            <span className="font-bold">
                              {member.fullNameKh || member.fullName}
                            </span>
                            {isLeader && <span className="text-amber-500">👑</span>}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                              {member.gender || "ស្រី"}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-indigo-500">
                              {member.studentId}
                            </span>

                            {/* Hover Actions: Toggle Leader / Move / Remove */}
                            <div className="flex items-center gap-0.5 opacity-60 group-hover/item:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleToggleLeader(group.id, member)}
                                className={`p-1 rounded hover:bg-amber-500/20 cursor-pointer ${isLeader ? "text-amber-500" : "text-slate-400 hover:text-amber-400"
                                  }`}
                                title="កំណត់ជាប្រធានក្រុម"
                              >
                                <Crown className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setMovingStudentInfo({ student: member, fromGroupId: group.id })}
                                className="p-1 rounded text-slate-400 hover:text-indigo-400 cursor-pointer"
                                title="ផ្លាស់ប្តូរទៅក្រុមផ្សេង"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveMemberFromGroup(group.id, member.studentId)}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                                title="ដកសមាជិកចេញពីក្រុម"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Card Footer: Add Member Button */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <button
                    type="button"
                    onClick={() => setAddMemberToGroupId(group.id)}
                    className="w-full py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:border-indigo-500 hover:text-indigo-500 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ បន្ថែមសមាជិកចូលក្រុមនេះ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: MANUAL INPUT & CUSTOM ROSTER MANAGER
      ======================================================== */}
      {showRosterModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowRosterModal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-fuchsia-500 tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>Manual Input & Custom Roster Suite</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                ✏️ បញ្ចូល និងកែសម្រួលឈ្មោះសិស្សដោយដៃ (Custom Roster)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                អ្នកអាច Paste បញ្ជីឈ្មោះសិស្សជាច្រើននាក់ក្នុងពេលតែមួយ ឬបន្ថែមសិស្សម្នាក់ៗដោយសេរី។
              </p>
            </div>

            {rosterNotice && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{rosterNotice}</span>
              </div>
            )}

            {/* Data Source Selector */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ជ្រើសរើសប្រភពទិន្នន័យសកម្មសម្រាប់ហ្គេម (Active Data Source)៖
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDataSourceMode("sheet")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${dataSourceMode === "sheet"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Cloud Database ({sheetStudents.length} នាក់)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDataSourceMode("custom")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${dataSourceMode === "custom"
                    ? "bg-fuchsia-500/15 border-fuchsia-500 text-fuchsia-600 dark:text-fuchsia-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>បញ្ជីបញ្ចូលដោយដៃ ({customStudents.length} នាក់)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDataSourceMode("merged")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${dataSourceMode === "merged"
                    ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                >
                  <Shuffle className="w-4 h-4" />
                  <span>រួមបញ្ចូលគ្នា ({sheetStudents.length + customStudents.length} នាក់)</span>
                </button>
              </div>
            </div>

            {/* Batch Paste Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-indigo-500" />
                <span>Paste បញ្ជីឈ្មោះសិស្សជាច្រើននាក់ (១ បន្ទាត់ = ១ នាក់ ឬខណ្ឌដោយក្បៀស)៖</span>
              </label>
              <textarea
                rows={4}
                value={pasteInputText}
                onChange={(e) => setPasteInputText(e.target.value)}
                placeholder="ឧទាហរណ៍៖&#10;សុខ សាន&#10;ចាន់ ថន&#10;គង់ វណ្ណា&#10;កែវ សោភា"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleBatchPaste}
                  disabled={!pasteInputText.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  ⚡ បញ្ចូលឈ្មោះទាំងអស់ (Import Names)
                </button>
              </div>
            </div>

            {/* Single Add Form */}
            <form onSubmit={handleAddSingleStudent} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ឬបន្ថែមសិស្សម្នាក់ៗ៖
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  placeholder="គោត្តនាម និងនាម *"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="អត្តលេខ (Optional)"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
                />
                <select
                  value={newStudentGender}
                  onChange={(e) => setNewStudentGender(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="ស្រី">ស្រី (Female)</option>
                  <option value="ប្រុស">ប្រុស (Male)</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  + បន្ថែមសិស្ស
                </button>
              </div>
            </form>

            {/* Custom Students Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  បញ្ជីសិស្សបញ្ចូលដោយដៃ ({customStudents.length} នាក់)៖
                </span>
                {customStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCustomRoster}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    សម្អាតទាំងអស់
                  </button>
                )}
              </div>

              {customStudents.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  មិនទាន់មានសិស្សបញ្ចូលដោយដៃឡើយ
                </div>
              ) : (
                <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                  {customStudents.map((cs) => (
                    <div
                      key={cs.studentId}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white">{cs.fullNameKh}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({cs.studentId})</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500">{cs.gender}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomStudent(cs.studentId)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="លុបឈ្មោះនេះ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowRosterModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
              >
                រួចរាល់ (Apply to Games)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: MOVE STUDENT TO ANOTHER GROUP
      ======================================================== */}
      {movingStudentInfo && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
              <span>ផ្លាស់ប្តូរក្រុមសម្រាប់៖</span>
            </h4>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900">
              {movingStudentInfo.student.fullNameKh || movingStudentInfo.student.fullName} ({movingStudentInfo.student.studentId})
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                ជ្រើសរើសក្រុមគោលដៅ៖
              </span>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                {groups
                  .filter((g) => g.id !== movingStudentInfo.fromGroupId)
                  .map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleMoveStudent(g.id)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-indigo-500/10 hover:border-indigo-500 text-xs font-bold text-slate-800 dark:text-slate-200 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <span>{g.name}</span>
                      <span className="text-[10px] text-slate-400">({g.members.length} នាក់)</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setMovingStudentInfo(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                បោះបង់
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD MEMBER DIRECTLY TO SPECIFIC GROUP
      ======================================================== */}
      {addMemberToGroupId && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-500" />
              <span>
                បន្ថែមសមាជិកចូល {groups.find((g) => g.id === addMemberToGroupId)?.name}
              </span>
            </h4>

            {/* Quick Pick from Active Pool not currently in this group */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500">ជ្រើសរើសពីបញ្ជីសិស្ស៖</span>
              <div className="max-h-[260px] overflow-y-auto space-y-1 pr-1">
                {activeStudents.map((s) => (
                  <button
                    key={s.studentId}
                    type="button"
                    onClick={() => {
                      setGroups((prev) =>
                        prev.map((g) =>
                          g.id === addMemberToGroupId
                            ? { ...g, members: [...g.members, s] }
                            : g
                        )
                      );
                      setAddMemberToGroupId(null);
                    }}
                    className="w-full p-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500 text-xs text-left text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-bold">{s.fullNameKh || s.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{s.studentId}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAddMemberToGroupId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: WHEEL WINNER CELEBRATION
      ======================================================== */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/40 p-6 md:p-8 shadow-2xl text-center space-y-5">
            <button
              type="button"
              onClick={() => setShowWinnerModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto text-4xl shadow-lg shadow-amber-500/30 animate-bounce">
              👑
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
                🎉 សូមអបអរសាទរ! (WINNER PICKED)
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white pt-2">
                {winner.fullNameKh || winner.fullName}
              </h3>
              <p className="text-sm font-mono text-indigo-500 font-bold">
                អត្តលេខ៖ {winner.studentId} • បន្ទប់ {winner.room || "N"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                {winnerRole === "leader"
                  ? "ត្រូវបានចាត់តាំងជាប្រធានក្រុមផ្លូវការ!"
                  : winnerRole === "qa"
                    ? "ត្រូវបានជ្រើសរើសសម្រាប់ឆ្លើយសំណួរក្នុងថ្នាក់!"
                    : "បានទទួលរង្វាន់លើកទឹកចិត្តប្រចាំម៉ោងសិក្សា!"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={removeWinnerFromWheel}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                ដកចេញពីកង់បណ្តោះអាសន្ន
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowWinnerModal(false);
                  spinWheel();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md hover:from-amber-400 hover:to-orange-500 transition-all cursor-pointer"
              >
                បង្វិលបន្តទៀត ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
