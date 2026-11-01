import React from "react";

/**
 * 100% Offline Vector SVG Cartoon Racer Characters with REAL Animated Action Rigs!
 * - Fancy / Running: Sprinting mascot with pumping legs, swinging arms, bouncing torso, fluttering cape.
 * - Swimming: Front-crawl freestyle with rotating windmill arms, flutter kicks, water ripples & splash!
 * - BMX Bike: Fast spinning spoke wheels, rotating pedals, leaning rider in helmet with vibration!
 * - Sack Race: Squash-and-stretch hopping physics with dynamic ground shadow!
 * - Turtle: Crawling shell with paddling flippers and bobbing head!
 * - Space Hopper: Bouncing high on rubber hopper ball!
 * 
 * Every student gets a distinct colorful avatar per game, with speech bubble pinned directly above head.
 */

// Mascot Roster for Fancy Dress / Running
export const CARTOON_CHARACTERS = [
  {
    id: "red_cape",
    nameKh: "វីរបុរសអាវក្រហម (Red Cape Hero)",
    bodyColor: "#1E293B",
    suitColor: "#EF4444",
    capeColor: "#DC2626",
    skinColor: "#FCD34D",
    hairColor: "#0F172A",
    type: "cape_hero"
  },
  {
    id: "orange_fox",
    nameKh: "កញ្ជ្រោងទឹកក្រូច (Orange Fox Mascot)",
    bodyColor: "#F97316",
    earColor: "#EA580C",
    innerEar: "#FED7AA",
    muzzleColor: "#FFF7ED",
    tailColor: "#EA580C",
    skinColor: "#FCD34D",
    type: "fox"
  },
  {
    id: "clown",
    nameKh: "ត្លុកសៀករីករាយ (Circus Clown)",
    bodyColor: "#06B6D4",
    hatColor: "#EC4899",
    pompomColor: "#FACC15",
    ruffleColor: "#F43F5E",
    noseColor: "#EF4444",
    skinColor: "#FDE68A",
    type: "clown"
  },
  {
    id: "green_dino",
    nameKh: "ដាយណូស័រខៀវខ្ចី (Green Dinosaur)",
    bodyColor: "#22C55E",
    bellyColor: "#86EFAC",
    spikeColor: "#EAB308",
    spotColor: "#16A34A",
    skinColor: "#86EFAC",
    type: "dino"
  },
  {
    id: "bat_hero",
    nameKh: "វីរបុរសប្រចៀវខ្មៅ (Bat Hero)",
    bodyColor: "#1E293B",
    suitColor: "#0F172A",
    capeColor: "#020617",
    skinColor: "#FCD34D",
    beltColor: "#F59E0B",
    type: "bat"
  },
  {
    id: "gray_cat",
    nameKh: "ឆ្មាប្រផេះគួរឱ្យស្រឡាញ់ (Gray Cat)",
    bodyColor: "#94A3B8",
    earColor: "#64748B",
    innerEar: "#F472B6",
    tailColor: "#64748B",
    skinColor: "#FED7AA",
    type: "cat"
  },
  {
    id: "super_bunny",
    nameKh: "ទន្សាយស៊ុបភើរ (Super Bunny Hero)",
    bodyColor: "#FFFFFF",
    skinColor: "#FFFFFF",
    earColor: "#FFFFFF",
    innerEar: "#F472B6",
    capeColor: "#3B82F6",
    beltColor: "#F59E0B",
    type: "bunny"
  },
  {
    id: "kungfu_panda",
    nameKh: "ខ្លាឃ្មុំផេនដា (Kung Fu Panda)",
    bodyColor: "#1E293B",
    skinColor: "#FFFFFF",
    headColor: "#FFFFFF",
    earColor: "#0F172A",
    headbandColor: "#EF4444",
    type: "panda"
  },
  {
    id: "lion_king",
    nameKh: "កូនតោអង់អាច (Little Lion King)",
    bodyColor: "#F59E0B",
    skinColor: "#FBBF24",
    maneColor: "#D97706",
    tailColor: "#F59E0B",
    tuftColor: "#92400E",
    type: "lion"
  },
  {
    id: "turbo_frog",
    nameKh: "កង្កែបល្បឿនលឿន (Turbo Frog)",
    bodyColor: "#22C55E",
    skinColor: "#22C55E",
    bellyColor: "#FEF08A",
    cheekColor: "#F472B6",
    type: "frog"
  },
  {
    id: "rocket_kid",
    nameKh: "ក្មេងយន្តហោះរ៉ុក្កែត (Rocket Jetpack Kid)",
    bodyColor: "#3B82F6",
    skinColor: "#FCD34D",
    helmetColor: "#64748B",
    goggleColor: "#38BDF8",
    rocketColor: "#94A3B8",
    type: "rocket_kid"
  },
  {
    id: "ninja",
    nameKh: "នីនចាអាថ៌កំបាំង (Shadow Ninja)",
    bodyColor: "#0F172A",
    skinColor: "#FCD34D",
    maskColor: "#1E293B",
    headbandColor: "#DC2626",
    swordColor: "#94A3B8",
    type: "ninja"
  },
  {
    id: "robot",
    nameKh: "រ៉ូបូតឆ្លាតវៃ (Cyber Bot 3000)",
    bodyColor: "#06B6D4",
    skinColor: "#67E8F9",
    jointColor: "#0891B2",
    antennaColor: "#F59E0B",
    eyeColor: "#22C55E",
    type: "robot"
  },
  {
    id: "astronaut",
    nameKh: "អវកាសយានិកតូច (Space Astronaut)",
    bodyColor: "#F1F5F9",
    skinColor: "#FCD34D",
    helmetColor: "#E2E8F0",
    visorColor: "#38BDF8",
    badgeColor: "#EF4444",
    type: "astronaut"
  },
  {
    id: "wizard",
    nameKh: "គ្រូមន្តអាគម (Magic Wizard)",
    bodyColor: "#7C3AED",
    hatColor: "#6D28D9",
    starColor: "#FACC15",
    beardColor: "#F1F5F9",
    skinColor: "#FDE68A",
    type: "wizard"
  },
  {
    id: "pirate",
    nameKh: "ចោរសមុទ្រក្លាហាន (Pirate Captain)",
    bodyColor: "#991B1B",
    hatColor: "#0F172A",
    skullColor: "#FFFFFF",
    eyepatchColor: "#000000",
    skinColor: "#FED7AA",
    type: "pirate"
  }
];

// Swimmer Palettes for distinct look per student
const SWIMMER_PALETTES = [
  { cap: "#0EA5E9", suit: "#0284C7", goggles: "#F43F5E", skin: "#FCD34D" },
  { cap: "#EC4899", suit: "#DB2777", goggles: "#10B981", skin: "#FDE68A" },
  { cap: "#F59E0B", suit: "#D97706", goggles: "#3B82F6", skin: "#FED7AA" },
  { cap: "#10B981", suit: "#059669", goggles: "#F59E0B", skin: "#FCD34D" },
  { cap: "#8B5CF6", suit: "#7C3AED", goggles: "#E11D48", skin: "#FDE68A" },
  { cap: "#EF4444", suit: "#DC2626", goggles: "#06B6D4", skin: "#FED7AA" },
  { cap: "#06B6D4", suit: "#0891B2", goggles: "#F97316", skin: "#FCD34D" },
  { cap: "#84CC16", suit: "#65A30D", goggles: "#8B5CF6", skin: "#FDE68A" },
];

