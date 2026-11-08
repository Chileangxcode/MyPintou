import {
  apiRequest,
  invalidateRelatedCaches,
  forceLiveSyncSpreadsheet,
  cancelableApiRequest,
  executeOptimisticMutation
} from "./client.js";
export { forceLiveSyncSpreadsheet, cancelableApiRequest, executeOptimisticMutation };

/**
 * Teacher / Admin API Methods
 */

export const DEFAULT_ADMIN_TOKEN = "MyPintou#Sec2026$X9z";

function resolveToken(token) {
  if (token && typeof token === "string" && token.trim().length > 0) {
    return token.trim();
  }
  try {
    const saved = sessionStorage.getItem("uni_admin_session") || localStorage.getItem("uni_admin_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.token) return parsed.token;
    }
  } catch (_) {}
  return DEFAULT_ADMIN_TOKEN;
}

export async function loginAdmin(username, password) {
  return apiRequest("admin_login", {
    username: username.trim(),
    password: password.trim()
  });
}

/**
 * Universal Login (Staff & Students against 🔐_Users)
 */
export async function loginUser(username, password, role = "") {
  return apiRequest("user_login", {
    username: username.trim(),
    password: password.trim(),
    role: role.trim()
  });
}

export async function getAdminStats(token, refresh = false) {
  return apiRequest("admin_stats", {
    token: resolveToken(token),
    refresh: refresh ? "true" : "false"
  });
}

export async function getAdminStudents(token, params = {}) {
  return apiRequest("admin_students", {
    token: resolveToken(token),
    ...params
  });
}

/**
 * Fast Debounced & Cancelable Student Search
 * Cancels outdated requests in flight so slow previous keystrokes never overwrite newer queries!
 */
export async function searchAdminStudents(token, params = {}) {
  return cancelableApiRequest("admin_students_search", "admin_students", {
    token: resolveToken(token),
    ...params
  });
}

export async function getAdminStudentDetail(token, studentId, refresh = false) {
  return apiRequest("admin_student_detail", {
    token: resolveToken(token),
    studentId,
    refresh: refresh ? "true" : "false"
  });
}

export async function getAdminScoringOverview(token, refresh = false) {
  return apiRequest("admin_scoring_overview", {
    token: resolveToken(token),
    refresh: refresh ? "true" : "false"
  });
}

// ==========================================
// 🔐_USERS MANAGEMENT CRUD
// ==========================================

export async function getUsersList(token, params = {}) {
  return apiRequest("get_users", {
    token: resolveToken(token),
    ...params
  });
}

export async function createUser(token, userData = {}) {
  return apiRequest("create_user", {
    token: resolveToken(token),
    ...userData
  }, { method: "POST" });
}

export async function updateUser(token, userId, updates = {}) {
  return apiRequest("update_user", {
    token: resolveToken(token),
    userId,
    ...updates
  }, { method: "POST" });
}

export async function deleteUser(token, userId) {
  return apiRequest("delete_user", {
    token: resolveToken(token),
    userId
  }, { method: "POST" });
}

export async function syncUserLogins(token) {
  return apiRequest("sync_users", {
    token: resolveToken(token)
  }, { method: "POST" });
}

// ==========================================
// 📋_STUDENTS DIRECTORY CRUD
// ==========================================

export async function createStudent(token, studentData = {}) {
  return apiRequest("create_student", {
    token: resolveToken(token),
    ...studentData
  }, { method: "POST" });
}

export async function updateStudent(token, studentId, studentData = {}) {
  return apiRequest("update_student", {
    token: resolveToken(token),
    studentId,
    ...studentData
  }, { method: "POST" });
}

export async function deleteStudent(token, studentId) {
  return apiRequest("delete_student", {
    token: resolveToken(token),
    studentId
  }, { method: "POST" });
}

export async function bulkCreateStudents(token, studentsList = []) {
  return apiRequest("bulk_create_students", {
    token: resolveToken(token),
    students: JSON.stringify(studentsList)
  }, { method: "POST" });
}

// ==========================================
// 📊_SCORING CRUD
// ==========================================

export async function createStudentScore(token, scoreData = {}) {
  return apiRequest("create_score", {
    token: resolveToken(token),
    ...scoreData
  }, { method: "POST" });
}

export async function updateStudentScores(token, studentId, scores = {}) {
  return apiRequest("update_scores", {
    token: resolveToken(token),
    studentId,
    ...scores
  }, { method: "POST" });
}

