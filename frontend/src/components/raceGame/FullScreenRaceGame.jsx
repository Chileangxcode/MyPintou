import React, { useState, useEffect, useRef } from "react";
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Bell,
  Settings,
  X,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  ArrowLeft
} from "lucide-react";
import { RacerCostumeSprite, getRacerPlacement } from "./RaceCostumeSprites.jsx";
import RaceResultsModal from "./RaceResultsModal.jsx";
import {
  playPistolBang,
  playWhistleSound,
  playCountdownBeep,
  playWinnerFanfare,
  playBellChime,
  setSoundMuted,
  getSoundMuted
} from "../../utils/classroomAudio.js";
import { triggerConfetti } from "../../utils/confetti.js";

export default function FullScreenRaceGame({
  participants = [],
  durationSeconds = 10,
  theme = { id: "fancy", nameKh: "រ៉ូបសម្លៀកបំពាក់កំប្លែង (Fancy Dress Race)" },
  roomName = "ទាំងអស់",
  onExitGame,
  onChooseNewStudents,
  onBackToDashboard
}) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRacing, setIsRacing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(null); // 3, 2, 1, "GO!"
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(getSoundMuted());
  const [winner, setWinner] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Array of { id, progress: 0..100, speed, boost }
  const [racerStates, setRacerStates] = useState(() =>
    participants.map((p, idx) => ({
      id: p.studentId || `racer-${idx}`,
      progress: 0,
      speed: 1,
      isBoosting: false
    }))
  );

  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(0);
  const elapsedBeforePauseRef = useRef(0);
  const racerFactorsRef = useRef([]);
  const domRefs = useRef([]);
  const lastSecondRef = useRef(null);

  // Auto enter fullscreen if supported
  useEffect(() => {
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {
        // Fullscreen API may be blocked without direct synchronous click in some browsers; fallback is fixed inset-0
      });
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => { });
      }
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Keyboard Shortcuts (Spacebar: Pause/Resume, Escape: Exit/Close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (isRacing) {
          pauseRace();
        } else if (isPaused || (!isRacing && !winner)) {
          startRace();
        }
      } else if (e.key === "Escape") {
        if (showResults) {
          setShowResults(false);
        } else if (!document.fullscreenElement) {
          onExitGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRacing, isPaused, showResults, winner]);

  // Audio Toggles
  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
  };

  const handleRingBell = () => {
    playBellChime();
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen?.().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => { });
      setIsFullscreen(false);
    }
  };

  // Format digital LCD timer string (00:00:10)
  const formatTimerLCD = (seconds) => {
    const s = Math.max(0, Math.ceil(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `00:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Start / Resume Race
  const startRace = () => {
    if (isRacing || participants.length === 0) return;

    if (isPaused) {
      // Resume from pause
      setIsPaused(false);
      setIsRacing(true);
      runRaceAnimation(elapsedBeforePauseRef.current);
      return;
    }

    // Reset states for fresh race
    setWinner(null);
    setShowResults(false);
    setTimeLeft(durationSeconds);
    elapsedBeforePauseRef.current = 0;
    setRacerStates(
      participants.map((p, idx) => ({
        id: p.studentId || `racer-${idx}`,
        progress: 0,
        speed: 1,
        isBoosting: false
      }))
    );

    // Initial countdown 3, 2, 1, BANG!
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
    }, 850);
  };

  const pauseRace = () => {
    if (!isRacing) return;
    setIsRacing(false);
    setIsPaused(true);
    cancelAnimationFrame(animFrameRef.current);
    if (racerProfilesRef.current.length > 0) {
      setRacerStates(
        racerProfilesRef.current.map((p) => ({
          id: p.id,
          progress: p.currentProgress || 0,
          speed: 1,
          isBoosting: false
        }))
      );
    }
  };

  const racerProfilesRef = useRef([]);
  const designatedWinnerIdRef = useRef(null);

  const clearRace = () => {
    setIsRacing(false);
    setIsPaused(false);
    setCountdown(null);
    cancelAnimationFrame(animFrameRef.current);
    setTimeLeft(durationSeconds);
    lastSecondRef.current = durationSeconds;
    elapsedBeforePauseRef.current = 0;
    setWinner(null);
    setShowResults(false);
    racerProfilesRef.current = [];
    designatedWinnerIdRef.current = null;
    setRacerStates(
      participants.map((p, idx) => ({
        id: p.studentId || `racer-${idx}`,
        progress: 0,
        speed: 1,
        isBoosting: false
      }))
    );
    domRefs.current.forEach((el, idx) => {
      if (el) {
        const placement = getRacerPlacement(idx, participants.length, theme?.id);
        el.style.left = `calc(${placement.startX}px)`;
      }
    });
  };

  const runRaceAnimation = (startOffsetMs = 0) => {
    setIsRacing(true);
    const durationMs = durationSeconds * 1000;
    const baseTime = performance.now() - startOffsetMs;
    startTimeRef.current = baseTime;

    // Initialize or retain deterministic profiles directly synchronized with the timer
    if (
      startOffsetMs === 0 ||
      !racerProfilesRef.current ||
      racerProfilesRef.current.length !== participants.length
    ) {
      // Choose random winner index among participants
      const winnerIdx = Math.floor(Math.random() * participants.length);
      designatedWinnerIdRef.current = participants[winnerIdx]?.studentId || `racer-${winnerIdx}`;

      const isLargeField = participants.length > 18;
      racerProfilesRef.current = participants.map((p, idx) => {
        const isChamp = idx === winnerIdx;
        const placement = getRacerPlacement(idx, participants.length, theme?.id);
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
          id: p.studentId || `racer-${idx}`,
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

    const updateLoop = (now) => {
      const elapsed = now - baseTime;
      elapsedBeforePauseRef.current = elapsed;

      // Exact elapsed time ratio strictly between 0.0 and 1.0
      const timeRatio = Math.min(1, Math.max(0, elapsed / durationMs));

      // Throttle LCD seconds state strictly to once per second (prevents 60 FPS full re-render)
      const currentSec = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      if (currentSec !== lastSecondRef.current) {
        lastSecondRef.current = currentSec;
        setTimeLeft(currentSec);
      }

      // Mid-race drama envelope: sin(timeRatio * PI) is 0 at start, peaks at 50%, returns to 0 at finish
      const midRaceDrama = Math.sin(timeRatio * Math.PI);

      // Direct GPU style updates on DOM elements (60 FPS silky smooth with ZERO lag)
      racerProfilesRef.current.forEach((profile, idx) => {
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

        const el = domRefs.current[idx];
        if (el) {
          const startX = profile.startX || 120;
          el.style.left = `calc(${startX}px + (100% - ${startX + 140}px) * (${currentProgress} / 100))`;
        }
      });

      // Crown winner when time reaches 0 (or timeRatio >= 1.0)
      if (timeRatio >= 1.0 && !winnerCrownTriggered) {
        winnerCrownTriggered = true;
        celebrationStartTime = now;

        setRacerStates(
          racerProfilesRef.current.map((p) => ({
            id: p.id,
            progress: p.currentProgress,
            speed: 1,
            isBoosting: false
          }))
        );

        const championStudent =
          participants.find(
            (p, idx) => (p.studentId || `racer-${idx}`) === designatedWinnerIdRef.current
          ) || participants[0];

        const sorted = [...racerProfilesRef.current].sort((a, b) => b.currentProgress - a.currentProgress);
        const rankedList = sorted
          .map((r, rankIdx) => {
            const student = participants.find((p, pIdx) => (p.studentId || `racer-${pIdx}`) === r.id);
            return student ? { ...student, rank: rankIdx + 1, progress: r.currentProgress } : null;
          })
          .filter(Boolean);

        setWinner(championStudent);
        setRankings(rankedList);

        playWinnerFanfare();
        triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
      }

      // Allow 2.5 seconds of on-track celebration before results modal
      if (winnerCrownTriggered) {
        if (now - celebrationStartTime >= 2500) {
          setIsRacing(false);
          setIsPaused(false);
          setTimeLeft(0);
          cancelAnimationFrame(animFrameRef.current);
          setShowResults(true);
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col bg-[#89CFF0] select-none overflow-hidden font-sans"
    >
      {/* ========================================================
          1. TOP BAR (Directly matching reference screenshot!)
      ======================================================== */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-2 bg-gradient-to-b from-[#89CFF0] to-[#7BC6EC] border-b-2 border-black/15 shadow-sm">
        {/* Left Side Controls: Settings, Sound/Music, Bell, Exit */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Settings Button */}
          <button
            type="button"
            className="w-10 h-10 rounded-xl bg-black/85 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-all cursor-pointer"
            title="ការកំណត់ (Settings)"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Sound / Music Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-md transition-all cursor-pointer ${isMuted
              ? "bg-rose-600/90 hover:bg-rose-600 text-white border-rose-400/40"
              : "bg-black/85 hover:bg-black text-white border-white/20"
              }`}
            title={isMuted ? "បើកសំឡេង (Unmute)" : "បិទសំឡេង (Mute)"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Bell Chime Button */}
          <button
            type="button"
            onClick={handleRingBell}
            className="w-10 h-10 rounded-xl bg-black/85 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-all cursor-pointer"
            title="រោទ៍កណ្ដឹងថ្នាក់រៀន (Bell Chime)"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Exit to Setup Button */}
          <button
            type="button"
            onClick={onExitGame}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-black shadow-md border border-black/10 transition-all cursor-pointer ml-1"
            title="ត្រឡប់ទៅផ្ទាំងរៀបចំ (Exit to Setup)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ត្រឡប់ទៅរៀបចំ</span>
          </button>
        </div>

        {/* Center: Online-Stopwatch Signature LCD Timer & Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Pause & Clear Text Buttons (Like reference screenshot!) */}
          <div className="flex flex-col items-end gap-1 font-bold text-sm text-slate-900 tracking-wide">
            <button
              type="button"
              onClick={isRacing ? pauseRace : startRace}
              className="hover:underline cursor-pointer transition-transform active:scale-95"
            >
              {isRacing ? "Pause" : isPaused ? "Resume" : "Start"}
            </button>
            <button
              type="button"
              onClick={clearRace}
              className="hover:underline cursor-pointer transition-transform active:scale-95 text-slate-800"
            >
              Clear
            </button>
          </div>

          {/* The Large Rounded LCD Timer Box (Directly like reference screenshot!) */}
          <div className="px-6 sm:px-10 py-1.5 sm:py-2.5 bg-[#EFF6FF] border-4 border-black rounded-3xl shadow-xl flex items-center justify-center min-w-[200px] sm:min-w-[280px]">
            <span className="font-mono text-3xl sm:text-5xl font-black text-black tracking-wider leading-none">
              {formatTimerLCD(timeLeft)}
            </span>
          </div>
        </div>

        {/* Right Side: University Branding Banner & Fullscreen Toggle */}
        <div className="flex items-center gap-3">
          {/* Branding Banner inspired by the yellow banner in screenshot */}
          <div className="hidden md:flex flex-col items-center justify-center px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 border-2 border-black/80 shadow-md text-black leading-tight text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">
              សង្វៀនប្រណាំងថ្នាក់រៀន
            </span>
            <span className="text-xs font-black">
              MyPintou (Myពិន្ទុ)
            </span>
            <span className="text-[9px] font-bold text-amber-900">
              បន្ទប់៖ {roomName}
            </span>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-xl bg-black/85 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-all cursor-pointer"
            title="ពង្រីកពេញអេក្រង់ (Fullscreen)"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Mobile Exit Button */}
          <button
            type="button"
            onClick={onExitGame}
            className="sm:hidden w-10 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
            title="ចាកចេញ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ========================================================
          2. AUDIENCE GRANDSTAND & FESTIVE BUNTING FLAGS
             (Matching the uploaded screenshot!)
      ======================================================== */}
      <div className="relative w-full h-20 sm:h-24 bg-gradient-to-b from-[#7BC6EC] to-[#68BCE5] overflow-hidden shrink-0">
        {/* Silhouette Cheering Audience */}
        <div className="absolute inset-0 flex items-end justify-around opacity-30 select-none pointer-events-none">
          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center transform -translate-y-1"
              style={{
                transform: `scale(${0.75 + (i % 3) * 0.15}) translateY(${(i % 2) * 4}px)`
              }}
            >
              {/* Silhouette head & raised cheering arms */}
              <div className="w-5 h-5 rounded-full bg-slate-900" />
              <div className="w-9 h-10 rounded-t-xl bg-slate-900 -mt-1" />
            </div>
          ))}
        </div>

        {/* Festive Colorful Triangular Bunting Flags (Strung across track!) */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-between items-center pointer-events-none z-10">
          {Array.from({ length: 28 }).map((_, i) => {
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
                className={`w-0 h-0 border-l-[10px] sm:border-l-[14px] border-l-transparent border-r-[10px] sm:border-r-[14px] border-r-transparent border-t-[18px] sm:border-t-[24px] ${colorClass} drop-shadow-sm`}
              />
            );
          })}
        </div>

        {/* Gray barrier rail */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-slate-400 to-slate-500 border-t border-slate-600 shadow-sm" />
      </div>

      {/* ========================================================
          3. MAIN RACE TRACK ARENA — ALL RACERS IN THE SAME OPEN ARENA
             (No Separate Rows/Lanes! Directly Matching Uploaded Screenshot!)
      ======================================================== */}
      <main
        className={`relative flex-1 ${theme?.id === "swimming"
            ? "bg-gradient-to-b from-[#0284C7] via-[#0369A1] to-[#075985]"
            : theme?.id === "canoe"
              ? "bg-gradient-to-b from-[#075985] via-[#0284C7] via-[#0369A1] to-[#0c4a6e]"
              : theme?.id === "claw" || theme?.id === "eggspoon"
                ? "bg-gradient-to-b from-[#1E1B4B] via-[#2E1065] to-[#0F172A]"
                : theme?.id === "bmx"
                  ? "bg-gradient-to-b from-[#78716C] via-[#57534E] to-[#44403C]"
                  : theme?.id === "turtle"
                    ? "bg-gradient-to-b from-[#15803D] via-[#166534] to-[#14532D]"
                    : "bg-gradient-to-b from-[#C5C7CC] via-[#BCBFC6] to-[#AEB2B9]"
          } overflow-hidden p-4 sm:p-6 flex flex-col justify-between shadow-inner select-none`}
      >
        {/* Soft Shadow Cast from Top Audience Railing onto Arena Floor */}
        <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-black/25 to-transparent pointer-events-none z-10" />

        {/* Swimming Pool Lane Markers / Water Glow for Swimming Theme */}
        {theme?.id === "swimming" && (
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <div className="absolute inset-x-0 top-1/4 h-0.5 border-b-2 border-dashed border-cyan-200" />
            <div className="absolute inset-x-0 top-2/4 h-0.5 border-b-2 border-dashed border-cyan-200" />
            <div className="absolute inset-x-0 top-3/4 h-0.5 border-b-2 border-dashed border-cyan-200" />
          </div>
        )}

        {/* Canoe River Regatta Course: Lush Riverbanks & Olympic Floating Buoy Lines */}
        {theme?.id === "canoe" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            {/* Top Riverbank (Lush green embankment, wild reeds, wooden dock posts) */}
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

            {/* Bottom Riverbank (Natural grassy riverbank, pebbles & water lapping shore) */}
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

            {/* River Water Surface Shimmer Caustic Overlay */}
            <div className="absolute inset-0 top-10 bottom-9 sm:top-12 sm:bottom-11 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/15 via-transparent to-blue-950/30 pointer-events-none" />

            {/* Horizontal River Current Wave Streaks */}
            <div className="absolute inset-x-0 top-12 bottom-11 overflow-hidden pointer-events-none opacity-40">
              <svg className="w-[120%] h-full animate-river-flow" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <defs>
                  <pattern id="riverWavesPatternFull" width="160" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 0 10 Q 40 4 80 10 T 160 10" fill="none" stroke="#E0F2FE" strokeWidth="1.5" strokeOpacity="0.45" />
                    <path d="M 0 25 Q 40 31 80 25 T 160 25" fill="none" stroke="#7DD3FC" strokeWidth="1.2" strokeOpacity="0.35" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#riverWavesPatternFull)" />
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
        {(theme?.id === "claw" || theme?.id === "eggspoon") && (
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <div className="absolute inset-0 bg-[radial-gradient(#C084FC_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
          </div>
        )}

        {/* Distance Progress Markers Header on Track Floor */}
        <div className="w-full flex items-center justify-between text-xs font-black text-slate-800 dark:text-white mb-2 px-6 select-none pointer-events-none drop-shadow-sm z-10">
          <span className="flex items-center gap-1.5 bg-black/40 text-white px-3 py-1 rounded-full border border-white/20">
            <span>🏁 ចំណុចចាប់ផ្តើម (START)</span>
          </span>
          <span className="hidden sm:inline bg-black/20 text-slate-900 px-2.5 py-0.5 rounded-full border border-black/10 font-mono font-bold">25%</span>
          <span className="hidden sm:inline bg-black/20 text-slate-900 px-2.5 py-0.5 rounded-full border border-black/10 font-mono font-bold">50%</span>
          <span className="hidden sm:inline bg-black/20 text-slate-900 px-2.5 py-0.5 rounded-full border border-black/10 font-mono font-bold">75%</span>
          <span className="flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full border border-white/20 text-amber-300">
            <span>ខ្សែបន្ទាត់ព្រ័ត្រ (FINISH LINE)</span>
            <span>🏁</span>
          </span>
        </div>

        {/* The START LINE on the Left: Solid White Chalk Line */}
        <div className="absolute top-10 bottom-0 left-10 sm:left-14 w-2 border-r-4 border-solid border-white/80 pointer-events-none z-10 flex flex-col justify-between py-2">
          <div className="w-4 -ml-1 text-xs">🚩</div>
          <div className="w-4 -ml-1 text-xs">🚩</div>
        </div>

        {/* Checkered Finish Line Ribbon on the Right Side (Continuous Checkered Banner) */}
        <div className="absolute top-0 bottom-0 right-8 sm:right-16 w-8 pointer-events-none z-30 flex flex-col items-center justify-between py-6">
          <div className={`w-5 h-full border-r-4 border-dashed border-white drop-shadow-lg flex flex-col justify-around items-center transition-all duration-300 ${
            winner ? "opacity-40 scale-y-95 translate-x-3" : "opacity-100"
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

        {/* WINNER ON-TRACK BANNER: Displays right at the finish line so everyone sees the winner! (Hidden once results modal opens) */}
        {!showResults && winner && (
          <div className="absolute top-4 right-8 sm:right-20 z-40 flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-2xl border-2 border-white ring-4 ring-amber-400/80 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-3xl animate-bounce">👑</span>
            <div className="text-left leading-tight">
              <span className="text-[10px] uppercase tracking-wider text-amber-900 block font-black">
                🏆 ជ័យលាភីលេខ ១ បានកាត់ខ្សែព្រ័ត្រ!
              </span>
              <span className="text-base sm:text-lg font-black text-slate-950">
                {winner.fullNameKh || winner.fullName || winner.fullNameEn}
              </span>
            </div>
            <span className="text-2xl animate-pulse">🏁</span>
          </div>
        )}

        {/* ========================================================
            OPEN TRACK ARENA — ALL RACERS CLUSTERED IN SAME PLACE!
            (Isolated stacking context so racers never render on top of page modals)
        ======================================================== */}
        <div className={`relative isolate w-full flex-1 ${participants.length > 30 ? "min-h-[540px] sm:min-h-[600px]" : "min-h-[420px] sm:min-h-[480px]"}`}>
          {participants.map((student, idx) => {
            const bibNumber = idx + 1;
            const rState = racerStates[idx] || {};
            const progress = rState.progress || 0;
            const isWinnerRacer = winner && (winner.studentId === student.studentId);
            const isBoosting = rState.isBoosting;

            // Staggered depth starting grid coordinates:
            const { startX, bottomPercent, zIndex: depthZ, colIndex, rowIndex } = getRacerPlacement(
              idx,
              participants.length,
              theme?.id
            );
            const isCanoe = theme?.id === "canoe";
            const racerScale = isCanoe
              ? (participants.length > 18 ? 0.88 : participants.length > 8 ? 1.05 : 1.15)
              : (participants.length > 18 ? 0.96 : participants.length > 8 ? 1.12 : 1.25);

            return (
              <div
                key={student.studentId || idx}
                ref={(el) => { domRefs.current[idx] = el; }}
                className="absolute pointer-events-auto transition-transform"
                style={{
                  bottom: `${bottomPercent}%`,
                  left: `calc(${startX}px + (100% - ${startX + 140}px) * (${Math.min(100, Math.max(0, progress))} / 100))`,
                  zIndex: isWinnerRacer ? 60 : depthZ,
                  transition: isRacing ? "none" : "left 0.4s ease-out"
                }}
              >
                <RacerCostumeSprite
                  index={idx}
                  bibNumber={bibNumber}
                  themeId={theme?.id || "fancy"}
                  isRacing={isRacing}
                  isWinning={isWinnerRacer}
                  studentName={student.fullNameKh || student.fullName || student.fullNameEn}
                  studentId={student.studentId}
                  scale={racerScale}
                  isBoosting={isBoosting}
                  speed={rState.speed || 1}
                  durationSeconds={durationSeconds}
                  isPaused={isPaused}
                  totalRacers={participants.length}
                  colIndex={colIndex}
                  rowIndex={rowIndex}
                />
              </div>
            );
          })}
        </div>

        {/* Big Start / Resume Action Bar at bottom center */}
        <div className="mt-4 pt-3 flex flex-wrap items-center justify-center gap-4 z-20">
          {!isRacing && (
            <button
              type="button"
              onClick={startRace}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-base shadow-2xl shadow-emerald-600/50 flex items-center gap-2.5 transition-all cursor-pointer border-2 border-emerald-300/40 uppercase tracking-wider"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{isPaused ? "បន្តការប្រណាំង (Resume)" : "ចាប់ផ្តើមការប្រណាំង (Start Race)"}</span>
            </button>
          )}

          {isRacing && (
            <button
              type="button"
              onClick={pauseRace}
              className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-base shadow-xl shadow-amber-500/40 flex items-center gap-2.5 transition-all cursor-pointer border-2 border-amber-300"
            >
              <Pause className="w-5 h-5 fill-slate-950" />
              <span>ផ្អាកជាបណ្តោះអាសន្ន (Pause)</span>
            </button>
          )}

          <button
            type="button"
            onClick={clearRace}
            className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer border border-white/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ចាប់ផ្តើមឡើងវិញ (Reset)</span>
          </button>
        </div>
      </main>

      {/* ========================================================
          4. COUNTDOWN MODAL OVERLAY (3, 2, 1, BANG!)
      ======================================================== */}
      {countdown !== null && (
        <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="text-center space-y-4">
            <div className="text-9xl md:text-[140px] font-black text-amber-400 animate-bounce tracking-widest drop-shadow-[0_12px_40px_rgba(245,158,11,0.9)]">
              {countdown}
            </div>
            <p className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
              {countdown === "GO!" ? "🔫 BANG! ចាប់ផ្តើមរត់!" : "ត្រៀមខ្លួនរួចរាល់..."}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          5. RESULTS PODIUM MODAL
      ======================================================== */}
      {showResults && winner && (
        <RaceResultsModal
          winner={winner}
          rankings={rankings}
          themeName={theme.nameKh}
          onRaceAgain={() => {
            setShowResults(false);
            startRace();
          }}
          onChooseNewStudents={() => {
            setShowResults(false);
            onChooseNewStudents();
          }}
          onBackToDashboard={() => {
            setShowResults(false);
            onBackToDashboard();
          }}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