// BMX Bike Palettes for distinct look per student
const BMX_PALETTES = [
  { frame: "#EF4444", helmet: "#DC2626", jersey: "#1E293B", wheelAccent: "#F87171" },
  { frame: "#10B981", helmet: "#059669", jersey: "#064E3B", wheelAccent: "#34D399" },
  { frame: "#3B82F6", helmet: "#2563EB", jersey: "#1E3A8A", wheelAccent: "#60A5FA" },
  { frame: "#F59E0B", helmet: "#D97706", jersey: "#78350F", wheelAccent: "#FBBF24" },
  { frame: "#8B5CF6", helmet: "#7C3AED", jersey: "#4C1D95", wheelAccent: "#A78BFA" },
  { frame: "#EC4899", helmet: "#DB2777", jersey: "#831843", wheelAccent: "#F472B6" },
  { frame: "#06B6D4", helmet: "#0891B2", jersey: "#164E63", wheelAccent: "#22D3EE" },
  { frame: "#F97316", helmet: "#EA580C", jersey: "#7C2D12", wheelAccent: "#FB923C" },
];

// Sack Race Palettes
const SACK_PALETTES = [
  { sack: "#D97706", patch: "#B45309", shirt: "#EF4444", headband: "#FCD34D" },
  { sack: "#059669", patch: "#047857", shirt: "#3B82F6", headband: "#FFFFFF" },
  { sack: "#CA8A04", patch: "#A16207", shirt: "#10B981", headband: "#F43F5E" },
  { sack: "#7C3AED", patch: "#6D28D9", shirt: "#F59E0B", headband: "#06B6D4" },
  { sack: "#DC2626", patch: "#B91C1C", shirt: "#8B5CF6", headband: "#FBBF24" },
  { sack: "#0284C7", patch: "#0369A1", shirt: "#EC4899", headband: "#10B981" },
];

// Turtle Palettes
const TURTLE_PALETTES = [
  { shell: "#059669", scute: "#10B981", rim: "#047857", bib: "#DC2626", skin: "#34D399" },
  { shell: "#0284C7", scute: "#38BDF8", rim: "#0369A1", bib: "#F59E0B", skin: "#22D3EE" },
  { shell: "#D97706", scute: "#FBBF24", rim: "#B45309", bib: "#EF4444", skin: "#4ADE80" },
  { shell: "#7C3AED", scute: "#A78BFA", rim: "#6D28D9", bib: "#10B981", skin: "#86EFAC" },
  { shell: "#DC2626", scute: "#F87171", rim: "#B91C1C", bib: "#3B82F6", skin: "#34D399" },
  { shell: "#0D9488", scute: "#2DD4BF", rim: "#0F766E", bib: "#F97316", skin: "#6EE7B7" },
];

// Canoe Race Palettes
const CANOE_PALETTES = [
  { boat: "#EF4444", rim: "#B91C1C", vest: "#F59E0B", cap: "#DC2626", paddle: "#78350F", blade: "#FBBF24" },
  { boat: "#3B82F6", rim: "#1D4ED8", vest: "#10B981", cap: "#2563EB", paddle: "#78350F", blade: "#60A5FA" },
  { boat: "#10B981", rim: "#047857", vest: "#F97316", cap: "#059669", paddle: "#78350F", blade: "#34D399" },
  { boat: "#F59E0B", rim: "#B45309", vest: "#EC4899", cap: "#D97706", paddle: "#78350F", blade: "#FDE68A" },
  { boat: "#8B5CF6", rim: "#6D28D9", vest: "#06B6D4", cap: "#7C3AED", paddle: "#78350F", blade: "#C4B5FD" },
  { boat: "#EC4899", rim: "#BE185D", vest: "#3B82F6", cap: "#DB2777", paddle: "#78350F", blade: "#F472B6" }
];

// Crane Claw Picker Palettes
const CLAW_PALETTES = [
  { claw: "#CBD5E1", joint: "#475569", prize: "#EC4899", glow: "#F472B6", accent: "#3B82F6" },
  { claw: "#CBD5E1", joint: "#475569", prize: "#10B981", glow: "#6EE7B7", accent: "#F59E0B" },
  { claw: "#CBD5E1", joint: "#475569", prize: "#3B82F6", glow: "#93C5FD", accent: "#EC4899" },
  { claw: "#CBD5E1", joint: "#475569", prize: "#8B5CF6", glow: "#C4B5FD", accent: "#10B981" },
  { claw: "#CBD5E1", joint: "#475569", prize: "#F59E0B", glow: "#FDE68A", accent: "#8B5CF6" },
  { claw: "#CBD5E1", joint: "#475569", prize: "#06B6D4", glow: "#67E8F9", accent: "#F97316" }
];

/**
 * Main Racer Sprite Component
 * Dynamically switches character model and animation based on game theme!
 */
export function RacerCostumeSprite({
  index = 0,
  bibNumber = 1,
  themeId = "fancy",
  isRacing = false,
  isWinning = false,
  studentName = "",
  studentId = "",
  isBoosting = false,
  scale = 1,
  speed = 1,
  durationSeconds = 10,
  isPaused = false,
  totalRacers = 6,
  colIndex = 0
}) {
  // Calculate dynamic action speed scale:
  // Base reference is a standard 10s race at speed 1.0 (speedFactor = 1.0).
  // A shorter sprint race (e.g. 5s) runs faster: (10 / 5) = 2.0x action speed.
  // A longer race (e.g. 30s) runs at steady marathon pace: (10 / 30) = 0.33x action speed.
  // A surge burst (isBoosting) adds +40% action intensity!
  const durationFactor = 10 / Math.max(3, durationSeconds || 10);
  const scaledDuration = Math.pow(durationFactor, 0.75); // gentle power curve for high usability
  const surgeMultiplier = isBoosting ? 1.4 : Math.max(0.85, Math.min(1.3, speed || 1));
  const speedFactor = Math.max(0.35, Math.min(2.8, scaledDuration * surgeMultiplier));
  const playState = isPaused ? "paused" : isRacing ? "running" : "paused";

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        "--speed-factor": speedFactor,
        "--anim-play-state": playState
      }}
      className={`relative flex flex-col items-center select-none transition-transform duration-200 ${isWinning ? "scale-115 z-30" : "z-10"
        }`}
    >
      {/* 1. Student Name & Bib Bubble Directly Above Character's Head */}
      <SpeechBubble
        number={bibNumber}
        name={studentName}
        studentId={studentId}
        isWinning={isWinning}
        totalRacers={totalRacers}
        colIndex={colIndex}
      />

      {/* 2. Theme-Specific Character Illustration Rig */}
      {themeId === "swimming" ? (
        <SwimmingRacerSprite
          index={index}
          bibNumber={bibNumber}
          isRacing={isRacing}
          isWinning={isWinning}
        />
      ) : themeId === "bmx" ? (
        <BMXRacerSprite
          index={index}
          bibNumber={bibNumber}
          isRacing={isRacing}
          isWinning={isWinning}
        />
      ) : themeId === "sack" ? (
        <SackRacerSprite
          index={index}
          bibNumber={bibNumber}
          isRacing={isRacing}
          isWinning={isWinning}
        />
      ) : themeId === "turtle" ? (
        <TurtleRacerSprite
          index={index}
          bibNumber={bibNumber}
          isRacing={isRacing}
          isWinning={isWinning}
        />
      ) : themeId === "canoe" ? (
        <CanoeRacerSprite
          index={index}
          bibNumber={bibNumber}
          isRacing={isRacing}
          isWinning={isWinning}
        />
      ) : themeId === "claw" || themeId === "eggspoon" ? (
        <CraneClawSprite
          index={index}
          bibNumber={bibNumber}
          isRacing={isRacing}
          isWinning={isWinning}
        />
      ) : themeId === "spacehopper" ? (
        <SpaceHopperRacerSprite
          index={index}
          bibNumber={bibNumber}
          isRacing={isRacing}
          isWinning={isWinning}
        />
      ) : (
        <RunningMascotSprite
          index={index}
          bibNumber={bibNumber}
          isRacing={isRacing}
          isWinning={isWinning}
        />
      )}
    </div>
  );
}