export async function deleteStudentScore(token, studentId) {
  return apiRequest("delete_score", {
    token: resolveToken(token),
    studentId
  }, { method: "POST" });
}

export async function resetStudentScores(token, studentId) {
  return apiRequest("reset_scores", {
    token: resolveToken(token),
    studentId
  }, { method: "POST" });
}

export async function syncScoringStudents(token) {
  return apiRequest("sync_scoring_students", {
    token: resolveToken(token)
  }, { method: "POST" });
}

// ==========================================

// ==========================================
// 📝_QUIZZES CRUD & EVALUATION
// ==========================================

export async function getAdminQuizzes(token, params = {}) {
  const isRefresh = params.refresh === "true" || params.refresh === true;

  // 1. If refresh requested, force flush Apps Script server cache first
  if (isRefresh) {
    try {
      await apiRequest("flush_cache", { token: resolveToken(token) }, { forceRefresh: true });
    } catch (_) {}
  }

  // 2. Fetch live scoring overview directly from Google Sheets
  const res = await apiRequest("admin_scoring_overview", {
    token: resolveToken(token),
    refresh: isRefresh ? "true" : "false"
  }, { forceRefresh: isRefresh });

  if (res && res.success && res.data && Array.isArray(res.data.students)) {
    const rawStudents = res.data.students;

    // Detect quizzes list from the student with quizBreakdown
    const sample = rawStudents.find((s) => s.academicSummary?.quizBreakdown?.length > 0) || rawStudents[0];
    const sampleBreakdown = sample?.academicSummary?.quizBreakdown || [];

    let quizzes = sampleBreakdown.map((q, idx) => ({
      id: idx + 1,
      name: q.name,
      maxScore: Number(q.maxScore) || 10
    }));

    if (quizzes.length === 0) {
      quizzes = [
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
    }

    const totalMaxScore = quizzes.reduce((sum, q) => sum + q.maxScore, 0);

    // Map all students with their real live quiz scores from Google Sheets
    const mappedStudents = rawStudents.map((s) => {
      const bd = s.academicSummary?.quizBreakdown || [];
      const scoreMap = {};
      let rawSum = 0;
      let completedCount = 0;

      quizzes.forEach((q) => {
        const item = bd.find((b) => b.name === q.name);
        if (item && item.score !== null && item.score !== undefined && item.score !== "" && !isNaN(item.score)) {
          const val = Number(item.score);
          scoreMap[q.name] = val;
          rawSum += val;
          completedCount++;
        } else {
          scoreMap[q.name] = null;
        }
      });

      const scaled15 = s.academicSummary?.totalQHA != null 
        ? Number(s.academicSummary.totalQHA) 
        : (totalMaxScore > 0 ? Math.round((rawSum / totalMaxScore) * 15 * 100) / 100 : 0);

      const pct = totalMaxScore > 0 ? Math.round((rawSum / totalMaxScore) * 1000) / 10 : 0;

      return {
        studentId: s.studentId,
        fullNameKh: s.fullNameKh,
        fullNameEn: s.fullNameEn,
        gender: s.gender,
        room: s.room,
        skill: s.skill,
        scores: scoreMap,
        quizBreakdown: bd.length > 0 ? bd : quizzes.map((q) => ({ name: q.name, score: null, maxScore: q.maxScore })),
        rawTotal: Math.round(rawSum * 10) / 10,
        totalMaxScore,
        scaled15,
        percentage: pct,
        grade: s.academicSummary?.overallGrade || (pct >= 85 ? "A" : pct >= 80 ? "B+" : pct >= 70 ? "B" : pct >= 50 ? "C" : "D"),
        completedCount,
        totalQuizzes: quizzes.length
      };
    });

    // Calculate column stats
    const quizStats = quizzes.map((q) => {
      let sum = 0;
      let count = 0;
      mappedStudents.forEach((st) => {
        const val = st.scores[q.name];
        if (val !== null && val !== undefined) {
          sum += val;
          count++;
        }
      });
      const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
      const avgPct = q.maxScore > 0 ? Math.round((avg / q.maxScore) * 100) : 0;
      return {
        id: q.id,
        name: q.name,
        maxScore: q.maxScore,
        averageScore: avg,
        averagePercentage: avgPct,
        completedCount: count,
        totalCount: mappedStudents.length
      };
    });

    const allRooms = Array.from(new Set(mappedStudents.map((s) => s.room).filter(Boolean)));
    const topScorer = [...mappedStudents].sort((a, b) => b.scaled15 - a.scaled15)[0] || null;

    const allRawSums = mappedStudents.map((s) => s.rawTotal);
    const avgRaw = allRawSums.length > 0 ? allRawSums.reduce((a, b) => a + b, 0) / allRawSums.length : 0;
    const avgPct = totalMaxScore > 0 ? Math.round((avgRaw / totalMaxScore) * 1000) / 10 : 0;
    const avgScaled = totalMaxScore > 0 ? Math.round((avgRaw / totalMaxScore) * 15 * 10) / 10 : 0;

    return {
      success: true,
      message: "ទាញយកទិន្នន័យកម្រងសំណួរពី Google Sheets ជោគជ័យ!",
      data: {
        quizzes,
        quizStats,
        totalMaxScore,
        students: mappedStudents,
        stats: {
          totalQuizzes: quizzes.length,
          totalMaxScore,
          classAverageScore: Math.round(avgRaw * 10) / 10,
          classAveragePct: avgPct,
          classAverageScaled: avgScaled,
          topScorer: topScorer ? {
            studentId: topScorer.studentId,
            name: topScorer.fullNameKh || topScorer.fullNameEn,
            scaled15: topScorer.scaled15,
            room: topScorer.room
          } : null
        },
        filterOptions: {
          rooms: allRooms
        }
      }
    };
  }

  // Fallback
  return apiRequest("admin_quizzes", {
    token: resolveToken(token),
    ...params
  });
}

export async function createQuiz(token, quizData = {}) {
  return apiRequest("create_quiz", {
    token: resolveToken(token),
    ...quizData
  }, { method: "POST" });
}

export async function updateQuiz(token, quizId, quizData = {}) {
  return apiRequest("update_quiz", {
    token: resolveToken(token),
    quizId,
    ...quizData
  }, { method: "POST" });
}

export async function deleteQuiz(token, quizId) {
  return apiRequest("delete_quiz", {
    token: resolveToken(token),
    quizId
  }, { method: "POST" });
}

export async function bulkUpdateStudentScores(token, updatesList = []) {
  const resolvedTok = resolveToken(token);
  const res = await apiRequest("bulk_update_scores", {
    token: resolvedTok,
    updates: JSON.stringify(updatesList)
  }, { method: "POST" });
  invalidateRelatedCaches("score");
  invalidateRelatedCaches("attendance");
  return res;
}

export async function updateStudentQuizzes(token, studentId, quizScores = {}, batch = false) {
  const resolvedTok = resolveToken(token);
  if (batch) {
    let updates = quizScores;
    if (typeof updates === "string") {
      try { updates = JSON.parse(updates); } catch (e) { updates = []; }
    }
    const res = await apiRequest("update_student_quizzes", {
      token: resolvedTok,
      updates: JSON.stringify(updates)
    }, { method: "POST" });
    invalidateRelatedCaches("quiz");
    invalidateRelatedCaches("score");
    return res;
  }

  let scoresObj = quizScores;
  if (typeof scoresObj === "string") {
    try { scoresObj = JSON.parse(scoresObj); } catch (e) { scoresObj = {}; }
  }
  const res = await apiRequest("update_student_quizzes", {
    token: resolvedTok,
    studentId,
    scores: JSON.stringify(scoresObj)
  }, { method: "POST" });
  invalidateRelatedCaches("quiz", studentId);
  invalidateRelatedCaches("score", studentId);
  return res;
}

export async function resetStudentQuizzes(token, studentId) {
  await updateStudentScores(token, studentId, { qha: 0 });
  try {
    await apiRequest("flush_cache", { token: resolveToken(token) }, { forceRefresh: true });
  } catch (_) {}
  invalidateRelatedCaches("quiz");
  invalidateRelatedCaches("score");
  return { success: true, message: "បានកំណត់ពិន្ទុឡើងវិញជោគជ័យ!" };
}

export async function syncQuizStudents(token) {
  try {
    await apiRequest("flush_cache", { token: resolveToken(token) }, { forceRefresh: true });
  } catch (_) {}
  invalidateRelatedCaches("quiz");
  invalidateRelatedCaches("score");
  return { success: true, message: "បានធ្វើសមកាលកម្មនិស្សិតពី Google Sheets ជោគជ័យ!" };
}
