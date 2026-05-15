import { randomBytes } from "crypto";

/*
Arg:
     -----
Return:
     Chuỗi token ngẫu nhiên URL-safe (~43 ký tự).
*/

export function generateUrlSafeToken() {
  return randomBytes(32).toString("base64url");
}