/**
 * 1. RUNNING MASCOT SPRITE (Olympic Running / Fancy Dress)
 * Authentic running animation with pumping legs, swinging arms, bouncing body, fluttering cape!
 */
function RunningMascotSprite({ index, bibNumber, isRacing, isWinning }) {
  const char = CARTOON_CHARACTERS[index % CARTOON_CHARACTERS.length];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-16 sm:w-20 h-20 sm:h-24 relative transition-transform ${isRacing ? "animate-running-cycle" : ""
          } ${isWinning ? "drop-shadow-[0_0_20px_rgba(245,158,11,1)]" : "drop-shadow-md"}`}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
          {/* Cape / Tail (Back layer) */}
          {char.type === "cape_hero" && (
            <path
              d="M32 46 Q 8 64 2 88 Q 22 78 38 60 Z"
              fill={char.capeColor}
              className={isRacing ? "animate-cape-billow" : ""}
            />
          )}
          {char.type === "bat" && (
            <path
              d="M32 46 Q 6 62 2 86 Q 20 76 36 60 Z"
              fill={char.capeColor}
              className={isRacing ? "animate-cape-billow" : ""}
            />
          )}
          {char.type === "bunny" && (
            <g>
              <path
                d="M32 46 Q 8 64 2 88 Q 22 78 38 60 Z"
                fill={char.capeColor}
                className={isRacing ? "animate-cape-billow" : ""}
              />
              <circle cx="28" cy="74" r="6" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
            </g>
          )}
          {char.type === "fox" && (
            <path
              d="M32 72 Q 6 62 4 84 Q 18 96 36 82 Z"
              fill={char.tailColor}
              stroke="#FFF"
              strokeWidth="2.5"
            />
          )}
          {char.type === "cat" && (
            <path
              d="M30 74 Q 8 68 10 90 Q 18 96 34 82 Z"
              fill={char.tailColor}
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          )}
          {char.type === "dino" && (
            <g>
              <path d="M32 70 Q 8 74 2 92 Q 22 96 38 82 Z" fill={char.bodyColor} />
              <polygon points="12,74 4,68 14,80" fill={char.spikeColor} />
              <polygon points="20,80 12,75 22,86" fill={char.spikeColor} />
              <polygon points="28,84 20,80 30,90" fill={char.spikeColor} />
            </g>
          )}

          {/* BACK LEG PUMPING */}
          <g className={isRacing ? "animate-running-leg-back" : ""}>
            <path
              d="M40 76 L26 98 L16 100"
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <ellipse cx="16" cy="100" rx="7" ry="4.5" fill="#DC2626" stroke="#000" strokeWidth="1" />
          </g>

          {/* TORSO BODY */}
          <g>
            <rect
              x="34"
              y="44"
              width="34"
              height="34"
              rx="12"
              fill={char.suitColor || char.bodyColor}
              stroke="#000000"
              strokeWidth="2.5"
            />
            {char.bellyColor && (
              <ellipse cx="51" cy="62" rx="11" ry="12" fill={char.bellyColor} />
            )}
            {char.spotColor && (
              <circle cx="60" cy="52" r="3.5" fill={char.spotColor} />
            )}
            {char.beltColor && (
              <rect x="34" y="66" width="34" height="6" fill={char.beltColor} />
            )}
          </g>

          {/* FRONT LEG PUMPING */}
          <g className={isRacing ? "animate-running-leg-front" : ""}>
            <path
              d="M56 76 L72 96 L84 98"
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <ellipse cx="84" cy="98" rx="7" ry="4.5" fill="#DC2626" stroke="#000" strokeWidth="1" />
          </g>

          {/* BACK ARM SWINGING */}
          <g className={isRacing ? "animate-running-arm-back" : ""}>
            <path
              d="M38 48 L22 56 L16 52"
              stroke={char.skinColor || "#FCD34D"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="52" r="4.5" fill={char.suitColor || char.bodyColor} />
          </g>

          {/* FRONT ARM SWINGING */}
          <g className={isRacing ? "animate-running-arm-front" : ""}>
            <path
              d="M60 48 L76 56 L86 52"
              stroke={char.skinColor || "#FCD34D"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="86" cy="52" r="4.5" fill={char.suitColor || char.bodyColor} />
          </g>

          {/* HEAD & FACE */}
          <g>
            {/* Animal Ears */}
            {char.type === "fox" && (
              <g>
                <polygon points="38,22 44,4 52,20" fill={char.earColor} stroke="#000" strokeWidth="1.5" />
                <polygon points="41,20 45,8 49,18" fill={char.innerEar} />
                <polygon points="56,20 64,4 70,22" fill={char.earColor} stroke="#000" strokeWidth="1.5" />
                <polygon points="59,18 63,8 67,20" fill={char.innerEar} />
              </g>
            )}
            {char.type === "cat" && (
              <g>
                <polygon points="38,20 43,6 50,18" fill={char.earColor} stroke="#000" strokeWidth="1.5" />
                <polygon points="58,18 65,6 70,20" fill={char.earColor} stroke="#000" strokeWidth="1.5" />
              </g>
            )}
            {char.type === "bunny" && (
              <g>
                <ellipse cx="42" cy="8" rx="5" ry="16" fill="#FFF" stroke="#000" strokeWidth="1.5" />
                <ellipse cx="42" cy="8" rx="2.5" ry="11" fill="#F472B6" />
                <ellipse cx="62" cy="8" rx="5" ry="16" fill="#FFF" stroke="#000" strokeWidth="1.5" />
                <ellipse cx="62" cy="8" rx="2.5" ry="11" fill="#F472B6" />
              </g>
            )}
            {char.type === "clown" && (
              <g>
                <polygon points="40,20 52,0 64,20" fill={char.hatColor} stroke="#000" strokeWidth="1.5" />
                <circle cx="52" cy="0" r="5" fill={char.pompomColor} />
              </g>
            )}
            {char.type === "bat" && (
              <g>
                <polygon points="40,18 44,6 48,18" fill="#0F172A" stroke="#000" strokeWidth="1.5" />
                <polygon points="58,18 62,6 66,18" fill="#0F172A" stroke="#000" strokeWidth="1.5" />
              </g>
            )}

            {/* Head Circle */}
            <circle
              cx="52"
              cy="28"
              r="17"
              fill={char.skinColor || "#FCD34D"}
              stroke="#000000"
              strokeWidth="2.5"
            />

            {/* Eyes */}
            <ellipse cx="48" cy="26" rx="3.5" ry="4" fill="#000" />
            <ellipse cx="58" cy="26" rx="3.5" ry="4" fill="#000" />
            <circle cx="49" cy="24.5" r="1.2" fill="#FFF" />
            <circle cx="59" cy="24.5" r="1.2" fill="#FFF" />

            {/* Nose & Smile */}
            {char.type === "clown" ? (
              <circle cx="53" cy="31" r="4" fill="#EF4444" stroke="#000" strokeWidth="1" />
            ) : (
              <circle cx="53" cy="30" r="1.5" fill="#000" />
            )}
            <path d="M48 35 Q 53 39 58 35" stroke="#000" strokeWidth="2" fill="none" />
          </g>

          {/* BIB NUMBER PINNED ON CHEST */}
          <g>
            <rect
              x="42"
              y="52"
              width="20"
              height="16"
              rx="3"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2"
            />
            <text
              x="52"
              y="64.5"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="11"
              fontWeight="900"
              textAnchor="middle"
              fill="#000000"
            >
              {bibNumber}
            </text>
          </g>
        </svg>
      </div>

      {/* Ground Cast Shadow */}
      <div className="w-14 sm:w-16 h-3 bg-black/25 rounded-full blur-[1.5px] -mt-1" />
    </div>
  );
}

/**
 * 2. SWIMMING RACER SPRITE (Swimming Timer)
 * Front-crawl freestyle with rotating windmill arms, flutter kicking feet, water ripples and splashes!
 */
function SwimmingRacerSprite({ index, bibNumber, isRacing, isWinning }) {
  const p = SWIMMER_PALETTES[index % SWIMMER_PALETTES.length];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-20 sm:w-24 h-16 sm:h-20 relative transition-transform ${isRacing ? "animate-swim-body-bob" : ""
          } ${isWinning ? "drop-shadow-[0_0_20px_rgba(56,189,248,1)]" : "drop-shadow-md"}`}
      >
        <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible">
          {/* WATER SURFACE & SPLASHES (Bottom Layer) */}
          <g className={isRacing ? "animate-water-ripple" : ""}>
            <ellipse cx="60" cy="62" rx="46" ry="12" fill="#38BDF8" opacity="0.3" />
            <path
              d="M10 64 Q 35 58 60 64 T 110 64"
              stroke="#E0F2FE"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* KICKING LEGS (Flutter kick in water) */}
          <g className={isRacing ? "animate-swim-kick-top" : ""}>
            <path
              d="M26 50 L10 44 L4 46"
              stroke={p.skin}
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Swim fin / foot */}
            <polygon points="6,44 0,40 2,48" fill={p.cap} />
          </g>
          <g className={isRacing ? "animate-swim-kick-bottom" : ""}>
            <path
              d="M26 54 L12 60 L6 62"
              stroke={p.skin}
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Swim fin / foot */}
            <polygon points="8,58 2,64 4,56" fill={p.cap} />
          </g>

          {/* SWIMMING TORSO */}
          <g>
            <ellipse
              cx="52"
              cy="52"
              rx="24"
              ry="14"
              fill={p.suit}
              stroke="#000000"
              strokeWidth="2.5"
            />
            {/* Racing stripes on swimsuit */}
            <path d="M42 42 Q 54 48 64 44" stroke="#FFF" strokeWidth="2" fill="none" />
          </g>

          {/* SWIMMER HEAD WITH CAP & GOGGLES */}
          <g>
            {/* Head circle */}
            <circle cx="76" cy="46" r="14" fill={p.skin} stroke="#000" strokeWidth="2.5" />

            {/* Swim Cap */}
            <path
              d="M64 42 Q 76 30 88 42 Z"
              fill={p.cap}
              stroke="#000"
              strokeWidth="2"
            />

            {/* Swim Goggles with shiny lenses */}
            <g>
              <rect x="74" y="42" width="12" height="7" rx="3.5" fill={p.goggles} stroke="#000" strokeWidth="1.5" />
              <circle cx="80" cy="45.5" r="2.5" fill="#E0F2FE" />
              <circle cx="81" cy="44.5" r="1" fill="#FFF" />
              {/* Goggle strap around back of head */}
              <path d="M64 46 L74 46" stroke="#000" strokeWidth="2" />
            </g>

            {/* Breathing Mouth */}
            <ellipse cx="86" cy="51" rx="2.5" ry="1.5" fill="#000" />
          </g>

          {/* ROTATING WINDMILL ARMS (Front-crawl freestyle!) */}
          {/* Left Arm (180 deg offset) */}
          <g className={isRacing ? "animate-swim-stroke-left" : ""}>
            <path
              d="M54 52 L68 30 L80 26"
              stroke={p.skin}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="80" cy="26" r="4" fill={p.skin} />
          </g>

          {/* Right Arm (Main forward stroke) */}
          <g className={isRacing ? "animate-swim-stroke-right" : ""}>
            <path
              d="M54 52 L68 74 L82 78"
              stroke={p.skin}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="82" cy="78" r="4" fill={p.skin} />
          </g>

          {/* WATER SPRAY & FOAM at front of swimmer */}
          <g className={isRacing ? "animate-pulse" : ""}>
            <circle cx="94" cy="58" r="3" fill="#FFFFFF" opacity="0.8" />
            <circle cx="98" cy="52" r="2" fill="#FFFFFF" opacity="0.8" />
            <circle cx="90" cy="62" r="2" fill="#E0F2FE" />
          </g>

          {/* BIB NUMBER BADGE ON SWIMMER'S BACK */}
          <g>
            <circle cx="48" cy="52" r="8" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
            <text
              x="48"
              y="56"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="9.5"
              fontWeight="900"
              textAnchor="middle"
              fill="#000000"
            >
              {bibNumber}
            </text>
          </g>
        </svg>
      </div>

      {/* Blue pool water reflection shadow */}
      <div className="w-18 sm:w-22 h-2.5 bg-cyan-700/30 rounded-full blur-[1px] -mt-1" />
    </div>
  );
}

