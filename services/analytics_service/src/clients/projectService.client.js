import { env } from "../config/env.js";

/*
Arg:
     projectId: id project trên project-service.
Return:
     Chuỗi project_type/type đã lower-case hoặc null nếu không lấy được.
*/

export async function resolveProjectTypeById(projectId) {
  if (!projectId) {
    return null;
  }
  const url = `${env.projectServiceUrl.replace(/\/$/, "")}/api/v1/projects/${projectId}`;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const projectType = data?.project_type ?? data?.type;
    if (projectType) {
      return String(projectType).toLowerCase();
    }
  } catch (err) {
    console.error(`resolveProjectTypeById error: ${err.message}`);
  }
  return null;
}
