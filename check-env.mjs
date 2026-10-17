import fs from "fs";

const checks = [
  { file: "backend/.env", must: ["DATABASE_URL", "JWT_SECRET", "REDIS_URL"] },
  { file: "frontend/.env.local", must: ["AUTH_SECRET", "NEXT_PUBLIC_API_URL"] },
];

let allGood = true;

for (const { file, must } of checks) {
  if (!fs.existsSync(file)) {
    console.log(`❌ Missing: ${file}`);
    allGood = false;
    continue;
  }
  const content = fs.readFileSync(file, "utf-8");
  for (const key of must) {
    if (!content.includes(key)) {
      console.log(`❌ ${file} missing: ${key}`);
      allGood = false;
    }
  }
  console.log(`✅ ${file} OK`);
}

process.exit(allGood ? 0 : 1);