/**
 * 3. BMX BIKE RACER SPRITE (BMX Bike Timer)
 * Spinning wheels, rotating pedal crank, leaning rider with helmet visor and high-speed vibration!
 */
function BMXRacerSprite({ index, bibNumber, isRacing, isWinning }) {
  const p = BMX_PALETTES[index % BMX_PALETTES.length];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-20 sm:w-24 h-20 sm:h-24 relative transition-transform ${isRacing ? "animate-bike-vibration" : ""
          } ${isWinning ? "drop-shadow-[0_0_20px_rgba(245,158,11,1)]" : "drop-shadow-md"}`}
      >
        <svg viewBox="0 0 120 100" className="w-full h-full overflow-visible">
          {/* REAR WHEEL (Spokes spin 360deg!) */}
          <g transform="translate(26, 72)">
            {/* Tire & Rim */}
            <circle cx="0" cy="0" r="18" fill="none" stroke="#1E293B" strokeWidth="5" />
            <circle cx="0" cy="0" r="15" fill="none" stroke={p.wheelAccent} strokeWidth="2" />
            <circle cx="0" cy="0" r="3.5" fill="#000" />
            {/* Spinning Spokes */}
            <g className={isRacing ? "animate-wheel-spin" : ""}>
              <line x1="-15" y1="0" x2="15" y2="0" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="0" y1="-15" x2="0" y2="15" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="-11" y1="-11" x2="11" y2="11" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="-11" y1="11" x2="11" y2="-11" stroke="#CBD5E1" strokeWidth="1.5" />
            </g>
          </g>

          {/* FRONT WHEEL (Spokes spin 360deg!) */}
          <g transform="translate(94, 72)">
            {/* Tire & Rim */}
            <circle cx="0" cy="0" r="18" fill="none" stroke="#1E293B" strokeWidth="5" />
            <circle cx="0" cy="0" r="15" fill="none" stroke={p.wheelAccent} strokeWidth="2" />
            <circle cx="0" cy="0" r="3.5" fill="#000" />
            {/* Spinning Spokes */}
            <g className={isRacing ? "animate-wheel-spin" : ""}>
              <line x1="-15" y1="0" x2="15" y2="0" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="0" y1="-15" x2="0" y2="15" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="-11" y1="-11" x2="11" y2="11" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="-11" y1="11" x2="11" y2="-11" stroke="#CBD5E1" strokeWidth="1.5" />
            </g>
          </g>

          {/* BMX BIKE FRAME (Vivid diamond geometry) */}
          <g>
            {/* Chainstay: Rear Hub (26, 72) -> Bottom Bracket (56, 72) */}
            <line x1="26" y1="72" x2="56" y2="72" stroke={p.frame} strokeWidth="4" strokeLinecap="round" />
            {/* Seatstay: Rear Hub (26, 72) -> Seat Junction (46, 48) */}
            <line x1="26" y1="72" x2="46" y2="48" stroke={p.frame} strokeWidth="4" strokeLinecap="round" />
            {/* Seat tube: Seat Junction (46, 48) -> Bottom Bracket (56, 72) */}
            <line x1="46" y1="48" x2="56" y2="72" stroke={p.frame} strokeWidth="4" strokeLinecap="round" />
            {/* Top tube: Seat Junction (46, 48) -> Headtube (82, 46) */}
            <line x1="46" y1="48" x2="82" y2="46" stroke={p.frame} strokeWidth="4" strokeLinecap="round" />
            {/* Downtube: Bottom Bracket (56, 72) -> Headtube (82, 46) */}
            <line x1="56" y1="72" x2="82" y2="46" stroke={p.frame} strokeWidth="4" strokeLinecap="round" />
            {/* Front Fork: Headtube (82, 46) -> Front Hub (94, 72) */}
            <line x1="82" y1="46" x2="94" y2="72" stroke={p.frame} strokeWidth="4" strokeLinecap="round" />

            {/* Saddle / Bike Seat */}
            <path d="M40 44 Q 48 44 54 47 Z" fill="#0F172A" stroke="#000" strokeWidth="1.5" />

            {/* BMX Handlebars with crossbar */}
            <line x1="82" y1="46" x2="84" y2="34" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <line x1="80" y1="34" x2="88" y2="34" stroke="#000" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* ROTATING PEDAL CRANK & RIDER FEET */}
          <g transform="translate(56, 72)">
            <circle cx="0" cy="0" r="6" fill="#000" />
            <g className={isRacing ? "animate-bike-pedal" : ""}>
              {/* Crank arms */}
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
              {/* Top pedal & shoe */}
              <rect x="-4" y="-10" width="8" height="3" fill="#EF4444" rx="1" />
              {/* Bottom pedal & shoe */}
              <rect x="-4" y="7" width="8" height="3" fill="#EF4444" rx="1" />
            </g>
          </g>

          {/* RIDER BODY (Leaning forward aggressively) */}
          <g>
            {/* Torso */}
            <path
              d="M48 46 L68 36 L74 48 L56 56 Z"
              fill={p.jersey}
              stroke="#000000"
              strokeWidth="2"
            />

            {/* Rider Legs pushing on pedals */}
            <path
              d="M52 50 L60 62 L56 70"
              stroke="#0F172A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Arms reaching for handlebars */}
            <path
              d="M68 38 L82 36"
              stroke="#FCD34D"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </g>

          {/* RIDER HEAD & BMX HELMET WITH VISOR */}
          <g>
            {/* Head */}
            <circle cx="76" cy="24" r="12" fill="#FCD34D" stroke="#000" strokeWidth="2" />
            {/* BMX Full Face Helmet */}
            <path
              d="M66 22 Q 76 10 88 20 Q 90 28 82 32 L 68 28 Z"
              fill={p.helmet}
              stroke="#000"
              strokeWidth="2"
            />
            {/* Helmet Visor */}
            <polygon points="86,18 96,16 88,24" fill="#000000" />
            {/* Goggle strap */}
            <rect x="72" y="22" width="14" height="4" rx="2" fill="#000" />
          </g>

          {/* BIB NUMBER ON RIDER'S BACK */}
          <g>
            <circle cx="58" cy="44" r="7.5" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
            <text
              x="58"
              y="47.5"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="9"
              fontWeight="900"
              textAnchor="middle"
              fill="#000000"
            >
              {bibNumber}
            </text>
          </g>
        </svg>
      </div>

      {/* Bike Ground Shadow */}
      <div className="w-18 sm:w-22 h-3 bg-black/25 rounded-full blur-[1.5px] -mt-1" />
    </div>
  );
}

/**
 * 4. SACK RACER SPRITE (Sack Race Timer)
 * Authentic squash-and-stretch hopping physics with dynamic ground shadow!
 */
function SackRacerSprite({ index, bibNumber, isRacing, isWinning }) {
  const p = SACK_PALETTES[index % SACK_PALETTES.length];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-16 sm:w-20 h-22 sm:h-26 relative transition-transform ${isRacing ? "animate-sack-hop" : ""
          } ${isWinning ? "drop-shadow-[0_0_20px_rgba(245,158,11,1)]" : "drop-shadow-md"}`}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
          {/* BURLAP SACK BODY (Tied at top) */}
          <g>
            <path
              d="M26 62 Q 18 96 28 108 Q 50 114 74 108 Q 84 96 76 62 Z"
              fill={p.sack}
              stroke="#000000"
              strokeWidth="2.5"
            />
            {/* Sack Top Tied Rim */}
            <ellipse cx="51" cy="62" rx="26" ry="6" fill="#B45309" stroke="#000" strokeWidth="2" />
            <line x1="32" y1="62" x2="70" y2="62" stroke="#78350F" strokeWidth="2" strokeDasharray="3,2" />

            {/* Burlap Patches */}
            <rect x="34" y="82" width="12" height="12" rx="2" fill={p.patch} stroke="#000" strokeWidth="1" />
            <line x1="36" y1="82" x2="36" y2="94" stroke="#451A03" strokeWidth="1" />
            <line x1="42" y1="82" x2="42" y2="94" stroke="#451A03" strokeWidth="1" />
          </g>

          {/* RACER TORSO & SHIRT */}
          <g>
            <rect
              x="36"
              y="42"
              width="30"
              height="22"
              rx="8"
              fill={p.shirt}
              stroke="#000000"
              strokeWidth="2.5"
            />
          </g>

          {/* HANDS GRIPPING SACK RIM */}
          <g>
            <circle cx="30" cy="62" r="5" fill="#FCD34D" stroke="#000" strokeWidth="1.5" />
            <circle cx="72" cy="62" r="5" fill="#FCD34D" stroke="#000" strokeWidth="1.5" />
          </g>

          {/* HEAD WITH HEADBAND */}
          <g>
            <circle cx="51" cy="28" r="16" fill="#FCD34D" stroke="#000" strokeWidth="2.5" />
            {/* Headband */}
            <rect x="35" y="20" width="32" height="6" rx="2" fill={p.headband} stroke="#000" strokeWidth="1.5" />
            <polygon points="34,22 28,16 34,28" fill={p.headband} />

            {/* Eyes */}
            <ellipse cx="46" cy="28" rx="3.5" ry="4" fill="#000" />
            <ellipse cx="56" cy="28" rx="3.5" ry="4" fill="#000" />
            <circle cx="47" cy="26.5" r="1.2" fill="#FFF" />
            <circle cx="57" cy="26.5" r="1.2" fill="#FFF" />

            {/* Big Determined Smile */}
            <path d="M46 36 Q 51 41 56 36" stroke="#000" strokeWidth="2" fill="none" />
          </g>

          {/* BIB NUMBER ON SACK */}
          <g>
            <rect
              x="42"
              y="74"
              width="18"
              height="16"
              rx="3"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2"
            />
            <text
              x="51"
              y="86.5"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="11"
              fontWeight="900"
              textAnchor="middle"
              fill="#000000"
            >
              {bibNumber}
            </text>
          </g>
        </svg>
      </div>

      {/* Dynamic Ground Shadow that shrinks during jump */}
      <div
        className={`w-14 sm:w-16 h-3.5 bg-black/30 rounded-full blur-[1.5px] -mt-1 ${isRacing ? "animate-sack-shadow" : ""
          }`}
      />
    </div>
  );
}

