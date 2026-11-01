import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckSquare,
  Square,
  Play,
  RotateCcw,
  RefreshCw,
  Trophy,
  Timer,
  Sliders,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award
} from "lucide-react";

export const ALL_RACE_THEMES = [
  {
    id: "fancy",
    nameKh: "រ៉ូបសម្លៀកបំពាក់កំប្លែង (Fancy Dress Costumes)",
    descKh: "តួអង្គតុក្កតាចម្រុះ ២២ ម៉ូដ៖ ទន្សាយស៊ុបភើរ, ផេនដា, កូនតោ, កង្កែប, ក្មេងរ៉ុក្កែត, ចោរសមុទ្រ, មនុស្សយន្ត, យូនីខន, ស្វា, និនចា, និងវីរបុរស!",
    icon: "🎭",
    badge: "ដូចក្នុងរូបភាព Screenshot"
  },
  {
    id: "running",
    nameKh: "រត់ប្រណាំងកីឡាដ្ឋាន (Running Track Timer)",
    descKh: "អត្តពលិករត់ប្រណាំងលើផ្លូវអត្តពលកម្មអូឡាំពិកចម្ងាយ ១០០ ម៉ែត្រ",
    icon: "🏃‍♂️",
    badge: "Sports Themed"
  },
  {
    id: "turtle",
    nameKh: "ប្រណាំងអណ្តើកកំប្លែង (Fancy Dress Turtle - Bib 88)",
    descKh: "អណ្តើកពាក់ឈុតកំប្លែងជាមួយផ្លាកលេខ 88 រត់ប្រណាំងយឺតៗតែរំភើប",
    icon: "🐢",
    badge: "Funny Mascot"
  },
  {
    id: "sack",
    nameKh: "ប្រណាំងលោតបាវ (Sack Race Timer)",
    descKh: "កីឡាករលោតបាវក្នុងទិវាកីឡាសាលារៀន លោតផ្លោះឆ្ពោះទៅទីព្រ័ត្រ",
    icon: "🥔",
    badge: "Sports Day"
  },
  {
    id: "swimming",
    nameKh: "ប្រណាំងហែលទឹកអាងខៀវ (Swimming Timer)",
    descKh: "អាងហែលទឹកអូឡាំពិកខៀវស្រងាត់ ហែលប្រជែងយកជើងឯក",
    icon: "🏊‍♂️",
    badge: "Aquatics"
  },
  {
    id: "bmx",
    nameKh: "ប្រណាំងកង់ BMX (BMX Bike Timer)",
    descKh: "កីឡាករជិះកង់ BMX លើផ្លូវប្រណាំងឆ្លងកាត់ឧបសគ្គ",
    icon: "🚴‍♂️",
    badge: "Extreme"
  },
  {
    id: "spacehopper",
    nameKh: "ប្រណាំងបាល់លោត (Space Hopper Race)",
    descKh: "កីឡាករលោតលើបាល់យក្សពណ៌ក្រហមសប្បាយរីករាយ",
    icon: "🔴",
    badge: "Classic Fun"
  },
  {
    id: "claw",
    nameKh: "ម៉ាស៊ីនកៀបចាប់ឈ្មោះ (Crane Claw Picker)",
    descKh: "ដៃកៀបម៉ាស៊ីន Arcade កៀបដុំរង្វាន់ឈ្មោះសិស្សយ៉ាងរំភើប",
    icon: "🕹️",
    badge: "Arcade Claw"
  },
  {
    id: "canoe",
    nameKh: "ប្រណាំងទូកកានូ (Canoe Race Timer)",
    descKh: "កីឡាករចែវទូកកានូ បង្វិលផ្លែច្រវាលើផ្ទៃទឹកទន្លេយ៉ាងស្វាហាប់",
    icon: "🚣‍♂️",
    badge: "Water Race"
  }
];

