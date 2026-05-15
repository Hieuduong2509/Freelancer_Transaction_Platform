import { env } from "../config/env.js";

/*
Arg:
     userId: id user.
     profile: Object JSON (display_name, email, …).
Return:
     void — lỗi mạng chỉ log (giữ hành vi Python).
*/

export async function syncUserProfilePut(userId, profile) {
  const base = env.userServiceUrl.replace(/\/$/, "");
  const url = `${base}/api/v1/users/${userId}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
      signal: controller.signal,
    });
  } catch (err) {
    console.error(`Warning: failed to sync profile for user ${userId}:`, err);
  } finally {
    clearTimeout(t);
  }
}