/**
 * 5. TURTLE RACER SPRITE (Fancy Dress Turtle - Bib 88 style)
 * Cute crawling turtle with paddling flippers and bobbing head!
 */
function TurtleRacerSprite({ index, bibNumber, isRacing, isWinning }) {
  const p = TURTLE_PALETTES[index % TURTLE_PALETTES.length];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-20 sm:w-24 h-16 sm:h-20 relative transition-transform ${isWinning ? "drop-shadow-[0_0_20px_rgba(52,211,153,1)]" : "drop-shadow-md"
          }`}
      >
        <svg viewBox="0 0 120 80" className="w-full h-full overflow-visible">
          {/* REAR PADDLING FLIPPER */}
          <g className={isRacing ? "animate-turtle-paddle-back" : ""}>
            <ellipse cx="28" cy="54" rx="12" ry="6" fill={p.skin} stroke="#000" strokeWidth="2" />
          </g>

          {/* TURTLE TAIL */}
          <polygon points="18,46 6,48 18,52" fill={p.skin} stroke="#000" strokeWidth="1.5" />

          {/* TURTLE SHELL (Domed with scute pattern) */}
          <g>
            {/* Shell Body */}
            <ellipse
              cx="54"
              cy="44"
              rx="32"
              ry="22"
              fill={p.shell}
              stroke="#000000"
              strokeWidth="3"
            />
            {/* Scute Hexagons */}
            <polygon points="46,32 58,32 64,40 58,48 46,48 40,40" fill={p.scute} stroke={p.rim} strokeWidth="1.5" />
            <polygon points="30,38 38,34 40,44 32,48" fill={p.scute} stroke={p.rim} strokeWidth="1.2" />
            <polygon points="68,36 76,40 74,48 66,46" fill={p.scute} stroke={p.rim} strokeWidth="1.2" />

            {/* Shell Rim */}
            <path
              d="M24 50 Q 54 58 84 50"
              stroke={p.rim}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* FRONT PADDLING FLIPPER */}
          <g className={isRacing ? "animate-turtle-paddle-front" : ""}>
            <ellipse cx="76" cy="54" rx="14" ry="7" fill={p.skin} stroke="#000" strokeWidth="2" />
          </g>

          {/* BOBBING TURTLE HEAD */}
          <g className={isRacing ? "animate-turtle-head" : ""}>
            {/* Head */}
            <circle cx="94" cy="40" r="13" fill={p.skin} stroke="#000" strokeWidth="2.5" />
            {/* Big Friendly Eyes */}
            <circle cx="98" cy="36" r="4.5" fill="#FFF" stroke="#000" strokeWidth="1.5" />
            <circle cx="99.5" cy="36" r="2.5" fill="#000" />
            <circle cx="100.5" cy="35" r="1" fill="#FFF" />
            {/* Smiling Beak */}
            <path d="M96 46 Q 102 46 104 42" stroke="#000" strokeWidth="2" fill="none" />
          </g>

          {/* BIB NUMBER PINNED ON SHELL */}
          <g>
            <rect
              x="44"
              y="36"
              width="18"
              height="15"
              rx="3"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2"
            />
            <text
              x="53"
              y="48"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="10"
              fontWeight="900"
              textAnchor="middle"
              fill="#000000"
            >
              {bibNumber}
            </text>
          </g>
        </svg>
      </div>

      {/* Ground Shadow */}
      <div className="w-18 sm:w-22 h-3 bg-black/25 rounded-full blur-[1.5px] -mt-1" />
    </div>
  );
}

/**
 * 6. SPACE HOPPER RACER SPRITE (Space Hopper Race)
 * Bouncing rubber ball with handles and squash & stretch!
 */
function SpaceHopperRacerSprite({ index, bibNumber, isRacing, isWinning }) {
  const ballColors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
  const ballColor = ballColors[index % ballColors.length];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-18 sm:w-22 h-22 sm:h-26 relative transition-transform ${isRacing ? "animate-hopper-bounce" : ""
          } ${isWinning ? "drop-shadow-[0_0_20px_rgba(245,158,11,1)]" : "drop-shadow-md"}`}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
          {/* GIANT RUBBER HOPPER BALL */}
          <g>
            <circle cx="50" cy="84" r="26" fill={ballColor} stroke="#000" strokeWidth="3" />
            {/* Ball Highlight */}
            <ellipse cx="40" cy="74" rx="8" ry="4" fill="#FFF" opacity="0.4" />
            {/* Horned Handles */}
            <path d="M42 60 L38 48" stroke="#000" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M58 60 L62 48" stroke="#000" strokeWidth="4.5" strokeLinecap="round" />
          </g>

          {/* RIDER SITTING ON TOP */}
          <g>
            {/* Torso */}
            <rect x="38" y="38" width="24" height="22" rx="8" fill="#1E293B" stroke="#000" strokeWidth="2" />
            {/* Hands gripping handles */}
            <circle cx="38" cy="48" r="4.5" fill="#FCD34D" stroke="#000" strokeWidth="1.5" />
            <circle cx="62" cy="48" r="4.5" fill="#FCD34D" stroke="#000" strokeWidth="1.5" />
            {/* Legs bent around ball */}
            <path d="M38 56 Q 30 68 36 78" stroke="#0F172A" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <path d="M62 56 Q 70 68 64 78" stroke="#0F172A" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          </g>

          {/* HEAD */}
          <g>
            <circle cx="50" cy="24" r="14" fill="#FCD34D" stroke="#000" strokeWidth="2.5" />
            {/* Big Smile */}
            <ellipse cx="46" cy="22" rx="3" ry="3.5" fill="#000" />
            <ellipse cx="54" cy="22" rx="3" ry="3.5" fill="#000" />
            <path d="M46 30 Q 50 34 54 30" stroke="#000" strokeWidth="2" fill="none" />
          </g>

          {/* BIB NUMBER ON HOPPER BALL */}
          <g>
            <circle cx="50" cy="84" r="9" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
            <text
              x="50"
              y="88"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="11"
              fontWeight="900"
              textAnchor="middle"
              fill="#000000"
            >
              {bibNumber}
            </text>
          </g>
        </svg>
      </div>

      {/* Ground Shadow */}
      <div className="w-16 sm:w-20 h-3.5 bg-black/30 rounded-full blur-[1.5px] -mt-1" />
    </div>
  );
}

