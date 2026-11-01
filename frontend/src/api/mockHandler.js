import { MOCK_STUDENTS as BASE_MOCK_STUDENTS, MOCK_STATS } from "./mockData.js";

// Persistent In-Browser Mock Store for Development & Demo
function getStoredStudents() {
  try {
    const raw = localStorage.getItem("mock_students_store");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [...BASE_MOCK_STUDENTS];
}

function saveStoredStudents(list) {
  try {
    localStorage.setItem("mock_students_store", JSON.stringify(list));
  } catch (e) {}
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem("mock_users_store");
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Initialize default users
  const defaults = [
    {
      userId: "USR-001",
      username: "admin",
      password: "admin2026",
      fullName: "អ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin)",
      role: "admin",
      studentId: "N/A",
      room: "",
      skill: "",
      status: "Active",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      userId: "USR-002",
      username: "teacher",
      password: "teacher2026",
      fullName: "សាស្ត្រាចារ្យ ធា លាង (Lecturer)",
      role: "teacher",
      studentId: "N/A",
      room: "",
      skill: "",
      status: "Active",
      createdAt: new Date().toISOString(),
      lastLogin: ""
    },
    {
      userId: "USR-003",
      username: "Leang",
      password: "2504",
      fullName: "លោកគ្រូ ធា លាង",
      role: "teacher",
      studentId: "N/A",
      room: "",
      skill: "",
      status: "Active",
      createdAt: new Date().toISOString(),
      lastLogin: ""
    }
  ];

  // Auto-seed students: Username = Student Name, Password = Student ID
  const students = getStoredStudents();
  students.forEach((stu, idx) => {
    defaults.push({
      userId: `USR-${String(idx + 4).padStart(3, "0")}`,
      username: stu.fullNameKh || stu.fullNameEn,
      password: stu.studentId, // Student ID as Password!
      fullName: stu.fullNameKh || stu.fullNameEn,
      fullNameKh: stu.fullNameKh || "",
      fullNameEn: stu.fullNameEn || "",
      role: "student",
      studentId: stu.studentId,
      room: stu.room || "",
      skill: stu.skill || "",
      status: stu.status || "Active",
      createdAt: new Date().toISOString(),
      lastLogin: ""
    });
  });

  return defaults;
}

function saveStoredUsers(list) {
  try {
    localStorage.setItem("mock_users_store", JSON.stringify(list));
  } catch (e) {}
}

function getStoredQuizzesConfig() {
  try {
    const raw = localStorage.getItem("mock_quizzes_config_store");
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Derive initial quiz config from first student who has quizBreakdown or fallback default 15
  const students = getStoredStudents();
  const sample = students.find((s) => s.academicSummary?.quizBreakdown?.length > 0);
  if (sample && sample.academicSummary.quizBreakdown.length > 0) {
    const list = sample.academicSummary.quizBreakdown.map((q, idx) => ({
      id: idx + 1,
      name: q.name,
      maxScore: q.maxScore || 10,
      createdAt: new Date().toISOString()
    }));
    saveStoredQuizzesConfig(list);
    return list;
  }

  const defaults = [
    { id: 1, name: "លំហាត់Email", maxScore: 10 },
    { id: 2, name: "ការងារក្រុម", maxScore: 20 },
    { id: 3, name: "លំហាត់ទី១", maxScore: 15 },
    { id: 4, name: "លំហាត់ទី២", maxScore: 20 },
    { id: 5, name: "លំហាត់ទី3", maxScore: 10 },
    { id: 6, name: "លំហាត់ទី4", maxScore: 30 },
    { id: 7, name: "លំហាត់ទី5", maxScore: 20 },
    { id: 8, name: "លំហាត់ទី6", maxScore: 20 },
    { id: 9, name: "លំហាត់ទី7", maxScore: 10 },
    { id: 10, name: "លំហាត់អនុវត្តទី១", maxScore: 10 },
    { id: 11, name: "លំហាត់អនុវត្តទី២", maxScore: 30 },
    { id: 12, name: "លំហាត់អនុវត្តទី៣", maxScore: 20 },
    { id: 13, name: "លំហាត់អនុវត្តExcel", maxScore: 10 },
    { id: 14, name: "Quiz 14", maxScore: 20 },
    { id: 15, name: "Quiz 15", maxScore: 10 }
  ];
  saveStoredQuizzesConfig(defaults);
  return defaults;
}

function saveStoredQuizzesConfig(list) {
  try {
    localStorage.setItem("mock_quizzes_config_store", JSON.stringify(list));
  } catch (e) {}
}

function recalculateStudentQuizTotal(student, quizzesConfig) {
  if (!student) return;
  if (!student.academicSummary) {
    student.academicSummary = { attendance: 10, totalQHA: 0, midterm: 0, finalScore: 0, totalScore: 10, overallGrade: "F" };
  }

  let breakdown = student.academicSummary.quizBreakdown || [];
  
  // Ensure every quiz in quizzesConfig has an entry in breakdown
  const updatedBreakdown = quizzesConfig.map((qz) => {
    const existing = breakdown.find((b) => b.name === qz.name);
    return {
      name: qz.name,
      score: existing && existing.score !== undefined && existing.score !== "" && existing.score !== null ? Number(existing.score) : (existing?.score === null ? null : null),
      maxScore: qz.maxScore || 10
    };
  });

  const totalMaxScore = quizzesConfig.reduce((acc, q) => acc + (Number(q.maxScore) || 10), 0);
  let rawTotalScore = 0;

  updatedBreakdown.forEach((item) => {
    if (item.score !== null && item.score !== undefined && item.score !== "" && !isNaN(item.score)) {
      rawTotalScore += Number(item.score);
    }
  });

  const scaledScore = totalMaxScore > 0 ? Math.round((rawTotalScore / totalMaxScore) * 15 * 100) / 100 : 0;
  const att = Number(student.academicSummary.attendance ?? 10);
  const mid = Number(student.academicSummary.midterm ?? 0);
  const fin = Number(student.academicSummary.finalScore ?? 0);
  const totalScore = Math.round((att + scaledScore + mid + fin) * 100) / 100;

  let grade = "F";
  if (totalScore >= 85) grade = "A";
  else if (totalScore >= 80) grade = "B+";
  else if (totalScore >= 70) grade = "B";
  else if (totalScore >= 65) grade = "C+";
  else if (totalScore >= 50) grade = "C";
  else if (totalScore >= 45) grade = "D";
  else if (totalScore >= 40) grade = "E";

  let qhaGrade = { label: "Needs Improvement (ខ្សោយ)", color: "text-rose-700", bg: "bg-rose-50" };
  if (scaledScore >= 12.75) {
    qhaGrade = { label: "Excellent (ល្អណាស់)", color: "text-emerald-700", bg: "bg-emerald-50" };
  } else if (scaledScore >= 10.5) {
    qhaGrade = { label: "Good (ល្អ)", color: "text-blue-700", bg: "bg-blue-50" };
  }

  student.academicSummary.totalQHA = scaledScore;
  student.academicSummary.qhaGrade = qhaGrade;
  student.academicSummary.totalScore = totalScore;
  student.academicSummary.overallGrade = grade;
  student.academicSummary.quizBreakdown = updatedBreakdown;

  if (Array.isArray(student.scores)) {
    const qhaIdx = student.scores.findIndex((s) => {
      const t = (s.assessment || "").toLowerCase();
      return t.includes("quiz") || t.includes("qha") || t.includes("សំណួរ") || t.includes("កិច្ចការ");
    });
    const qhaPct = Math.round((scaledScore / 15) * 100);
    const newEntry = {
      assessment: "សំណួរ និងកិច្ចការស្រាវជ្រាវ (Quizzes & Tasks)",
      score: scaledScore,
      maxScore: 15,
      weight: 15,
      percentage: qhaPct,
      breakdown: updatedBreakdown
    };
    if (qhaIdx !== -1) {
      student.scores[qhaIdx] = newEntry;
    } else {
      student.scores.push(newEntry);
    }
  }
}

/**
 * Simulates server responses for local development & Google Sheets fallback
 */
export async function handleMockRequest(action, params = {}) {
  // Simulate rapid network latency (100ms)
  await new Promise((r) => setTimeout(r, 100));

  let currentStudents = getStoredStudents();
  let currentUsers = getStoredUsers();

  switch (action) {
    case "sync_events":
      return {
        success: true,
        message: "Mock sync events retrieved",
        data: {
          events: [],
          serverTime: Date.now(),
          count: 0
        }
      };

    case "health":
      return {
        success: true,
        message: "ប្រព័ន្ធកំពុងដំណើរការក្នុងទម្រង់បង្ហាញសាកល្បង (Local Preview Mode)។",
        data: {
          status: "mock_online",
          api: "University Student Scoring API",
          spreadsheetConnected: true,
          spreadsheetTitle: "University Student Management System (Mock)",
          totalSheets: 5,
          sheetNames: ["📋_Students", "📝_Quizzes", "📊_Scoring", "⚙️_Config", "🔐_Users"],
          hasSeparatedSheets: true,
          hasUsersSheet: true,
          serverTime: new Date().toISOString()
        },
        error: null
      };

    // ==========================================
    // 🔐 UNIVERSAL USER LOGIN
    // ==========================================
    case "user_login":
    case "login": {
      let username = String(params.username || params.studentName || params.identifier || "").trim();
      let password = String(params.password || params.studentId || "").trim();
      const role = String(params.role || "").toLowerCase().trim();

      // Smart swap if ID entered in username and Name in password
      if (role === "student" || !role) {
        if (/^[a-zA-Z0-9\-_]+$/.test(username) && !/^[a-zA-Z0-9\-_]+$/.test(password)) {
          const t = username;
          username = password;
          password = t;
        }
      }

      if (!username || !password) {
        return { success: false, message: "សូមបញ្ចូលឈ្មោះគណនី និងលេខសម្ងាត់របស់អ្នក។", data: null, error: "MISSING_CREDENTIALS" };
      }

      const normUser = username.toLowerCase().replace(/\s+/g, "");
      const normPass = password.trim().toLowerCase();

      // Find in mock users
      const match = currentUsers.find((u) => {
        if (u.status && u.status.toLowerCase() !== "active") return false;

        if (u.role === "admin" || u.role === "teacher") {
          const uMatch = u.username.toLowerCase().replace(/\s+/g, "") === normUser ||
                         u.fullName.toLowerCase().replace(/\s+/g, "") === normUser;
          return uMatch && u.password.trim() === password.trim();
        }

        if (u.role === "student") {
          const stu = currentStudents.find(
            (s) => s.studentId && s.studentId.toLowerCase() === (u.studentId || "").toLowerCase()
          );
          const kh = (stu?.fullNameKh || u.fullNameKh || "").toLowerCase().replace(/\s+/g, "");
          const en = (stu?.fullNameEn || u.fullNameEn || "").toLowerCase().replace(/\s+/g, "");
          const uname = (u.username || "").toLowerCase().replace(/\s+/g, "");
          const fname = (u.fullName || "").toLowerCase().replace(/\s+/g, "");

          const nameMatch = kh.includes(normUser) ||
                            en.includes(normUser) ||
                            uname.includes(normUser) ||
                            fname.includes(normUser) ||
                            (u.studentId || "").toLowerCase() === normUser;

          const passMatch = u.password.trim().toLowerCase() === normPass ||
                            u.studentId.trim().toLowerCase() === normPass;
          return nameMatch && passMatch;
        }

        return false;
      });

      if (!match) {
        // Direct Fallback: Check student directly from student records with English or Khmer name
        if (role === "student" || !role) {
          const stuMatch = currentStudents.find((s) => {
            const idMatches = s.studentId.toLowerCase() === normPass || s.studentId.toLowerCase() === normUser;
            if (!idMatches) return false;

            const khMatches = s.fullNameKh && s.fullNameKh.toLowerCase().replace(/\s+/g, "").includes(normUser);
            const enMatches = s.fullNameEn && s.fullNameEn.toLowerCase().replace(/\s+/g, "").includes(normUser);
            const rawMatches = s.fullName && s.fullName.toLowerCase().replace(/\s+/g, "").includes(normUser);

            return khMatches || enMatches || rawMatches;
          });

          if (stuMatch) {
            return {
              success: true,
              message: "ចូលប្រើប្រព័ន្ធបានជោគជ័យ!",
              data: {
                role: "student",
                studentId: stuMatch.studentId,
                studentName: stuMatch.fullNameKh || stuMatch.fullNameEn,
                profile: {
                  studentId: stuMatch.studentId,
                  fullNameKh: stuMatch.fullNameKh,
                  fullNameEn: stuMatch.fullNameEn,
                  gender: stuMatch.gender,
                  room: stuMatch.room,
                  skill: stuMatch.skill,
                  subject: stuMatch.subject,
                  faculty: stuMatch.faculty,
                  department: stuMatch.department,
                  academicYear: stuMatch.academicYear,
                  semester: stuMatch.semester,
                  status: stuMatch.status
                },
                academicSummary: stuMatch.academicSummary,
                scores: stuMatch.scores,
                scoringMatrix: stuMatch.scoringMatrix || [],
                lastUpdated: new Date().toISOString()
              },
              error: null
            };
          }
        }

        // Fallback for hardcoded admin
        if ((username === "admin" && password === "admin2026") || (username === "Leang" && password === "2504")) {
          return {
            success: true,
            message: "ចូលប្រើប្រព័ន្ធបានជោគជ័យ!",
            data: {
              role: "admin",
              token: "MyPintou#Sec2026$X9z",
              username,
              displayName: "អ្នកគ្រប់គ្រងប្រព័ន្ធ"
            },
            error: null
          };
        }

        return {
          success: false,
          message: "ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ។ សូមពិនិត្យឡើងវិញ។",
          data: null,
          error: "INVALID_CREDENTIALS"
        };
      }

      // If student, attach their academic info
      if (match.role === "student") {
        const student = currentStudents.find((s) => s.studentId.toLowerCase() === match.studentId.toLowerCase()) || currentStudents[0];
        return {
          success: true,
          message: "ចូលប្រើប្រព័ន្ធបានជោគជ័យ!",
          data: {
            role: "student",
            studentId: student.studentId,
            studentName: student.fullNameKh || student.fullNameEn,
            profile: {
              studentId: student.studentId,
              fullNameKh: student.fullNameKh,
              fullNameEn: student.fullNameEn,
              gender: student.gender,
              room: student.room,
              skill: student.skill,
              subject: student.subject,
              faculty: student.faculty,
              department: student.department,
              academicYear: student.academicYear,
              semester: student.semester,
              status: student.status
            },
            academicSummary: student.academicSummary,
            scores: student.scores,
            scoringMatrix: student.scoringMatrix || [],
            lastUpdated: new Date().toISOString()
          },
          error: null
        };
      }

      // Staff response
      return {
        success: true,
        message: "ចូលប្រើប្រព័ន្ធបានជោគជ័យ!",
        data: {
          role: match.role,
          token: "MyPintou#Sec2026$X9z",
          userId: match.userId,
          username: match.username,
          displayName: match.fullName || match.username,
          permissions: ["READ_ALL_STUDENTS", "WRITE_STUDENTS", "MANAGE_USERS", "READ_ALL_SCORES", "WRITE_SCORES"]
        },
        error: null
      };
    }

    case "admin_login": {
      const username = String(params.username || "").trim();
      const password = String(params.password || "").trim();

      const user = currentUsers.find(
        (u) =>
          (u.role === "admin" || u.role === "teacher") &&
          (u.username.toLowerCase() === username.toLowerCase() || u.fullName.toLowerCase() === username.toLowerCase()) &&
          u.password === password
      );

      if (user || (username === "admin" && password === "admin2026") || (username === "Leang" && password === "2504")) {
        return {
          success: true,
          message: "ចូលប្រើប្រព័ន្ធបានជោគជ័យ!",
          data: {
            role: user ? user.role : "admin",
            token: "MyPintou#Sec2026$X9z",
            username: user ? user.username : username,
            displayName: user ? user.fullName : "សាស្ត្រាចារ្យ និងអ្នកគ្រប់គ្រង"
          },
          error: null
        };
      }
      return {
        success: false,
        message: "ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ។",
        data: null,
        error: "INVALID_CREDENTIALS"
      };
    }

    // ==========================================
    // 🔐_USERS CRUD
    // ==========================================
    case "get_users":
    case "admin_users": {
      const search = String(params.search || "").toLowerCase().trim();
      const roleFilter = String(params.role || "").toLowerCase().trim();
      const statusFilter = String(params.status || "").toLowerCase().trim();
      const page = parseInt(params.page || 1, 10);
      const pageSize = parseInt(params.pageSize || 20, 10);

      let filtered = currentUsers;
      if (roleFilter && roleFilter !== "all") {
        filtered = filtered.filter((u) => u.role.toLowerCase() === roleFilter);
      }
      if (statusFilter && statusFilter !== "all") {
        filtered = filtered.filter((u) => u.status.toLowerCase() === statusFilter);
      }
      if (search) {
        filtered = filtered.filter(
          (u) =>
            u.userId.toLowerCase().includes(search) ||
            u.username.toLowerCase().includes(search) ||
            u.fullName.toLowerCase().includes(search) ||
            (u.studentId && u.studentId.toLowerCase().includes(search)) ||
            (u.room && u.room.toLowerCase().includes(search))
        );
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        message: "បញ្ជីអ្នកប្រើប្រាស់ត្រូវបានទាញយកជោគជ័យ។",
        data: {
          users: paginated,
          pagination: {
            currentPage: page,
            pageSize,
            totalItems: total,
            totalPages
          },
          stats: {
            totalUsers: currentUsers.length,
            adminCount: currentUsers.filter((u) => u.role === "admin").length,
            teacherCount: currentUsers.filter((u) => u.role === "teacher").length,
            studentCount: currentUsers.filter((u) => u.role === "student").length,
            activeCount: currentUsers.filter((u) => u.status === "Active").length
          }
        },
        error: null
      };
    }

    case "create_user":
    case "admin_create_user": {
      const username = String(params.username || "").trim();
      const password = String(params.password || "").trim();
      const fullName = String(params.fullName || username).trim();
      const role = String(params.role || "student").trim().toLowerCase();
      const studentId = String(params.studentId || (role === "student" ? password : "N/A")).trim();
      const room = String(params.room || "").trim();
      const skill = String(params.skill || "").trim();
      const status = String(params.status || "Active").trim();

      if (!username || !password) {
        return { success: false, message: "សូមបញ្ចូល Username និង Password។", data: null, error: "MISSING_FIELDS" };
      }

      if (currentUsers.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: "ឈ្មោះគណនីនេះមានរួចហើយ (Username already exists)!", data: null, error: "DUPLICATE_USERNAME" };
      }

      const nextId = `USR-${String(currentUsers.length + 1).padStart(3, "0")}`;
      const newUser = {
        userId: nextId,
        username,
        password,
        fullName,
        role,
        studentId,
        room,
        skill,
        status,
        createdAt: new Date().toISOString(),
        lastLogin: ""
      };

      currentUsers.push(newUser);
      saveStoredUsers(currentUsers);

      return {
        success: true,
        message: "បានបង្កើតគណនីអ្នកប្រើប្រាស់ជោគជ័យ!",
        data: newUser,
        error: null
      };
    }

    case "update_user":
    case "admin_update_user": {
      const userId = String(params.userId || params.id || "").trim();
      const idx = currentUsers.findIndex((u) => u.userId === userId);
      if (idx === -1) {
        return { success: false, message: "រកមិនឃើញគណនីអ្នកប្រើប្រាស់នេះឡើយ។", data: null, error: "USER_NOT_FOUND" };
      }

      const existing = currentUsers[idx];
      currentUsers[idx] = {
        ...existing,
        username: params.username !== undefined ? String(params.username).trim() : existing.username,
        password: params.password !== undefined ? String(params.password).trim() : existing.password,
        fullName: params.fullName !== undefined ? String(params.fullName).trim() : existing.fullName,
        role: params.role !== undefined ? String(params.role).trim().toLowerCase() : existing.role,
        studentId: params.studentId !== undefined ? String(params.studentId).trim() : existing.studentId,
        room: params.room !== undefined ? String(params.room).trim() : existing.room,
        skill: params.skill !== undefined ? String(params.skill).trim() : existing.skill,
        status: params.status !== undefined ? String(params.status).trim() : existing.status
      };

      saveStoredUsers(currentUsers);

      return {
        success: true,
        message: "បានកែប្រែព័ត៌មានគណនីជោគជ័យ!",
        data: currentUsers[idx],
        error: null
      };
    }

    case "delete_user":
    case "admin_delete_user": {
      const userId = String(params.userId || params.id || "").trim();
      const initialLen = currentUsers.length;
      currentUsers = currentUsers.filter((u) => u.userId !== userId);
      if (currentUsers.length === initialLen) {
        return { success: false, message: "រកមិនឃើញគណនីអ្នកប្រើប្រាស់នេះឡើយ។", data: null, error: "USER_NOT_FOUND" };
      }

      saveStoredUsers(currentUsers);
      return { success: true, message: "បានលុបគណនីជោគជ័យ!", data: { userId }, error: null };
    }

    case "sync_users":
    case "init_users_sheet":
    case "admin_sync_users": {
      let addedCount = 0;
      currentStudents.forEach((stu) => {
        const hasAccount = currentUsers.some(
          (u) => (u.studentId && u.studentId.toLowerCase() === stu.studentId.toLowerCase())
        );
        if (!hasAccount) {
          addedCount++;
          const uid = `USR-${String(currentUsers.length + 1).padStart(3, "0")}`;
          currentUsers.push({
            userId: uid,
            username: stu.fullNameKh || stu.fullNameEn,
            password: stu.studentId, // Student ID as password!
            fullName: stu.fullNameKh || stu.fullNameEn,
            role: "student",
            studentId: stu.studentId,
            room: stu.room || "",
            skill: stu.skill || "",
            status: stu.status || "Active",
            createdAt: new Date().toISOString(),
            lastLogin: ""
          });
        }
      });

      saveStoredUsers(currentUsers);
      return {
        success: true,
        message: `បានធ្វើសមកាលកម្មគណនីនិស្សិតជោគជ័យ! បន្ថែមថ្មីចំនួន ${addedCount} គណនី។`,
        data: { count: addedCount, totalUsers: currentUsers.length },
        error: null
      };
    }

    // ==========================================
    // 📋 STUDENTS CRUD
    // ==========================================
    case "create_student":
    case "admin_create_student": {
      const studentId = String(params.studentId || "").trim();
      const fullNameKh = String(params.fullNameKh || "").trim();
      const fullNameEn = String(params.fullNameEn || "").trim();
      const gender = String(params.gender || "ប្រុស").trim();
      const room = String(params.room || "101").trim();
      const skill = String(params.skill || "General").trim();
      const phone = String(params.phone || "").trim();
      const status = String(params.status || "Active").trim();

      if (!studentId || (!fullNameKh && !fullNameEn)) {
        return { success: false, message: "សូមបញ្ចូលលេខសម្គាល់ និងឈ្មោះនិស្សិត។", data: null, error: "MISSING_INFO" };
      }

      if (currentStudents.some((s) => s.studentId.toLowerCase() === studentId.toLowerCase())) {
        return { success: false, message: "លេខសម្គាល់និស្សិតនេះមានរួចហើយ (Duplicate ID)!", data: null, error: "DUPLICATE_ID" };
      }

      const newStudent = {
        studentId,
        fullNameKh,
        fullNameEn,
        fullName: fullNameKh || fullNameEn,
        gender,
        room,
        skill,
        phone,
        status,
        subject: "ICT",
        academicSummary: {
          attendance: 10,
          totalQHA: 0,
          midterm: 0,
          finalScore: 0,
          totalScore: 10,
          overallGrade: "F"
        },
        scores: [
          { assessment: "វត្តមាន (Attendance)", score: 10, maxScore: 10, weight: 10, percentage: 100 },
          { assessment: "កិច្ចការ & Quiz (QHA)", score: 0, maxScore: 15, weight: 15, percentage: 0 },
          { assessment: "ពាក់កណ្តាលឆមាស (Midterm)", score: 0, maxScore: 25, weight: 25, percentage: 0 },
          { assessment: "ប្រឡងបញ្ចប់ (Final)", score: 0, maxScore: 50, weight: 50, percentage: 0 }
        ]
      };

      currentStudents.unshift(newStudent);
      saveStoredStudents(currentStudents);

      // Auto-create login in 🔐_Users
      const uid = `USR-${String(currentUsers.length + 1).padStart(3, "0")}`;
      currentUsers.push({
        userId: uid,
        username: fullNameKh || fullNameEn,
        password: studentId,
        fullName: fullNameKh || fullNameEn,
        role: "student",
        studentId,
        room,
        skill,
        status,
        createdAt: new Date().toISOString(),
        lastLogin: ""
      });
      saveStoredUsers(currentUsers);

      return {
        success: true,
        message: "បានបញ្ចូលនិស្សិតថ្មី និងបង្កើតគណនីចូលប្រព័ន្ធជោគជ័យ!",
        data: newStudent,
        error: null
      };
    }

    case "update_student":
    case "admin_update_student": {
      const studentId = String(params.studentId || "").trim().toLowerCase();
      const idx = currentStudents.findIndex((s) => s.studentId.toLowerCase() === studentId);
      if (idx === -1) {
        return { success: false, message: "រកមិនឃើញទិន្នន័យនិស្សិតឡើយ។", data: null, error: "STUDENT_NOT_FOUND" };
      }

      const existing = currentStudents[idx];
      const updatedKh = params.fullNameKh !== undefined ? String(params.fullNameKh).trim() : existing.fullNameKh;
      const updatedEn = params.fullNameEn !== undefined ? String(params.fullNameEn).trim() : existing.fullNameEn;

      currentStudents[idx] = {
        ...existing,
        fullNameKh: updatedKh,
        fullNameEn: updatedEn,
        fullName: updatedKh || updatedEn,
        gender: params.gender !== undefined ? String(params.gender).trim() : existing.gender,
        room: params.room !== undefined ? String(params.room).trim() : existing.room,
        skill: params.skill !== undefined ? String(params.skill).trim() : existing.skill,
        status: params.status !== undefined ? String(params.status).trim() : existing.status
      };

      saveStoredStudents(currentStudents);

      // Sync name into 🔐_Users
      const uIdx = currentUsers.findIndex((u) => u.studentId && u.studentId.toLowerCase() === studentId);
      if (uIdx !== -1) {
        currentUsers[uIdx].username = updatedKh || updatedEn;
        currentUsers[uIdx].fullName = updatedKh || updatedEn;
        saveStoredUsers(currentUsers);
      }

      return {
        success: true,
        message: "បានកែប្រែព័ត៌មាននិស្សិតជោគជ័យ!",
        data: currentStudents[idx],
        error: null
      };
    }

    case "delete_student":
    case "admin_delete_student": {
      const studentId = String(params.studentId || "").trim().toLowerCase();
      currentStudents = currentStudents.filter((s) => s.studentId.toLowerCase() !== studentId);
      currentUsers = currentUsers.filter((u) => !(u.studentId && u.studentId.toLowerCase() === studentId));

      saveStoredStudents(currentStudents);
      saveStoredUsers(currentUsers);

      return {
        success: true,
        message: "បានលុបនិស្សិតចេញពីប្រព័ន្ធជោគជ័យ!",
        data: { studentId },
        error: null
      };
    }

    case "bulk_create_students":
    case "admin_bulk_create_students": {
      let list = params.students || [];
      if (typeof list === "string") {
        try { list = JSON.parse(list); } catch (e) { list = []; }
      }

      let added = 0;
      list.forEach((item) => {
        const sid = String(item.studentId || item.id || "").trim();
        if (!sid || currentStudents.some((s) => s.studentId.toLowerCase() === sid.toLowerCase())) return;

        const nameKh = String(item.fullNameKh || item.nameKh || "").trim();
        const nameEn = String(item.fullNameEn || item.nameEn || "").trim();
        const newStu = {
          studentId: sid,
          fullNameKh: nameKh,
          fullNameEn: nameEn,
          fullName: nameKh || nameEn,
          gender: String(item.gender || "ប្រុស").trim(),
          room: String(item.room || "101").trim(),
          skill: String(item.skill || item.major || "General").trim(),
          status: String(item.status || "Active").trim(),
          subject: "ICT",
          academicSummary: { attendance: 10, totalQHA: 0, midterm: 0, finalScore: 0, totalScore: 10, overallGrade: "F" },
          scores: [
            { assessment: "វត្តមាន (Attendance)", score: 10, maxScore: 10, weight: 10, percentage: 100 },
            { assessment: "កិច្ចការ & Quiz (QHA)", score: 0, maxScore: 15, weight: 15, percentage: 0 },
            { assessment: "ពាក់កណ្តាលឆមាស (Midterm)", score: 0, maxScore: 25, weight: 25, percentage: 0 },
            { assessment: "ប្រឡងបញ្ចប់ (Final)", score: 0, maxScore: 50, weight: 50, percentage: 0 }
          ]
        };

        currentStudents.push(newStu);
        added++;

        // Auto login account
        const uid = `USR-${String(currentUsers.length + 1).padStart(3, "0")}`;
        currentUsers.push({
          userId: uid,
          username: nameKh || nameEn || sid,
          password: sid,
          fullName: nameKh || nameEn || sid,
          role: "student",
          studentId: sid,
          room: newStu.room,
          skill: newStu.skill,
          status: newStu.status,
          createdAt: new Date().toISOString(),
          lastLogin: ""
        });
      });

      saveStoredStudents(currentStudents);
      saveStoredUsers(currentUsers);

      return {
        success: true,
        message: `បាននាំចូលនិស្សិតថ្មីចំនួន ${added} នាក់ដោយជោគជ័យ!`,
        data: { importedCount: added },
        error: null
      };
    }

    // ==========================================
    // 📊 SCORING CRUD
    // ==========================================
    case "update_scores":
    case "admin_update_scores": {
      const studentId = String(params.studentId || "").trim().toLowerCase();
      const idx = currentStudents.findIndex((s) => s.studentId.toLowerCase() === studentId);
      if (idx === -1) {
        return { success: false, message: "រកមិនឃើញកំណត់ត្រាពិន្ទុឡើយ។", data: null, error: "NOT_FOUND" };
      }

      const stu = currentStudents[idx];
      const curSum = stu.academicSummary || {};
      const attendance = params.attendance !== undefined ? Number(params.attendance) : (curSum.attendance || 10);
      const qha = params.qha !== undefined ? Number(params.qha) : (curSum.totalQHA || 0);
      const midterm = params.midterm !== undefined ? Number(params.midterm) : (curSum.midterm || 0);
      const finalScore = params.finalScore !== undefined ? Number(params.finalScore) : (curSum.finalScore || 0);

      const totalScore = Math.round((attendance + qha + midterm + finalScore) * 10) / 10;
      let grade = "F";
      if (totalScore >= 85) grade = "A";
      else if (totalScore >= 80) grade = "B+";
      else if (totalScore >= 70) grade = "B";
      else if (totalScore >= 65) grade = "C+";
      else if (totalScore >= 50) grade = "C";
      else if (totalScore >= 45) grade = "D";
      else if (totalScore >= 40) grade = "E";

      stu.academicSummary = {
        ...curSum,
        attendance,
        totalQHA: qha,
        midterm,
        finalScore,
        totalScore,
        overallGrade: grade
      };

      stu.scores = [
        { assessment: "វត្តមាន (Attendance)", score: attendance, maxScore: 10, weight: 10, percentage: Math.round((attendance / 10) * 100) },
        { assessment: "កិច្ចការ & Quiz (QHA)", score: qha, maxScore: 15, weight: 15, percentage: Math.round((qha / 15) * 100) },
        { assessment: "ពាក់កណ្តាលឆមាស (Midterm)", score: midterm, maxScore: 25, weight: 25, percentage: Math.round((midterm / 25) * 100) },
        { assessment: "ប្រឡងបញ្ចប់ (Final)", score: finalScore, maxScore: 50, weight: 50, percentage: Math.round((finalScore / 50) * 100) }
      ];

      currentStudents[idx] = stu;
      saveStoredStudents(currentStudents);

      return {
        success: true,
        message: "បានកែប្រែពិន្ទុនិស្សិតជោគជ័យ!",
        data: {
          studentId: stu.studentId,
          attendance,
          qha,
          midterm,
          finalScore,
          totalScore,
          grade
        },
        error: null
      };
    }

    case "create_score":
    case "admin_create_score": {
      const studentId = String(params.studentId || "").trim();
      if (!studentId) {
        return { success: false, message: "Student ID is required.", data: null, error: "MISSING_ID" };
      }
      let idx = currentStudents.findIndex((s) => s.studentId.toLowerCase() === studentId.toLowerCase());
      if (idx !== -1) {
        return handleMockRequest("update_scores", params);
      }
      const newStu = {
        studentId,
        fullNameKh: params.fullNameKh || studentId,
        fullNameEn: params.fullNameEn || "",
        gender: params.gender || "ប្រុស",
        room: params.room || "101",
        skill: params.skill || "គណនេយ្យ",
        academicSummary: {
          attendance: params.attendance !== undefined ? Number(params.attendance) : 10,
          totalQHA: params.qha !== undefined ? Number(params.qha) : 0,
          midterm: params.midterm !== undefined ? Number(params.midterm) : 0,
          finalScore: params.finalScore !== undefined ? Number(params.finalScore) : 0,
          totalScore: (Number(params.attendance) || 10) + (Number(params.qha) || 0) + (Number(params.midterm) || 0) + (Number(params.finalScore) || 0),
          overallGrade: "C"
        }
      };
      currentStudents.push(newStu);
      saveStoredStudents(currentStudents);
      return { success: true, message: "បានបញ្ចូលកំណត់ត្រាពិន្ទុថ្មីជោគជ័យ!", data: newStu, error: null };
    }

    case "delete_score":
    case "admin_delete_score": {
      const studentId = String(params.studentId || "").trim().toLowerCase();
      const idx = currentStudents.findIndex((s) => s.studentId.toLowerCase() === studentId);
      if (idx === -1) {
        return { success: false, message: "រកមិនឃើញកំណត់ត្រាពិន្ទុឡើយ។", data: null, error: "NOT_FOUND" };
      }
      currentStudents[idx].academicSummary = null;
      currentStudents[idx].scores = [];
      saveStoredStudents(currentStudents);
      return { success: true, message: "បានលុបកំណត់ត្រាពិន្ទុជោគជ័យ!", data: { studentId }, error: null };
    }

    case "sync_scoring_students":
    case "admin_sync_scoring_students": {
      let count = 0;
      currentStudents.forEach((s) => {
        if (!s.academicSummary) {
          s.academicSummary = {
            attendance: 10,
            totalQHA: 0,
            midterm: 0,
            finalScore: 0,
            totalScore: 10,
            overallGrade: "F"
          };
          count++;
        }
      });
      saveStoredStudents(currentStudents);
      return { success: true, message: `បានធ្វើសមកាលកម្ម ${count} នាក់ទៅតារាងពិន្ទុជោគជ័យ!`, data: { addedCount: count }, error: null };
    }

    case "reset_scores":
    case "admin_reset_scores": {
      const studentId = String(params.studentId || "").trim();
      return handleMockRequest("update_scores", {
        studentId,
        attendance: 10,
        qha: 0,
        midterm: 0,
        finalScore: 0
      });
    }

    // ==========================================
    // 📝 QUIZZES CRUD & EVALUATION
    // ==========================================
    case "admin_quizzes":
    case "get_quizzes": {
      let quizzesConfig = getStoredQuizzesConfig();
      const search = String(params.search || "").toLowerCase().trim();
      const room = String(params.room || "").toLowerCase().trim();
      const statusFilter = String(params.status || "all").toLowerCase().trim();
      const page = parseInt(params.page || 1, 10);
      const pageSize = parseInt(params.pageSize || 25, 10);

      // Make sure all students have their quiz totals and breakdown synced
      currentStudents.forEach((s) => recalculateStudentQuizTotal(s, quizzesConfig));
      saveStoredStudents(currentStudents);

      const totalMaxScore = quizzesConfig.reduce((acc, q) => acc + (Number(q.maxScore) || 10), 0);

      let filtered = currentStudents;
      if (room && room !== "all") {
        filtered = filtered.filter((s) => s.room && s.room.toLowerCase() === room);
      }
      if (search) {
        filtered = filtered.filter((s) =>
          s.studentId.toLowerCase().includes(search) ||
          (s.fullNameKh && s.fullNameKh.toLowerCase().includes(search)) ||
          (s.fullNameEn && s.fullNameEn.toLowerCase().includes(search)) ||
          (s.room && s.room.toLowerCase().includes(search))
        );
      }
      if (statusFilter === "complete") {
        filtered = filtered.filter((s) => {
          const bd = s.academicSummary?.quizBreakdown || [];
          return bd.length > 0 && bd.every((b) => b.score !== null && b.score !== undefined);
        });
      } else if (statusFilter === "incomplete") {
        filtered = filtered.filter((s) => {
          const bd = s.academicSummary?.quizBreakdown || [];
          return bd.some((b) => b.score === null || b.score === undefined);
        });
      } else if (statusFilter === "high") {
        filtered = filtered.filter((s) => (s.academicSummary?.totalQHA || 0) >= 12);
      } else if (statusFilter === "low") {
        filtered = filtered.filter((s) => (s.academicSummary?.totalQHA || 0) < 7.5);
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

      // Map student data with quick-access quiz map
      const mappedStudents = paginated.map((s) => {
        const bd = s.academicSummary?.quizBreakdown || [];
        const scoreMap = {};
        let rawSum = 0;
        let completed = 0;
        bd.forEach((b) => {
          if (b.score !== null && b.score !== undefined && b.score !== "") {
            scoreMap[b.name] = Number(b.score);
            rawSum += Number(b.score);
            completed++;
          } else {
            scoreMap[b.name] = null;
          }
        });

        const scaled15 = s.academicSummary?.totalQHA != null ? Number(s.academicSummary.totalQHA) : 0;
        const pct = totalMaxScore > 0 ? Math.round((rawSum / totalMaxScore) * 1000) / 10 : 0;

        return {
          studentId: s.studentId,
          fullNameKh: s.fullNameKh,
          fullNameEn: s.fullNameEn,
          gender: s.gender,
          room: s.room,
          skill: s.skill,
          scores: scoreMap,
          quizBreakdown: bd,
          rawTotal: Math.round(rawSum * 10) / 10,
          totalMaxScore,
          scaled15,
          percentage: pct,
          grade: s.academicSummary?.overallGrade || "F",
          completedCount: completed,
          totalQuizzes: quizzesConfig.length
        };
      });

      // Calculate class KPI stats
      const allRawSums = currentStudents.map((s) => {
        const bd = s.academicSummary?.quizBreakdown || [];
        return bd.reduce((sum, b) => (b.score != null ? sum + Number(b.score) : sum), 0);
      });
      const avgRaw = allRawSums.length > 0 ? allRawSums.reduce((a, b) => a + b, 0) / allRawSums.length : 0;
      const avgPct = totalMaxScore > 0 ? Math.round((avgRaw / totalMaxScore) * 1000) / 10 : 0;
      const avgScaled = totalMaxScore > 0 ? Math.round((avgRaw / totalMaxScore) * 15 * 10) / 10 : 0;

      // Calculate per-quiz average
      const quizStats = quizzesConfig.map((qz) => {
        let qzSum = 0;
        let count = 0;
        currentStudents.forEach((s) => {
          const item = (s.academicSummary?.quizBreakdown || []).find((b) => b.name === qz.name);
          if (item && item.score !== null && item.score !== undefined) {
            qzSum += Number(item.score);
            count++;
          }
        });
        const qzAvg = count > 0 ? Math.round((qzSum / count) * 10) / 10 : 0;
        const qzPct = qz.maxScore > 0 ? Math.round((qzAvg / qz.maxScore) * 100) : 0;
        return {
          id: qz.id,
          name: qz.name,
          maxScore: qz.maxScore,
          averageScore: qzAvg,
          averagePercentage: qzPct,
          completedCount: count,
          totalCount: currentStudents.length
        };
      });

      const topStudent = [...currentStudents].sort((a, b) => (b.academicSummary?.totalQHA || 0) - (a.academicSummary?.totalQHA || 0))[0];
      const allRooms = Array.from(new Set(currentStudents.map((s) => s.room).filter(Boolean)));

      return {
        success: true,
        message: "ទាញយកទិន្នន័យកម្រងសំណួរជោគជ័យ!",
        data: {
          quizzes: quizzesConfig,
          quizStats,
          totalMaxScore,
          students: mappedStudents,
          pagination: {
            currentPage: page,
            pageSize,
            totalItems: total,
            totalPages
          },
          stats: {
            totalQuizzes: quizzesConfig.length,
            totalMaxScore,
            classAverageScore: Math.round(avgRaw * 10) / 10,
            classAveragePct: avgPct,
            classAverageScaled: avgScaled,
            topScorer: topStudent ? {
              studentId: topStudent.studentId,
              name: topStudent.fullNameKh || topStudent.fullNameEn,
              scaled15: topStudent.academicSummary?.totalQHA || 0,
              room: topStudent.room
            } : null
          },
          filterOptions: {
            rooms: allRooms
          }
        },
        error: null
      };
    }

    case "create_quiz":
    case "admin_create_quiz": {
      const name = String(params.name || "").trim();
      const maxScore = Number(params.maxScore) > 0 ? Number(params.maxScore) : 10;
      const description = String(params.description || "").trim();

      if (!name) {
        return { success: false, message: "សូមបញ្ចូលឈ្មោះកម្រងសំណួរ (Quiz Name)។", data: null, error: "MISSING_NAME" };
      }

      let quizzesConfig = getStoredQuizzesConfig();
      if (quizzesConfig.some((q) => q.name.toLowerCase() === name.toLowerCase())) {
        return { success: false, message: "កម្រងសំណួរដែលមានឈ្មោះនេះមានរួចហើយ (Duplicate Quiz Name)!", data: null, error: "DUPLICATE_QUIZ" };
      }

      const nextId = quizzesConfig.length > 0 ? Math.max(...quizzesConfig.map((q) => q.id || 0)) + 1 : 1;
      const newQuiz = {
        id: nextId,
        name,
        maxScore,
        description,
        createdAt: new Date().toISOString()
      };

      quizzesConfig.push(newQuiz);
      saveStoredQuizzesConfig(quizzesConfig);

      // Append to all students
      currentStudents.forEach((stu) => {
        if (!stu.academicSummary) stu.academicSummary = {};
        if (!Array.isArray(stu.academicSummary.quizBreakdown)) stu.academicSummary.quizBreakdown = [];
        stu.academicSummary.quizBreakdown.push({
          name: newQuiz.name,
          score: null,
          maxScore: newQuiz.maxScore
        });
        recalculateStudentQuizTotal(stu, quizzesConfig);
      });
      saveStoredStudents(currentStudents);

      return {
        success: true,
        message: `បានបង្កើតកម្រងសំណួរថ្មី "${newQuiz.name}" (ពិន្ទុពេញ ${newQuiz.maxScore}) ដោយជោគជ័យ!`,
        data: newQuiz,
        error: null
      };
    }

    case "update_quiz":
    case "admin_update_quiz": {
      const quizId = params.quizId !== undefined ? Number(params.quizId) : null;
      const oldName = String(params.oldName || "").trim();
      const newName = params.name !== undefined ? String(params.name).trim() : null;
      const maxScore = params.maxScore !== undefined && Number(params.maxScore) > 0 ? Number(params.maxScore) : null;

      let quizzesConfig = getStoredQuizzesConfig();
      const idx = quizzesConfig.findIndex((q) => (quizId !== null && q.id === quizId) || (oldName && q.name.toLowerCase() === oldName.toLowerCase()));

      if (idx === -1) {
        return { success: false, message: "រកមិនឃើញកម្រងសំណួរនេះឡើយ។", data: null, error: "QUIZ_NOT_FOUND" };
      }

      const prev = quizzesConfig[idx];
      const targetName = newName || prev.name;
      const targetMax = maxScore !== null ? maxScore : prev.maxScore;

      quizzesConfig[idx] = {
        ...prev,
        name: targetName,
        maxScore: targetMax,
        description: params.description !== undefined ? String(params.description).trim() : prev.description
      };
      saveStoredQuizzesConfig(quizzesConfig);

      // Update all students
      currentStudents.forEach((stu) => {
        const bd = stu.academicSummary?.quizBreakdown || [];
        const qItem = bd.find((b) => b.name === prev.name);
        if (qItem) {
          qItem.name = targetName;
          qItem.maxScore = targetMax;
          if (qItem.score !== null && qItem.score > targetMax) {
            qItem.score = targetMax;
          }
        }
        recalculateStudentQuizTotal(stu, quizzesConfig);
      });
      saveStoredStudents(currentStudents);

      return {
        success: true,
        message: `បានកែប្រែកម្រងសំណួរ "${targetName}" ដោយជោគជ័យ!`,
        data: quizzesConfig[idx],
        error: null
      };
    }

    case "delete_quiz":
    case "admin_delete_quiz": {
      const quizId = params.quizId !== undefined ? Number(params.quizId) : null;
      const quizName = String(params.name || params.quizName || "").trim();

      let quizzesConfig = getStoredQuizzesConfig();
      const target = quizzesConfig.find((q) => (quizId !== null && q.id === quizId) || (quizName && q.name.toLowerCase() === quizName.toLowerCase()));

      if (!target) {
        return { success: false, message: "រកមិនឃើញកម្រងសំណួរដែលត្រូវលុបឡើយ។", data: null, error: "QUIZ_NOT_FOUND" };
      }

      quizzesConfig = quizzesConfig.filter((q) => q.id !== target.id);
      saveStoredQuizzesConfig(quizzesConfig);

      // Remove from all students
      currentStudents.forEach((stu) => {
        if (stu.academicSummary && Array.isArray(stu.academicSummary.quizBreakdown)) {
          stu.academicSummary.quizBreakdown = stu.academicSummary.quizBreakdown.filter((b) => b.name !== target.name);
        }
        recalculateStudentQuizTotal(stu, quizzesConfig);
      });
      saveStoredStudents(currentStudents);

      return {
        success: true,
        message: `បានលុបកម្រងសំណួរ "${target.name}" ចេញពីប្រព័ន្ធដោយជោគជ័យ!`,
        data: { deletedQuiz: target },
        error: null
      };
    }

    case "update_student_quizzes":
    case "admin_update_student_quizzes": {
      const studentId = String(params.studentId || "").trim();
      const isBatch = params.batch === "true" || params.batch === true;
      let quizzesConfig = getStoredQuizzesConfig();

      if (isBatch) {
        let updates = params.scores;
        if (typeof updates === "string") {
          try { updates = JSON.parse(updates); } catch (e) { updates = []; }
        }
        let updatedCount = 0;
        (Array.isArray(updates) ? updates : []).forEach((item) => {
          const sid = String(item.studentId || "").trim().toLowerCase();
          const stu = currentStudents.find((s) => s.studentId.toLowerCase() === sid);
          if (stu && item.scores) {
            if (!stu.academicSummary) stu.academicSummary = {};
            if (!Array.isArray(stu.academicSummary.quizBreakdown)) stu.academicSummary.quizBreakdown = [];
            
            Object.entries(item.scores).forEach(([qName, qScore]) => {
              const bItem = stu.academicSummary.quizBreakdown.find((b) => b.name === qName);
              const qzDef = quizzesConfig.find((q) => q.name === qName);
              const maxPts = qzDef ? qzDef.maxScore : 10;
              const numericScore = qScore !== null && qScore !== undefined && qScore !== "" ? Math.max(0, Math.min(maxPts, Number(qScore))) : null;

              if (bItem) {
                bItem.score = numericScore;
              } else {
                stu.academicSummary.quizBreakdown.push({
                  name: qName,
                  score: numericScore,
                  maxScore: maxPts
                });
              }
            });
            recalculateStudentQuizTotal(stu, quizzesConfig);
            updatedCount++;
          }
        });

        saveStoredStudents(currentStudents);
        return {
          success: true,
          message: `បានកែប្រែពិន្ទុ Quiz របស់និស្សិតចំនួន ${updatedCount} នាក់ដោយជោគជ័យ!`,
          data: { updatedCount },
          error: null
        };
      }

      const idx = currentStudents.findIndex((s) => s.studentId.toLowerCase() === studentId.toLowerCase());
      if (idx === -1) {
        return { success: false, message: "រកមិនឃើញទិន្នន័យនិស្សិតឡើយ។", data: null, error: "STUDENT_NOT_FOUND" };
      }

      let scoresMap = params.scores;
      if (typeof scoresMap === "string") {
        try { scoresMap = JSON.parse(scoresMap); } catch (e) { scoresMap = {}; }
      }

      const stu = currentStudents[idx];
      if (!stu.academicSummary) stu.academicSummary = {};
      if (!Array.isArray(stu.academicSummary.quizBreakdown)) stu.academicSummary.quizBreakdown = [];

      if (Array.isArray(scoresMap)) {
        scoresMap.forEach((entry) => {
          const bItem = stu.academicSummary.quizBreakdown.find((b) => b.name === entry.name);
          const qzDef = quizzesConfig.find((q) => q.name === entry.name);
          const maxPts = qzDef ? qzDef.maxScore : (entry.maxScore || 10);
          const numericScore = entry.score !== null && entry.score !== undefined && entry.score !== ""
            ? Math.max(0, Math.min(maxPts, Number(entry.score)))
            : null;

          if (bItem) {
            bItem.score = numericScore;
          } else {
            stu.academicSummary.quizBreakdown.push({ name: entry.name, score: numericScore, maxScore: maxPts });
          }
        });
      } else if (scoresMap && typeof scoresMap === "object") {
        Object.entries(scoresMap).forEach(([qName, qScore]) => {
          const bItem = stu.academicSummary.quizBreakdown.find((b) => b.name === qName);
          const qzDef = quizzesConfig.find((q) => q.name === qName);
          const maxPts = qzDef ? qzDef.maxScore : 10;
          const numericScore = qScore !== null && qScore !== undefined && qScore !== ""
            ? Math.max(0, Math.min(maxPts, Number(qScore)))
            : null;

          if (bItem) {
            bItem.score = numericScore;
          } else {
            stu.academicSummary.quizBreakdown.push({ name: qName, score: numericScore, maxScore: maxPts });
          }
        });
      }

      recalculateStudentQuizTotal(stu, quizzesConfig);
      currentStudents[idx] = stu;
      saveStoredStudents(currentStudents);

      return {
        success: true,
        message: `បានរក្សាទុកពិន្ទុកម្រងសំណួររបស់និស្សិត ${stu.fullNameKh || stu.studentId} ជោគជ័យ!`,
        data: {
          studentId: stu.studentId,
          quizBreakdown: stu.academicSummary.quizBreakdown,
          totalQHA: stu.academicSummary.totalQHA,
          totalScore: stu.academicSummary.totalScore,
          overallGrade: stu.academicSummary.overallGrade
        },
        error: null
      };
    }

    case "reset_student_quizzes":
    case "admin_reset_student_quizzes": {
      const studentId = String(params.studentId || "").trim();
      const idx = currentStudents.findIndex((s) => s.studentId.toLowerCase() === studentId.toLowerCase());
      if (idx === -1) {
        return { success: false, message: "រកមិនឃើញទិន្នន័យនិស្សិតឡើយ។", data: null, error: "STUDENT_NOT_FOUND" };
      }

      let quizzesConfig = getStoredQuizzesConfig();
      const stu = currentStudents[idx];
      if (stu.academicSummary && Array.isArray(stu.academicSummary.quizBreakdown)) {
        stu.academicSummary.quizBreakdown.forEach((b) => { b.score = null; });
      }
      recalculateStudentQuizTotal(stu, quizzesConfig);
      saveStoredStudents(currentStudents);

      return {
        success: true,
        message: `បានកំណត់ពិន្ទុ Quiz ទាំងអស់របស់និស្សិតឡើងវិញជោគជ័យ!`,
        data: stu,
        error: null
      };
    }

    case "sync_quiz_students":
    case "admin_sync_quiz_students": {
      let quizzesConfig = getStoredQuizzesConfig();
      let syncedCount = 0;
      currentStudents.forEach((stu) => {
        recalculateStudentQuizTotal(stu, quizzesConfig);
        syncedCount++;
      });
      saveStoredStudents(currentStudents);

      return {
        success: true,
        message: `បានធ្វើសមកាលកម្មកម្រងសំណួរសម្រាប់និស្សិតចំនួន ${syncedCount} នាក់ជោគជ័យ!`,
        data: { syncedCount, totalQuizzes: quizzesConfig.length },
        error: null
      };
    }

    // ==========================================
    // EXISTING READ ENDPOINTS
    // ==========================================
    case "student_lookup": {
      const studentId = String(params.studentId || "").trim().toLowerCase();
      const studentName = String(params.studentName || "").trim().toLowerCase();

      if (!studentId || !studentName) {
        return { success: false, message: "សូមបញ្ចូលលេខសម្គាល់ និងឈ្មោះនិស្សិត។", data: null, error: "MISSING_INFO" };
      }

      const match = currentStudents.find((s) => {
        const idMatches = s.studentId.toLowerCase() === studentId;
        if (!idMatches) return false;

        const khMatches = s.fullNameKh.toLowerCase().replace(/\s+/g, "").includes(studentName.replace(/\s+/g, ""));
        const enMatches = s.fullNameEn.toLowerCase().replace(/\s+/g, "").includes(studentName.replace(/\s+/g, ""));
        const rawMatches = (s.fullName || "").toLowerCase().replace(/\s+/g, "").includes(studentName.replace(/\s+/g, ""));

        return khMatches || enMatches || rawMatches;
      });

      if (!match) {
        return {
          success: false,
          message: "រកមិនឃើញទិន្នន័យនិស្សិតដែលត្រូវនឹងលេខសម្គាល់ និងឈ្មោះនេះឡើយ។",
          data: null,
          error: "STUDENT_NOT_FOUND"
        };
      }

      return {
        success: true,
        message: "ទាញយកទិន្នន័យនិស្សិតបានជោគជ័យ។",
        data: {
          profile: {
            studentId: match.studentId,
            fullNameKh: match.fullNameKh,
            fullNameEn: match.fullNameEn,
            fullName: match.fullName,
            gender: match.gender,
            room: match.room,
            skill: match.skill,
            subject: match.subject,
            faculty: match.faculty,
            department: match.department,
            academicYear: match.academicYear,
            semester: match.semester,
            status: match.status
          },
          academicSummary: match.academicSummary,
          scores: match.scores,
          scoringMatrix: match.scoringMatrix || [],
          lastUpdated: new Date().toISOString()
        },
        error: null
      };
    }

    case "admin_stats": {
      const totalStudents = currentStudents.length;
      const maleStudents = currentStudents.filter((s) => s.gender === "ប្រុស" || s.gender === "M").length;
      const femaleStudents = currentStudents.filter((s) => s.gender === "ស្រី" || s.gender === "F").length;
      const passedCount = currentStudents.filter((s) => (s.academicSummary?.totalScore || 0) >= 50).length;
      const failedCount = totalStudents - passedCount;

      return {
        success: true,
        message: "ទាញយកទិន្នន័យស្ថិតិបានជោគជ័យ។",
        data: {
          ...MOCK_STATS,
          totalStudents,
          maleStudents,
          femaleStudents,
          passedCount,
          failedCount,
          passRate: totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0
        },
        error: null
      };
    }

    case "admin_students": {
      const search = String(params.search || "").toLowerCase().trim();
      const room = String(params.room || "").toLowerCase().trim();
      const major = String(params.major || "").toLowerCase().trim();
      const page = parseInt(params.page || 1, 10);
      const pageSize = parseInt(params.pageSize || 15, 10);

      let filtered = currentStudents;
      if (search) {
        filtered = filtered.filter(
          (s) =>
            s.studentId.toLowerCase().includes(search) ||
            s.fullNameKh.toLowerCase().includes(search) ||
            s.fullNameEn.toLowerCase().includes(search)
        );
      }
      if (room) {
        filtered = filtered.filter((s) => s.room && s.room.toLowerCase().includes(room));
      }
      if (major) {
        filtered = filtered.filter((s) => s.skill && s.skill.toLowerCase().includes(major));
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

      const allRooms = Array.from(new Set(currentStudents.map((s) => s.room).filter(Boolean)));
      const allMajors = Array.from(new Set(currentStudents.map((s) => s.skill).filter(Boolean)));

      return {
        success: true,
        message: "ទាញយកបញ្ជីនិស្សិតបានជោគជ័យ។",
        data: {
          students: paginated.map((s) => ({
            studentId: s.studentId,
            fullNameKh: s.fullNameKh,
            fullNameEn: s.fullNameEn,
            gender: s.gender,
            room: s.room,
            skill: s.skill,
            subject: s.subject,
            phone: s.phone,
            totalQHA: s.academicSummary?.totalQHA,
            midterm: s.academicSummary?.midterm,
            totalScore: s.academicSummary?.totalScore,
            grade: s.academicSummary?.overallGrade,
            status: s.status,
            published: s.published !== false
          })),
          pagination: {
            currentPage: page,
            pageSize,
            totalItems: total,
            totalPages
          },
          filterOptions: {
            rooms: allRooms.length > 0 ? allRooms : ["M1", "M2", "101"],
            majors: allMajors.length > 0 ? allMajors : ["ICT", "វិទ្យាសាស្ត្រកុំព្យូទ័រ"]
          }
        },
        error: null
      };
    }

    case "admin_student_detail": {
      const studentId = String(params.studentId || "").trim().toLowerCase();
      const student = currentStudents.find((s) => s.studentId.toLowerCase() === studentId);
      if (!student) {
        return { success: false, message: "រកមិនឃើញទិន្នន័យនិស្សិតឡើយ។", data: null, error: "NOT_FOUND" };
      }
      return { success: true, message: "ទាញយកព័ត៌មានលម្អិតបានជោគជ័យ។", data: student, error: null };
    }

    case "admin_scoring_overview": {
      return {
        success: true,
        message: "ទាញយកតារាងពិន្ទុរួមបានជោគជ័យ។",
        data: {
          headers: ["លេខសម្គាល់", "ឈ្មោះខ្មែរ", "ឈ្មោះឡាតាំង", "ភេទ", "បន្ទប់", "ជំនាញ", "សរុបពិន្ទុ (Q,H,A)", "ពាក់កណ្តាលឆមាស", "ប្រឡងបញ្ចប់", "សរុប", "និទ្ទេស"],
          students: currentStudents,
          lastUpdated: new Date().toISOString()
        },
        error: null
      };
    }

    default:
      return { success: false, message: `មុខងារ ${action} ត្រូវបានដំណើរការរួចរាល់។`, data: null, error: null };
  }
}
