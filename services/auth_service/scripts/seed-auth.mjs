import dotenv from "dotenv";
import pg from "pg";
import { ensureAuthSchema } from "../src/db/ensureAuthSchema.js";
import { hashPassword } from "../src/lib/password.js";

dotenv.config();

const SEED_USERS = [
  {
    email: "admin@codedesign.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    phone: "+84123450000",
    headline: "System Administrator",
  },
  {
    email: "freelancer1@codedesign.com",
    password: "freelancer123",
    name: "John Developer",
    role: "freelancer",
    phone: "+84123451111",
    headline: "Full-stack Solution Architect",
  },
  {
    email: "freelancer2@codedesign.com",
    password: "freelancer123",
    name: "Jane Designer",
    role: "freelancer",
    phone: "+84123452222",
    headline: "Senior UI/UX & Branding Expert",
  },
  {
    email: "client1@codedesign.com",
    password: "client123",
    name: "Client One",
    role: "client",
    phone: "+84123453333",
    headline: "Product Owner",
  },
  {
    email: "client2@codedesign.com",
    password: "client123",
    name: "Client Two",
    role: "client",
    phone: "+84123454444",
    headline: "Startup Founder",
  },
  {
    email: "freelancer3@codedesign.com",
    password: "freelancer123",
    name: "Linh Product",
    role: "freelancer",
    phone: "+84987654321",
    headline: "Product Designer & No-code Builder",
  },
  {
    email: "dev1@codedesign.com",
    password: "freelancer123",
    name: "Minh Backend",
    role: "freelancer",
    phone: "+84901234567",
    headline: "Senior Backend Engineer",
  },
  {
    email: "dev2@codedesign.com",
    password: "freelancer123",
    name: "Anh Frontend",
    role: "freelancer",
    phone: "+84901234568",
    headline: "React & Vue.js Specialist",
  },
  {
    email: "dev3@codedesign.com",
    password: "freelancer123",
    name: "Huy Fullstack",
    role: "freelancer",
    phone: "+84901234569",
    headline: "Full-stack JavaScript Developer",
  },
  {
    email: "designer1@codedesign.com",
    password: "freelancer123",
    name: "Lan UI Designer",
    role: "freelancer",
    phone: "+84901234570",
    headline: "UI Designer & Prototyping Expert",
  },
  {
    email: "designer2@codedesign.com",
    password: "freelancer123",
    name: "Hoa Brand Designer",
    role: "freelancer",
    phone: "+84901234571",
    headline: "Brand Identity & Logo Designer",
  },
  {
    email: "designer3@codedesign.com",
    password: "freelancer123",
    name: "Mai UX Researcher",
    role: "freelancer",
    phone: "+84901234572",
    headline: "UX Researcher & Interaction Designer",
  },
];

/*
Arg:
     -----
Return:
     Seed user mặc định (ON CONFLICT email DO NOTHING).
*/

async function main() {
  const pool = new pg.Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/auth_db",
  });
  await ensureAuthSchema(pool);
  for (const u of SEED_USERS) {
    const passwordHash = await hashPassword(u.password);
    await pool.query(
      `INSERT INTO users (email, password_hash, name, role, phone, headline, is_verified, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [u.email, passwordHash, u.name, u.role, u.phone, u.headline]
    );
  }
  console.error("✓ Auth database seeded");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