/**
 * 7. CANOE RACER SPRITE (Canoe Race Timer)
 * Athletic canoe boat with cockpit in water, athlete in life jacket and cap,
 * rotating dual-blade paddle and water wake ripples!
 */
function CanoeRacerSprite({ index, bibNumber, isRacing, isWinning }) {
  const p = CANOE_PALETTES[index % CANOE_PALETTES.length];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-24 sm:w-28 h-20 sm:h-24 relative transition-transform ${isRacing ? "animate-canoe-bob" : ""
          } ${isWinning ? "drop-shadow-[0_0_20px_rgba(56,189,248,1)]" : "drop-shadow-md"}`}
      >
        <svg viewBox="0 0 130 90" className="w-full h-full overflow-visible">
          {/* WATER WAKE RIPPLES (Bottom Layer) */}
          <g>
            <ellipse cx="65" cy="74" rx="55" ry="10" fill="#38BDF8" opacity="0.35" />
            <path
              d="M10 74 Q 38 68 65 74 T 120 74"
              stroke="#E0F2FE"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Stern bow splashes */}
            <path d="M112 70 Q 120 73 125 76" stroke="#BAE6FD" strokeWidth="2" fill="none" />
            <path d="M12 70 Q 6 73 2 76" stroke="#BAE6FD" strokeWidth="2" fill="none" />
          </g>

          {/* ROTATING DUAL-BLADE PADDLE (Back blade layer) */}
          <g className={isRacing ? "animate-canoe-paddle" : ""}>
            {/* Paddle Shaft */}
            <line
              x1="30"
              y1="25"
              x2="90"
              y2="70"
              stroke={p.paddle}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Back Paddle Blade (Top Left) */}
            <path
              d="M24 20 C 20 16, 26 12, 34 18 C 38 22, 36 28, 30 25 Z"
              fill={p.blade}
              stroke="#000"
              strokeWidth="1.5"
            />
            {/* Front Paddle Blade (Bottom Right) */}
            <path
              d="M86 65 C 92 68, 98 74, 94 80 C 88 84, 82 78, 84 72 Z"
              fill={p.blade}
              stroke="#000"
              strokeWidth="1.5"
            />
          </g>

          {/* CANOE BOAT HULL (Aerodynamic tapered kayak hull) */}
          <g>
            {/* Main Hull */}
            <path
              d="M8 68 C 24 58, 106 58, 122 68 C 104 80, 26 80, 8 68 Z"
              fill={p.boat}
              stroke="#000000"
              strokeWidth="3"
            />
            {/* Hull Deck Rim / Cockpit */}
            <ellipse cx="65" cy="65" rx="24" ry="7" fill={p.rim} stroke="#000" strokeWidth="2" />
            <ellipse cx="65" cy="65" rx="18" ry="4.5" fill="#0F172A" />

            {/* Hull Racing Stripe */}
            <path
              d="M18 68 Q 65 62 112 68"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              fill="none"
              opacity="0.85"
            />
          </g>

          {/* ATHLETE PADDLER (Sitting inside cockpit) */}
          <g>
            {/* Life Vest Torso */}
            <path
              d="M52 42 L78 42 L80 62 L50 62 Z"
              fill={p.vest}
              stroke="#000000"
              strokeWidth="2.5"
            />
            {/* Life Vest Safety Buckles */}
            <line x1="56" y1="48" x2="74" y2="48" stroke="#000" strokeWidth="2" />
            <line x1="56" y1="54" x2="74" y2="54" stroke="#000" strokeWidth="2" />

            {/* Athletic Head with Cap */}
            <circle cx="65" cy="28" r="13" fill="#FCD34D" stroke="#000" strokeWidth="2.5" />
            {/* Sports Cap */}
            <path d="M52 26 C 52 14, 78 14, 78 26 Z" fill={p.cap} stroke="#000" strokeWidth="2" />
            {/* Cap Visor */}
            <path d="M68 24 L84 26 L76 28 Z" fill={p.cap} stroke="#000" strokeWidth="1.5" />

            {/* Focused Athletic Eyes & Smile */}
            <circle cx="70" cy="28" r="2.5" fill="#000" />
            <circle cx="71" cy="27.5" r="0.8" fill="#FFF" />
            <path d="M67 34 Q 72 37 75 33" stroke="#000" strokeWidth="1.8" fill="none" />

            {/* Paddler Arms gripping the paddle */}
            <path
              d="M52 46 Q 42 54 48 58"
              stroke="#F59E0B"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M78 46 Q 84 52 76 56"
              stroke="#F59E0B"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* BIB NUMBER PINNED ON CANOE BOW */}
          <g>
            <rect
              x="22"
              y="61"
              width="17"
              height="13"
              rx="3"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="1.8"
            />
            <text
              x="30.5"
              y="71.5"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="10"
              fontWeight="900"
              textAnchor="middle"
              fill="#000000"
            >
              {bibNumber}
            </text>
          </g>
        </svg>
      </div>

      {/* Water Reflection / Ripple */}
      <div className="w-22 sm:w-26 h-3 bg-sky-950/30 rounded-full blur-[2px] -mt-1" />
    </div>
  );
}

/**
 * 8. CRANE CLAW SPRITE (Crane Claw Picker)
 * Arcade mechanical crane claw with gantry trolley, caution stripes,
 * swinging steel cable, 3 chrome mechanical prongs gripping glowing prize capsule!
 */
function CraneClawSprite({ index, bibNumber, isRacing, isWinning }) {
  const p = CLAW_PALETTES[index % CLAW_PALETTES.length];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-20 sm:w-24 h-24 sm:h-28 relative transition-transform ${isRacing ? "animate-claw-sway" : ""
          } ${isWinning ? "drop-shadow-[0_0_24px_rgba(236,72,153,1)]" : "drop-shadow-lg"}`}
      >
        <svg viewBox="0 0 100 130" className="w-full h-full overflow-visible">
          {/* TOP OVERHEAD GANTRY TROLLEY (Moves along arcade ceiling rail) */}
          <g>
            <rect x="22" y="2" width="56" height="12" rx="3" fill="#1E293B" stroke="#000" strokeWidth="2" />
            {/* Diagonal Caution Hazard Stripes */}
            <clipPath id={`gantry-clip-${index}`}>
              <rect x="24" y="4" width="52" height="8" rx="2" />
            </clipPath>
            <g clipPath={`url(#gantry-clip-${index})`}>
              <rect x="20" y="2" width="60" height="12" fill="#F59E0B" />
              <polygon points="26,2 32,2 26,14 20,14" fill="#000" />
              <polygon points="38,2 44,2 38,14 32,14" fill="#000" />
              <polygon points="50,2 56,2 50,14 44,14" fill="#000" />
              <polygon points="62,2 68,2 62,14 56,14" fill="#000" />
              <polygon points="74,2 80,2 74,14 68,14" fill="#000" />
            </g>
            {/* Guide Rollers */}
            <circle cx="28" cy="2" r="3" fill="#94A3B8" stroke="#000" strokeWidth="1" />
            <circle cx="72" cy="2" r="3" fill="#94A3B8" stroke="#000" strokeWidth="1" />
          </g>

          {/* STEEL DROP HOIST CABLE */}
          <g>
            <line x1="50" y1="14" x2="50" y2="44" stroke="#94A3B8" strokeWidth="3" strokeDasharray="2,2" />
            <line x1="49" y1="14" x2="49" y2="44" stroke="#475569" strokeWidth="1" />
          </g>

          {/* MOTORIZED CLAW HOUSING & LED */}
          <g>
            <rect x="36" y="44" width="28" height="18" rx="5" fill="#334155" stroke="#000" strokeWidth="2.5" />
            {/* Chrome Plate */}
            <rect x="40" y="47" width="20" height="12" rx="3" fill="#E2E8F0" />
            {/* Arcade Status LED */}
            <circle cx="45" cy="53" r="2.5" fill={isRacing ? "#22C55E" : "#EF4444"} className="animate-pulse" />
            <circle cx="55" cy="53" r="2.5" fill="#3B82F6" />
            {/* Main Claw Center Pivot */}
            <circle cx="50" cy="62" r="5" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />
          </g>

          {/* 3-POINT ARTICULATED MECHANICAL CLAW PRONGS */}
          <g className={isRacing ? "animate-claw-grip" : ""}>
            {/* Left Claw Finger */}
            <path
              d="M45 62 L30 76 L26 94 L32 94 L36 80 L48 66 Z"
              fill={p.claw}
              stroke="#000000"
              strokeWidth="2"
            />
            {/* Left Joint Pin */}
            <circle cx="30" cy="76" r="3" fill={p.joint} stroke="#000" strokeWidth="1" />

            {/* Right Claw Finger */}
            <path
              d="M55 62 L70 76 L74 94 L68 94 L64 80 L52 66 Z"
              fill={p.claw}
              stroke="#000000"
              strokeWidth="2"
            />
            {/* Right Joint Pin */}
            <circle cx="70" cy="76" r="3" fill={p.joint} stroke="#000" strokeWidth="1" />

            {/* Center Back Stabilizer Claw */}
            <path
              d="M48 62 L48 76 L52 76 L52 62 Z"
              fill={p.joint}
              stroke="#000"
              strokeWidth="1.5"
            />
          </g>

          {/* GLOWING PRIZE CAPSULE GRIPPED IN CLAW */}
          <g>
            {/* Outer Neon Glow */}
            <circle cx="50" cy="88" r="20" fill={p.glow} opacity="0.3" className="animate-ping" />
            {/* Capsule Body */}
            <circle
              cx="50"
              cy="88"
              r="17"
              fill={p.prize}
              stroke="#000000"
              strokeWidth="2.5"
            />
            {/* Shiny Glass Highlight */}
            <path
              d="M38 78 Q 45 74 54 74"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />

            {/* White Bib Number Plaque inside Capsule */}
            <circle cx="50" cy="88" r="10.5" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
            <text
              x="50"
              y="92.5"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12"
              fontWeight="900"
              textAnchor="middle"
              fill="#000000"
            >
              {bibNumber}
            </text>
          </g>
        </svg>
      </div>

      {/* Arcade Floor Drop Shadow */}
      <div className="w-14 sm:w-16 h-3 bg-purple-950/40 rounded-full blur-[2px] -mt-1" />
    </div>
  );
}

