const path = require("path");
const os = require("os");
const fs = require("fs");
const fsp = require("fs/promises");
const XLSX = require("xlsx");
const archiver = require("archiver");
const cron = require("node-cron");
const Student = require("../models/student");
const Fees = require("../models/fees");
const SystemUser = require("../models/systemUser");
const { sendBackupEmail } = require("./emailService");

const BACKUP_COLLECTIONS = [
  { name: "student", model: Student },
  { name: "fees", model: Fees },
];

const BACKUP_FOLDER_NAME = "student_backup";
const BACKUP_STATE_FILE = "backup_state.json";

let isRunning = false;

function getBackupDir() {
  return path.join(os.homedir(), "Documents", BACKUP_FOLDER_NAME);
}

function formatDateTime(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}.${min}`;
}

function formatMonthKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function sanitizeFileName(value) {
  const base = value && String(value).trim() ? String(value).trim() : "institute";
  return base.replace(/[<>:"/\\|?*]/g, "_");
}

function stringifyComplex(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value) || (value && typeof value === "object")) {
    return JSON.stringify(value, (key, val) =>
      val instanceof Date ? val.toISOString() : val
    );
  }
  return value;
}

function normalizeRow(record) {
  const row = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === "_id" && value) {
      row[key] = String(value);
      continue;
    }
    row[key] = stringifyComplex(value);
  }
  return row;
}

async function ensureBackupDir() {
  const dir = getBackupDir();
  await fsp.mkdir(dir, { recursive: true });
  return dir;
}

async function readBackupState(dir) {
  const statePath = path.join(dir, BACKUP_STATE_FILE);
  try {
    const raw = await fsp.readFile(statePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

async function writeBackupState(dir, state) {
  const statePath = path.join(dir, BACKUP_STATE_FILE);
  await fsp.writeFile(statePath, JSON.stringify(state, null, 2));
}

async function buildWorkbook() {
  const workbook = XLSX.utils.book_new();
  for (const collection of BACKUP_COLLECTIONS) {
    const docs = await collection.model.find({}).lean({ virtuals: false });
    const rows = docs.map(normalizeRow);
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, collection.name);
  }
  return workbook;
}

function createZip({ zipPath, files }) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    files.forEach((file) => {
      archive.file(file.path, { name: file.name });
    });
    archive.finalize();
  });
}

async function runBackup({ reason }) {
  if (isRunning) {
    return;
  }
  isRunning = true;
  try {
    const systemUser = await SystemUser.findOne(
      {},
      "name email instituteName"
    );
    if (!systemUser) {
      console.warn("Backup skipped: no system user found.");
      return;
    }

    const backupDir = await ensureBackupDir();
    const now = new Date();
    const formattedDate = formatDateTime(now);
    const instituteName = sanitizeFileName(systemUser.instituteName);
    const baseName = `${instituteName}_backup_${formattedDate}`;

    const workbook = await buildWorkbook();
    const excelName = `${baseName}.xlsx`;
    const excelPath = path.join(backupDir, excelName);
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });
    await fsp.writeFile(excelPath, excelBuffer);

    const zipName = `${baseName}.zip`;
    const zipPath = path.join(backupDir, zipName);
    await createZip({
      zipPath,
      files: [{ path: excelPath, name: excelName }],
    });

    const tables = BACKUP_COLLECTIONS.map((c) => c.name);
    await sendBackupEmail({
      to: systemUser.email,
      name: systemUser.name,
      instituteName: systemUser.instituteName,
      backupDateTime: formattedDate,
      fileName: zipName,
      filePath: zipPath,
      tables,
    });

    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    if (fromEmail && fromEmail.toLowerCase() !== systemUser.email.toLowerCase()) {
      await sendBackupEmail({
        to: fromEmail,
        name: systemUser.name,
        instituteName: systemUser.instituteName,
        backupDateTime: formattedDate,
        fileName: zipName,
        filePath: zipPath,
        tables,
      });
    }

    await fsp.unlink(excelPath).catch(() => {});
    await writeBackupState(backupDir, {
      lastBackupAt: now.toISOString(),
      lastBackupMonth: formatMonthKey(now),
      reason,
    });

    console.log(`Backup completed: ${zipPath}`);
  } catch (err) {
    console.error("Backup failed:", err);
  } finally {
    isRunning = false;
  }
}

async function runMonthlyBackupIfNeeded(reason) {
  const backupDir = await ensureBackupDir();
  const state = await readBackupState(backupDir);
  const currentMonth = formatMonthKey(new Date());
  if (state.lastBackupMonth === currentMonth) {
    return;
  }
  await runBackup({ reason });
}

async function initBackupScheduler() {
  await runMonthlyBackupIfNeeded("startup");
  cron.schedule("5 0 1 * *", () => {
    runMonthlyBackupIfNeeded("scheduled").catch((err) => {
      console.error("Scheduled backup failed:", err);
    });
  });
}

module.exports = {
  initBackupScheduler,
};