export default function StudentRaceSetup({
  students = [],
  availableRooms = [],
  loading = false,
  error = null,
  onRefreshData,
  onStartRace,
  onBackToDashboard
}) {
  // Class selection state
  const [selectedClass, setSelectedClass] = useState("all");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  // Selected Student IDs Set
  const [selectedIds, setSelectedIds] = useState(() => {
    // Default select all available students on load
    return new Set(students.map((s) => s.studentId));
  });

  // Racer Subset count ("all" | 2 | 4 | 6 | 8 | 12 | 16)
  const [racerCountMode, setRacerCountMode] = useState(6);

  // Countdown timer presets & custom
  const [durationSeconds, setDurationSeconds] = useState(10);
  const [customDurationInput, setCustomDurationInput] = useState("10");

  // Selected Theme
  const [selectedTheme, setSelectedTheme] = useState(ALL_RACE_THEMES[0]);

  // When students prop changes, auto-select newly loaded students
  React.useEffect(() => {
    if (students.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(students.map((s) => s.studentId)));
    }
  }, [students]);

  // Filter students based on Class, Search query, and Gender
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Class filter
      if (selectedClass !== "all" && s.room !== selectedClass) return false;

      // Gender filter
      if (genderFilter !== "all") {
        const isFemale = s.gender === "ស្រី" || s.gender === "Female" || s.gender === "F";
        if (genderFilter === "female" && !isFemale) return false;
        if (genderFilter === "male" && isFemale) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const kh = (s.fullNameKh || "").toLowerCase();
        const en = (s.fullName || s.fullNameEn || "").toLowerCase();
        const id = (s.studentId || "").toLowerCase();
        return kh.includes(q) || en.includes(q) || id.includes(q);
      }

      return true;
    });
  }, [students, selectedClass, genderFilter, searchQuery]);

  // Selection handlers
  const handleToggleStudent = (studentId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredStudents.forEach((s) => next.add(s.studentId));
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Prepare participants and initiate start
  const handleLaunchRace = () => {
    const selectedList = students.filter((s) => selectedIds.has(s.studentId));
    if (selectedList.length === 0) return;

    let finalParticipants = [];
    if (racerCountMode === "all") {
      finalParticipants = [...selectedList];
    } else {
      const count = Number(racerCountMode) || 6;
      const shuffled = [...selectedList].sort(() => 0.5 - Math.random());
      finalParticipants = shuffled.slice(0, Math.min(count, selectedList.length));
    }

    onStartRace({
      participants: finalParticipants,
      durationSeconds: Number(durationSeconds) || 10,
      theme: selectedTheme,
      roomName: selectedClass === "all" ? "គ្រប់ថ្នាក់" : selectedClass
    });
  };

  const selectedCount = selectedIds.size;
  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every((s) => selectedIds.has(s.studentId));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ========================================================
            HEADER & BREADCRUMB
        ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
              <span>ផ្ទាំងគ្រប់គ្រង</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>សកម្មភាព & ហ្គេមក្នុងថ្នាក់</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-500 dark:text-slate-400">រៀបចំការប្រណាំង</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="text-3xl">🏁</span>
              <span>ល្បែងប្រណាំងជ្រើសរើសនិស្សិត (Student Picker Race Game)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              ជ្រើសរើសថ្នាក់ កំណត់និស្សិតចូលរួម និងចាប់ផ្តើមការប្រណាំងពេញអេក្រង់ (Full-Screen Mode) ដូចក្នុង Online-Stopwatch
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onRefreshData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="ទាញយកទិន្នន័យពី Server ឡើងវិញ"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
              <span>{loading ? "កំពុងផ្ទុក..." : "ធ្វើបច្ចុប្បន្នភាព"}</span>
            </button>

            <button
              type="button"
              onClick={onBackToDashboard}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ត្រឡប់ក្រោយ</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            ERROR STATE
        ======================================================== */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs sm:text-sm font-bold">
                {error || "បរាជ័យក្នុងការទាញយកទិន្នន័យ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ហើយព្យាយាមម្តងទៀត។"}
              </p>
            </div>
            <button
              type="button"
              onClick={onRefreshData}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {/* ========================================================
            STEP 1: SELECT CLASS & RACE SETTINGS
        ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: ជ្រើសរើសថ្នាក់ (Select Class) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>១. ជ្រើសរើសថ្នាក់ (Class Room)</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">គ្រប់ថ្នាក់ទាំងអស់ ({students.length} នាក់)</option>
              {availableRooms.map((r) => (
                <option key={r} value={r}>
                  បន្ទប់ {r} ({students.filter((s) => s.room === r).length} នាក់)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              ទិន្នន័យជាក់ស្តែងពីប្រព័ន្ធ: ថ្នាក់ដែលបានជ្រើសមានសិស្សចំនួន {filteredStudents.length} នាក់
            </p>
          </div>

          {/* Card 2: កំណត់ចំនួនអ្នកប្រណាំង (Racer Count) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>២. ចំនួនអ្នកប្រណាំង (Participants)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setRacerCountMode("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${racerCountMode === "all"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
              >
                ទាំងអស់ ({selectedCount} នាក់)
              </button>
              {[6, 8, 4, 2].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRacerCountMode(num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${racerCountMode === num
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                >
                  {num === 6 ? "៦ នាក់ (ដូចក្នុងរូប)" : num === 2 ? "1 vs 1" : `${num} នាក់`}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {racerCountMode === "all"
                ? "សិស្សទាំងអស់ដែលបានជ្រើសនឹងចូលរួមប្រណាំងព្រមគ្នា"
                : `ប្រព័ន្ធនឹងជ្រើសរើសចៃដន្យ ${racerCountMode} នាក់ ពីក្នុងចំណោមសិស្សដែលបានជ្រើស`}
            </p>
          </div>

          {/* Card 3: រយៈពេលប្រណាំង (Countdown Timer) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-500" />
              <span>៣. រយៈពេលប្រណាំង (Timer Duration)</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {[5, 10, 15, 30].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    setDurationSeconds(sec);
                    setCustomDurationInput(String(sec));
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${durationSeconds === sec
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                >
                  {sec}s
                </button>
              ))}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl">
                <input
                  type="number"
                  min="3"
                  max="300"
                  value={customDurationInput}
                  onChange={(e) => {
                    setCustomDurationInput(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (val > 0) setDurationSeconds(val);
                  }}
                  className="w-12 bg-transparent text-xs font-mono font-bold text-center focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-bold">វិនាទី</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              នាឡិកានឹងបង្ហាញ {durationSeconds} វិនាទី រួចរាប់ថយក្រោយដល់ 00:00:00
            </p>
          </div>
        </div>

        {/* ========================================================
            STEP 2: RACE THEME / COSTUME SELECTOR
        ======================================================== */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>៤. ជ្រើសរើសរចនាបថ និងតួអង្គប្រណាំង (Race Theme & Costumes)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ជ្រើសរើសម៉ូដតួអង្គកំប្លែងដូចក្នុងរូបភាព ឬប្រភេទកីឡាផ្សេងៗ
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {selectedTheme.nameKh.split("(")[0]}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ALL_RACE_THEMES.map((theme) => {
              const isSelected = selectedTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${isSelected
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 shadow-md shadow-blue-500/10 scale-102"
                      : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 hover:bg-slate-100/50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-1 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                      {theme.icon}
                    </span>
                    {theme.badge && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        {theme.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-snug">
                      {theme.nameKh.split("(")[0]}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {theme.descKh}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            STEP 3: SEARCHABLE STUDENT SELECTION LIST WITH CHECKBOXES
        ======================================================== */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>៥. បញ្ជីនិស្សិតដែលត្រូវចូលរួម (Student Roster)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                បានជ្រើសរើស <strong className="text-blue-600 font-black">{selectedCount}</strong> នាក់ ក្នុងចំណោមសរុប {filteredStudents.length} នាក់
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800 cursor-pointer transition-all"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>ជ្រើសរើសទាំងអស់</span>
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer transition-all"
              >
                <Square className="w-3.5 h-3.5" />
                <span>សម្អាតការជ្រើសរើស</span>
              </button>
            </div>
          </div>

          {/* Search Box & Gender Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះខ្មែរ, អង់គ្លេស ឬអត្តលេខ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              {[
                { id: "all", label: "ទាំងអស់" },
                { id: "female", label: "ស្រី" },
                { id: "male", label: "ប្រុស" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGenderFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${genderFilter === tab.id
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Student Rows Table / Grid */}
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">កំពុងទាញយកទិន្នន័យនិស្សិតពីប្រព័ន្ធ...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">
                មិនមានទិន្នន័យនិស្សិតនៅក្នុងថ្នាក់ ឬលក្ខខណ្ឌស្វែងរកនេះឡើយ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredStudents.map((s, idx) => {
                const isChecked = selectedIds.has(s.studentId);
                return (
                  <div
                    key={s.studentId || idx}
                    onClick={() => handleToggleStudent(s.studentId)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${isChecked
                        ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-500/80 shadow-xs"
                        : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => { }} // Handled by parent container click
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer pointer-events-none"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {s.fullNameKh || s.fullName || s.fullNameEn}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {s.studentId} • បន្ទប់ {s.room || "N"} • {s.gender || "ស្រី"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${isChecked
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                        }`}
                    >
                      {isChecked ? "បានរើស" : "មិនរើស"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            PRIMARY ACTION FOOTER
        ======================================================== */}
        <div className="sticky bottom-4 z-20 p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md">
              🏁
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                ត្រៀមប្រណាំង៖{" "}
                <strong className="text-blue-600 font-black">
                  {racerCountMode === "all" ? selectedCount : Math.min(Number(racerCountMode), selectedCount)} នាក់
                </strong>{" "}
                (ពី {selectedCount} នាក់ដែលបានរើស)
              </p>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                វិញ្ញាសា៖ {selectedTheme.nameKh.split("(")[0]} • រយៈពេល {durationSeconds} វិនាទី
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              ត្រឡប់ក្រោយ
            </button>

            <button
              type="button"
              onClick={handleLaunchRace}
              disabled={selectedCount === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-sm font-black shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>ចាប់ផ្តើមការប្រណាំង</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