/**
 * Speech Bubble with Student Name & Bib directly ABOVE character's head!
 * Matches uploaded screenshot: white bubble with pointer pointing down.
 */
function SpeechBubble({
  number,
  name = "",
  studentId = "",
  isWinning = false,
  totalRacers = 6,
  colIndex = 0
}) {
  const isCrowded = totalRacers > 16;

  // GLORIOUS WINNER BANNER (Shown prominently right above winner when crossing the finish line!)
  if (isWinning) {
    return (
      <div className="relative mb-2 flex flex-col items-center z-50 scale-125 animate-bounce">
        <div className="text-4xl filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] animate-pulse">
          👑
        </div>
        <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-2xl border-2 border-white ring-4 ring-amber-400 flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-sm">🏆 ជ័យលាភីលេខ ១:</span>
          <span className="text-amber-950 underline decoration-2 decoration-amber-600 font-black">
            {name}
          </span>
          <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
            {number}
          </span>
        </div>
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-amber-600" />
      </div>
    );
  }

  // ALL STUDENTS DISPLAY THEIR NAME BADGES (No more hidden names!)
  return (
    <div className="relative mb-1 transition-transform flex flex-col items-center z-20 group/bubble">
      {/* Name & Bib Badge Box */}
      <div
        className={`px-2 py-0.5 min-w-[32px] ${
          isCrowded ? "max-w-[105px] text-[10px]" : "max-w-[160px] text-xs"
        } rounded-xl flex items-center justify-center gap-1.5 shadow-md border-2 backdrop-blur-md transition-all bg-white/95 dark:bg-slate-900/95 border-black/80 dark:border-white/80 shadow-slate-950/15`}
        title={studentId ? `${name} (${studentId}) - លេខ #${number}` : `${name} - លេខ #${number}`}
      >
        {/* Small Bib Number Circle */}
        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 bg-black/15 dark:bg-white/20 text-black dark:text-white">
          {number}
        </span>

        {/* Student Name */}
        {name ? (
          <span className="font-sans font-black leading-tight truncate text-black dark:text-white">
            {name}
          </span>
        ) : null}
      </div>

      {/* Speech Pointer Tail pointing down directly to character's head */}
      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-black dark:border-t-white" />
      <div className="-mt-[4px] w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-white dark:border-t-slate-900" />

      {/* Tooltip on hover with student ID */}
      {studentId && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover/bubble:flex items-center px-2 py-0.5 bg-black/90 text-white rounded text-[9px] font-mono whitespace-nowrap z-50 pointer-events-none shadow-lg">
          អត្តលេខ: {studentId}
        </div>
      )}
    </div>
  );
}

