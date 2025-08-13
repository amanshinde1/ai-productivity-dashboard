export function generateClientSideAIInsights(dashboardData) {
  if (!dashboardData) {
    return ["No dashboard data available to generate insights."];
  }

  const tips = [];

  // Safely get tasksList: accept either tasks array or dashboard object
  const tasksList = Array.isArray(dashboardData)
    ? dashboardData
    : Array.isArray(dashboardData.tasks)
    ? dashboardData.tasks
    : [];

  // Dashboard-level stats with safe defaults
  const focusPercent = typeof dashboardData.focusPercent === "number" ? dashboardData.focusPercent : 0;
  const percentOfTarget = typeof dashboardData.percentOfTarget === "number" ? dashboardData.percentOfTarget : 0;
  const taskBreakdown = dashboardData.taskBreakdown;

  if (focusPercent > 80) {
    tips.push("Excellent focus this week! Maintain this momentum.");
  } else if (focusPercent < 40) {
    tips.push("Low focus time detected — try scheduling distraction-free blocks.");
  }

  if (percentOfTarget < 50) {
    tips.push("You’re behind on your target — prioritise high-impact tasks.");
  } else {
    tips.push("You're on track to hit your weekly target!");
  }

  if ((taskBreakdown?.datasets?.[0]?.data?.[1] || 0) > 5) {
    tips.push("Many pending tasks — consider breaking them into manageable subtasks.");
  }

  // Safely filter tasksList for overdue tasks
  const overdueTasks = tasksList.filter(task => String(task.status).toLowerCase() === "overdue").length;

  if (overdueTasks > 0) {
    tips.push(`You have ${overdueTasks} overdue ${overdueTasks > 1 ? "tasks" : "task"} — address these first.`);
  }

  // Always return at least one tip
  return tips.length > 0 ? tips : ["Stay consistent and keep tracking your progress!"];
}
