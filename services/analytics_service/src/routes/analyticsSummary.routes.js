import * as eventRepository from "../repositories/event.repository.js";
import * as metricRepository from "../repositories/metric.repository.js";

/*
Arg:
     fastify instance.
Return:
     Đăng ký GET /summary.
*/

export async function registerAnalyticsSummaryRoutes(fastify) {
  fastify.get("/summary", async () => {
    const totalUsers = await eventRepository.countDistinctUserIds();
    const totalProjects = await eventRepository.countByEventType(
      "project.created"
    );
    const { total: totalRevenue, rows: metricRows } =
      await metricRepository.getRevenueRowsForSummary();

    const revenueSplit = { gig: 0, bidding: 0, unknown: 0 };
    for (const row of metricRows) {
      const value = row.value || 0;
      const meta = row.meta_data;
      const projectType =
        meta && typeof meta === "object" ? meta.project_type : null;
      if (projectType && String(projectType).toLowerCase().includes("gig")) {
        revenueSplit.gig += value;
      } else if (
        projectType &&
        String(projectType).toLowerCase().includes("bidding")
      ) {
        revenueSplit.bidding += value;
      } else {
        revenueSplit.unknown += value;
      }
    }

    return {
      total_users: totalUsers,
      total_projects: totalProjects,
      total_revenue: totalRevenue,
      revenue_split: revenueSplit,
      top_skills: [],
    };
  });
}