/**
 * Calculates authentic staggered 3D depth starting grid coordinates:
 * All racers start clustered together at the starting line on the left in the SAME open arena.
 * Staggers odd columns vertically (honeycomb spacing) so NO two racers or boats overlap in the same Y axis!
 */
export function getRacerPlacement(idx, total, themeId = "running") {
  if (total <= 1) {
    return { startX: 120, bottomPercent: 36, zIndex: 30, colIndex: 0, rowIndex: 0 };
  }

  const isCanoe = themeId === "canoe";

  // 1. Classic Online-Stopwatch Stage (<= 8 racers, directly matching reference screenshot):
  // Big, prominent characters staggered diagonally across the start line
  if (total <= 8) {
    if (isCanoe) {
      // Clean, dedicated water lanes across the Olympic river course
      const bottomPercent = 14 + (idx / Math.max(1, total - 1)) * 62;
      const startX = 95 + (idx % 2 === 0 ? 15 : 0);
      const depthZ = 30 + (total - idx);
      return { startX, bottomPercent, zIndex: depthZ, colIndex: 0, rowIndex: idx };
    }
    // Exact diagonal starting tier matching reference screenshot:
    const xOffsets = [150, 110, 140, 175, 75, 115, 90, 150];
    const startX = xOffsets[idx % xOffsets.length];
    const bottomPercent = 10 + (idx / Math.max(1, total - 1)) * 58;
    const depthZ = 30 + (total - idx);
    return { startX, bottomPercent, zIndex: depthZ, colIndex: 0, rowIndex: idx };
  }

  // 2. Medium Classroom Heats (9 to 18 racers):
  if (total <= 18) {
    const verticalSlots = isCanoe ? 6 : 7;
    const rowSlot = idx % verticalSlots;
    const colSlot = Math.floor(idx / verticalSlots);
    const rowStep = isCanoe ? (58 / Math.max(1, verticalSlots - 1)) : (62 / Math.max(1, verticalSlots - 1));
    const verticalOffset = (colSlot % 2 === 1 ? rowStep * 0.48 : 0);
    const bottomPercent = (isCanoe ? 14 : 9) + rowSlot * rowStep + verticalOffset;
    const colSpacing = isCanoe ? 55 : 45;
    const startX = isCanoe
      ? (175 - colSlot * colSpacing + (rowSlot % 2 === 0 ? 12 : -8))
      : (185 - colSlot * colSpacing + (rowSlot % 2 === 0 ? 12 : -8));
    const depthZ = 20 + (verticalSlots - rowSlot) * 2 - colSlot;
    return { startX, bottomPercent, zIndex: depthZ, colIndex: colSlot, rowIndex: rowSlot };
  }

  // 3. Mass Marathon Field (e.g. 24, 60, or 111 students):
  // Dynamically calculate vertical slots and column slots so EVERY runner has their own unique starting position!
  const verticalSlots = isCanoe ? 8 : (total > 60 ? 10 : 8);
  const rowSlot = idx % verticalSlots;
  const colSlot = Math.floor(idx / verticalSlots);
  const totalCols = Math.ceil(total / verticalSlots);

  const rowStep = 62 / Math.max(1, verticalSlots - 1);
  const verticalOffset = (colSlot % 2 === 1 ? rowStep * 0.45 : 0);
  const bottomPercent = (isCanoe ? 12 : 8) + rowSlot * rowStep + verticalOffset;

  // Distribute columns cleanly across 30px to 480px starting pack:
  // Front columns start closer to start line (~480px) and trail backward towards staging area (~30px)
  const colGap = Math.min(45, Math.max(26, 450 / Math.max(1, totalCols - 1)));
  const baseFrontX = isCanoe ? 380 : 480;
  const startX = Math.max(25, baseFrontX - colSlot * colGap + ((rowSlot % 2 === 0) ? 14 : -10));
  
  // 3D perspective zIndex: runners lower on screen (front) and further right appear in front
  const depthZ = 20 + (verticalSlots - rowSlot) * 2 - colSlot;

  return { startX, bottomPercent, zIndex: depthZ, colIndex: colSlot, rowIndex: rowSlot };
}
